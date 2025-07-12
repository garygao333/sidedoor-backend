import uuid
import asyncio
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Set

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Add the backend directory to the path so we can import inference
sys.path.append(str(Path(__file__).parent.absolute()))

from inference import main as run_inference, S

app = FastAPI(title="Media Search API")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for job status and results
jobs: Dict[str, Dict] = {}
active_connections: Dict[str, Set[WebSocket]] = {}

class SearchRequest(BaseModel):
    q: str

class SearchResponse(BaseModel):
    job_id: str
    status: str
    message: Optional[str] = None

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, job_id: str):
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = set()
        self.active_connections[job_id].add(websocket)

    def disconnect(self, websocket: WebSocket, job_id: str):
        if job_id in self.active_connections:
            self.active_connections[job_id].discard(websocket)
            if not self.active_connections[job_id]:
                del self.active_connections[job_id]

    async def broadcast(self, job_id: str, message: dict):
        if job_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[job_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending message: {e}")
                    disconnected.add(connection)
            # Clean up disconnected clients
            for connection in disconnected:
                self.disconnect(connection, job_id)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Media Search API is running"}

@app.post("/api/ask")
async def ask_question(request: Request):
    try:
        data = await request.json()
        query = data.get("q")
        if not query:
            raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
        
        # Create a new job
        job_id = str(uuid.uuid4())
        jobs[job_id] = {
            "id": job_id,
            "status": "pending",
            "query": query,
            "results": [],
            "logs": [],
            "created_at": datetime.utcnow().isoformat(),
            "completed_at": None
        }
        
        # Start the search in the background
        asyncio.create_task(process_search(job_id, query))
        
        return {"job_id": job_id, "status": "started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/poll/{job_id}")
async def poll_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    return {
        "job_id": job_id,
        "status": job["status"],
        "results": job["results"],
        "query": job["query"],
        "created_at": job["created_at"],
        "completed_at": job["completed_at"]
    }

@app.websocket("/api/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    if job_id not in jobs:
        await websocket.close(code=1008, reason="Job not found")
        return
    
    await manager.connect(websocket, job_id)
    try:
        while True:
            # Keep the connection alive
            await asyncio.sleep(10)
            await websocket.send_json({"type": "ping", "timestamp": time.time()})
    except WebSocketDisconnect:
        manager.disconnect(websocket, job_id)

async def process_search(job_id: str, query: str):
    try:
        # Initialize the search state
        init = S(
            query=query,
            iter=0,
            bad_urls=[],
            websocket_manager=manager,
            job_id=job_id
        )
        
        # Update job status
        jobs[job_id]["status"] = "processing"
        await manager.broadcast(job_id, {"type": "status", "status": "processing"})
        
        # Run the inference
        result = await run_inference(init)
        
        # Update job with results
        if result.get("status") == "completed" and result.get("result"):
            jobs[job_id]["results"] = [{
                "title": result["result"].get("title", "Untitled"),
                "type": "video",
                "file_id": result["result"].get("gcs_url", "").split("/")[-1],
                "size": result["result"].get("size", 0),
                "quality": "HD",
                "verified": True,
                "url": result["result"].get("gcs_url", "")
            }]
        
        # Update job status
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["completed_at"] = datetime.utcnow().isoformat()
        
        # Send completion message
        await manager.broadcast(job_id, {
            "type": "status",
            "status": "completed",
            "results": jobs[job_id]["results"]
        })
        
    except Exception as e:
        print(f"Error processing job {job_id}: {str(e)}")
        if job_id in jobs:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["error"] = str(e)
            await manager.broadcast(job_id, {
                "type": "error",
                "message": f"Search failed: {str(e)}"
            })
    finally:
        # Clean up after some time
        await asyncio.sleep(300)  # Keep results for 5 minutes
        if job_id in jobs:
            del jobs[job_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
