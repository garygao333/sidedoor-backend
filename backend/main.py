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

# UPDATED IMPORT: Use the new modular inference
from inference import main as run_backend
# Remove the old S import since it's now in core/state.py
# from core.state import SearchState  # Only import if you need it

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
        # Update job status
        jobs[job_id]["status"] = "processing"
        await manager.broadcast(job_id, {"type": "status", "status": "processing"})
        
        # UPDATED CALL: Use the new modular backend
        result = await run_backend(query, manager, job_id)
        
        print(f"🔧 Main.py received result: {result}")
        
        # Handle the result format (same as before)
        if result.get("status") == "completed" and result.get("result"):
            movie_result = result["result"]
            
            # Store in the old format for backward compatibility (polling endpoint)
            jobs[job_id]["results"] = [{
                "title": movie_result.get("title", "Untitled"),
                "year": movie_result.get("year", "Unknown"),
                "why": movie_result.get("why", ""),
                "type": "video",
                "file_id": "",  # No file ID for streaming links
                "size": 0,      # No file size for streaming links
                "quality": "HD",
                "verified": True,
                "url": movie_result.get("url", "")  # Use the actual streaming URL
            }]
            
            # Update job status
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["completed_at"] = datetime.utcnow().isoformat()
            jobs[job_id]["logs"] = result.get("logs", [])  # Store logs for debugging
            
        elif result.get("status") == "error":
            # Handle error case
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["error"] = result.get("error", "Unknown error")
            jobs[job_id]["logs"] = result.get("logs", [])
            
            # Send error via WebSocket if not already sent
            await manager.broadcast(job_id, {
                "type": "error",
                "message": result.get("error", "Unknown error occurred")
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

# Optional: Add a debug endpoint to see job logs
@app.get("/api/logs/{job_id}")
async def get_job_logs(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "job_id": job_id,
        "logs": jobs[job_id].get("logs", []),
        "status": jobs[job_id]["status"]
    }

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Get port from environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    
    # Run the app
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        workers=1,     # Use 1 worker by default
        log_level="info"
    )

# import uuid
# import asyncio
# import json
# import os
# import sys
# import time
# from datetime import datetime
# from pathlib import Path
# from typing import Dict, List, Optional, Set

# from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse, FileResponse
# from fastapi.staticfiles import StaticFiles
# from pydantic import BaseModel

# # Add the backend directory to the path so we can import inference
# sys.path.append(str(Path(__file__).parent.absolute()))

# # from inference import main as run_inference, S
# from inference import run_backend, S

# app = FastAPI(title="Media Search API")

# # Set up CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # In-memory storage for job status and results
# jobs: Dict[str, Dict] = {}
# active_connections: Dict[str, Set[WebSocket]] = {}

# class SearchRequest(BaseModel):
#     q: str

# class SearchResponse(BaseModel):
#     job_id: str
#     status: str
#     message: Optional[str] = None

# class ConnectionManager:
#     def __init__(self):
#         self.active_connections: Dict[str, Set[WebSocket]] = {}

#     async def connect(self, websocket: WebSocket, job_id: str):
#         await websocket.accept()
#         if job_id not in self.active_connections:
#             self.active_connections[job_id] = set()
#         self.active_connections[job_id].add(websocket)

#     def disconnect(self, websocket: WebSocket, job_id: str):
#         if job_id in self.active_connections:
#             self.active_connections[job_id].discard(websocket)
#             if not self.active_connections[job_id]:
#                 del self.active_connections[job_id]

#     async def broadcast(self, job_id: str, message: dict):
#         if job_id in self.active_connections:
#             disconnected = set()
#             for connection in self.active_connections[job_id]:
#                 try:
#                     await connection.send_json(message)
#                 except Exception as e:
#                     print(f"Error sending message: {e}")
#                     disconnected.add(connection)
#             # Clean up disconnected clients
#             for connection in disconnected:
#                 self.disconnect(connection, job_id)

# manager = ConnectionManager()

# @app.get("/")
# async def root():
#     return {"message": "Media Search API is running"}

# @app.post("/api/ask")
# async def ask_question(request: Request):
#     try:
#         data = await request.json()
#         query = data.get("q")
#         if not query:
#             raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
        
#         # Create a new job
#         job_id = str(uuid.uuid4())
#         jobs[job_id] = {
#             "id": job_id,
#             "status": "pending",
#             "query": query,
#             "results": [],
#             "logs": [],
#             "created_at": datetime.utcnow().isoformat(),
#             "completed_at": None
#         }
        
#         # Start the search in the background
#         asyncio.create_task(process_search(job_id, query))
        
#         return {"job_id": job_id, "status": "started"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/api/poll/{job_id}")
# async def poll_job(job_id: str):
#     if job_id not in jobs:
#         raise HTTPException(status_code=404, detail="Job not found")
    
#     job = jobs[job_id]
#     return {
#         "job_id": job_id,
#         "status": job["status"],
#         "results": job["results"],
#         "query": job["query"],
#         "created_at": job["created_at"],
#         "completed_at": job["completed_at"]
#     }

# @app.websocket("/api/ws/{job_id}")
# async def websocket_endpoint(websocket: WebSocket, job_id: str):
#     if job_id not in jobs:
#         await websocket.close(code=1008, reason="Job not found")
#         return
    
#     await manager.connect(websocket, job_id)
#     try:
#         while True:
#             # Keep the connection alive
#             await asyncio.sleep(10)
#             await websocket.send_json({"type": "ping", "timestamp": time.time()})
#     except WebSocketDisconnect:
#         manager.disconnect(websocket, job_id)

# async def process_search(job_id: str, query: str):
#     try:
#         # Update job status
#         jobs[job_id]["status"] = "processing"
#         await manager.broadcast(job_id, {"type": "status", "status": "processing"})
        
#         # Run the NEW FilmScout backend (not the old inference)
#         result = await run_backend(query, manager, job_id)
        
#         print(f"🔧 Main.py received result: {result}")
        
#         # Handle the NEW result format
#         if result.get("status") == "completed" and result.get("result"):
#             movie_result = result["result"]
            
#             # Store in the old format for backward compatibility (polling endpoint)
#             jobs[job_id]["results"] = [{
#                 "title": movie_result.get("title", "Untitled"),
#                 "type": "video",
#                 "file_id": "",  # No file ID for streaming links
#                 "size": 0,      # No file size for streaming links
#                 "quality": "HD",
#                 "verified": True,
#                 "url": movie_result.get("url", "")  # Use the actual streaming URL
#             }]
            
#             # The WebSocket result is already sent by run_inference
#             # Just update job status
#             jobs[job_id]["status"] = "completed"
#             jobs[job_id]["completed_at"] = datetime.utcnow().isoformat()
            
#         elif result.get("status") == "error":
#             # Handle error case
#             jobs[job_id]["status"] = "failed"
#             jobs[job_id]["error"] = result.get("error", "Unknown error")
            
#             # Error is already sent by run_inference via WebSocket
            
#     except Exception as e:
#         print(f"Error processing job {job_id}: {str(e)}")
#         if job_id in jobs:
#             jobs[job_id]["status"] = "failed"
#             jobs[job_id]["error"] = str(e)
#             await manager.broadcast(job_id, {
#                 "type": "error",
#                 "message": f"Search failed: {str(e)}"
#             })
#     finally:
#         # Clean up after some time
#         await asyncio.sleep(300)  # Keep results for 5 minutes
#         if job_id in jobs:
#             del jobs[job_id]

# # async def process_search(job_id: str, query: str):
# #     try:
# #         # Initialize the search state
# #         init = S(
# #             query=query,
# #             iter=0,
# #             bad_urls=[],
# #             websocket_manager=manager,
# #             job_id=job_id
# #         )
        
# #         # Update job status
# #         jobs[job_id]["status"] = "processing"
# #         await manager.broadcast(job_id, {"type": "status", "status": "processing"})
        
# #         # Run the inference
# #         # result = await run_inference(init)
# #         result = await run_backend(query, manager, job_id)
        
# #         # Update job with results
# #         if result.get("status") == "completed" and result.get("result"):
# #             jobs[job_id]["results"] = [{
# #                 "title": result["result"].get("title", "Untitled"),
# #                 "type": "video",
# #                 "file_id": result["result"].get("gcs_url", "").split("/")[-1],
# #                 "size": result["result"].get("size", 0),
# #                 "quality": "HD",
# #                 "verified": True,
# #                 "url": result["result"].get("gcs_url", "")
# #             }]
        
# #         # Update job status
# #         jobs[job_id]["status"] = "completed"
# #         jobs[job_id]["completed_at"] = datetime.utcnow().isoformat()
        
# #         # Send completion message
# #         await manager.broadcast(job_id, {
# #             "type": "status",
# #             "status": "completed",
# #             "results": jobs[job_id]["results"]
# #         })
        
# #     except Exception as e:
# #         print(f"Error processing job {job_id}: {str(e)}")
# #         if job_id in jobs:
# #             jobs[job_id]["status"] = "failed"
# #             jobs[job_id]["error"] = str(e)
# #             await manager.broadcast(job_id, {
# #                 "type": "error",
# #                 "message": f"Search failed: {str(e)}"
# #             })
# #     finally:
# #         # Clean up after some time
# #         await asyncio.sleep(300)  # Keep results for 5 minutes
# #         if job_id in jobs:
# #             del jobs[job_id]

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
