import datetime as dt
import os
import json
import asyncio
import re
import logging
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, field
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up environment
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gcs_key.json"

from google.cloud import storage
GCS_BUCKET = os.getenv("GCS_BUCKET", "merg-testing")

import pathlib
import shutil

# Use a local downloads directory in the current working directory
DOWNLOAD_DIR = pathlib.Path("downloads")
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

import os, sys, textwrap, re, json, time, asyncio, tempfile, pathlib, hashlib, warnings
from typing import TypedDict, List, Dict, Any

# Ensure API key is set via environment; raise error if missing
if "OPENAI_API_KEY" not in os.environ:
    raise RuntimeError("OPENAI_API_KEY environment variable not set")

TOPK, MAX_WORKERS, MAX_ITER, WORKER_STEPS = 3, 2, 4, 3
LINK_LIMIT = 100      # how many <a href> tags the sub-LLM wiHll inspect
DEBUG = True

import ray, nest_asyncio
nest_asyncio.apply()
ray.shutdown(); ray.init(ignore_reinit_error=True, num_cpus=MAX_WORKERS, log_to_driver=False)

from playwright.async_api import async_playwright
from duckduckgo_search import DDGS
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.graph import StateGraph

TINY_LLM = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0.2)
PLAN_LLM = ChatOpenAI(model="gpt-4o-mini",        temperature=0.0)

def extract_json_list(text: str) -> List[str]:
    m = re.search(r"\[[^\]]+\]", text, re.S)
    if not m: return []
    try: return json.loads(m.group(0))
    except Exception: return []

async def click_reason(page):
    links = await page.eval_on_selector_all(
        "a[href]",
        f"els => els.slice(0, {LINK_LIMIT}).map(e => {{return {{text:e.innerText.trim(), href:e.href}}}})"
    )
    title  = await page.title()
    prompt = textwrap.dedent(f"""
        You are a focused helper. Your job is to choose the ONE link that is
        most likely a direct media download (mp4, mkv, avi, torrent) or a magnet link.

        Page title: {title}
        Links (first 20):
        {json.dumps(links, indent=2)}

        Answer with EITHER the single link OR the word STOP.
    """).strip()

    tiny = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0.2)
    resp = (await tiny.ainvoke(prompt)).content.strip()

    if DEBUG:
        print("\n─── sub-LLM PROMPT ─────────────────────────────────────")
        print(prompt)
        print("─── sub-LLM RESP ───────────────────────────────────────")
        print(resp, "\n")

    return resp.split()[0]

async def worker_job(url: str) -> dict:
    t0 = time.time()
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        page    = await browser.new_page()

        try:
            await page.goto(url, timeout=45_000)
            if DEBUG: print(f"Visiting {page.url[:90]}")

            for _ in range(WORKER_STEPS):
                if page.url.startswith("magnet:") or re.search(r"\.(mp4|mkv|avi|torrent)$", page.url):
                    break
                href = await click_reason(page)
                if DEBUG: print("   ↪ click →", href[:90])
                if href.lower().startswith("stop"): break
                await page.goto(href, timeout=30_000)

            final_url = page.url

            if not (final_url.startswith("magnet:") or re.search(r"\.(mp4|mkv|avi|torrent)$", final_url)):
                await browser.close()
                return {"status": "failed", "reason": "no_direct_link"}

            size, path = -1, None
            if not final_url.startswith("magnet:"):
                resp  = await page.context.request.get(final_url, timeout=60_000)
                if not resp.ok:
                    await browser.close()
                    return {"status": "failed", "reason": f"http {resp.status}"}

                data  = await resp.body()

                # local writings
                ext  = pathlib.Path(final_url).suffix or ".bin"
                name = hashlib.sha256(final_url.encode()).hexdigest()[:40] + ext
                dest = DOWNLOAD_DIR / name
                dest.write_bytes(data)
                size, path = dest.stat().st_size, str(dest)

                # uploading to gcs
                gcs_client = storage.Client() 
                bucket     = gcs_client.bucket(GCS_BUCKET)
                blob       = bucket.blob(name)

                blob.upload_from_filename(dest)
                signed_url = blob.generate_signed_url(
                    expiration=dt.timedelta(days=1),
                    method="GET", 
                )


                sha = hashlib.sha256(final_url.encode()).hexdigest()
                await browser.close()
                return dict(
                    status  = "ok",
                    url     = final_url,
                    path    = path,
                    gcs_url = signed_url,
                    size    = size,
                    hash    = sha,
                    elapsed = round(time.time() - t0, 2)
                )
        except Exception as e:
            await browser.close()
            return {"status": "failed", "reason": repr(e)}

@ray.remote
def site_worker(url: str):
    return asyncio.run(worker_job(url))

@tool(description="DuckDuckGo search (JSON API) with exponential back-off.")
def web_search(query: str, max_results: int = TOPK) -> list:
    backoff, urls = 2, []
    with DDGS() as d:
        for attempt in range(6):
            try:
                urls = [r["href"] for r in d.text(query,
                                                  max_results=max_results,
                                                  backend="lite")]
                if urls: break
            except Exception:
                if DEBUG: print(f"DDG timeout → retrying in {backoff}s")
                time.sleep(backoff)
                backoff *= 2
    return urls[:max_results]

@tool(description="Spawn a headless browser worker that tries to fetch direct media.")
def fetch_media(url: str) -> dict:
    return ray.get(site_worker.remote(url))

@dataclass
class S:
    query: str
    iter: int
    bad_urls: List[str] = field(default_factory=list)
    websocket_manager: Any = None
    next: str | None = None
    job_id: str = ""
    scratchpad: List[Dict[str, str]] = field(default_factory=list)
    last_obs: str = ""
    search_terms: List[str] = field(default_factory=list)
    candidates: List[str] = field(default_factory=list)
    results: Dict[str, Any] = field(default_factory=dict)
    verified: List[Any] = field(default_factory=list)
    best: Dict[str, Any] = field(default_factory=dict)
    logs: List[Dict[str, str]] = field(default_factory=list)

    async def log(self, message: str, type: str = "info"):
        """Log a message and broadcast it via WebSocket if available."""
        timestamp = dt.datetime.utcnow().isoformat()
        log_entry = {
            "type": type, 
            "message": message, 
            "timestamp": timestamp
        }
        
        self.logs.append(log_entry)
        logger.info(f"[{type.upper()}] {message}")
        
        if self.websocket_manager:
            await self.websocket_manager.broadcast(self.job_id, {
                "type": "log",
                "message": message,
                "timestamp": timestamp,
                "level": type
            })

def planner(s: S):
    # Initialize state on first run
    if not s.scratchpad:
        s.scratchpad, s.search_terms, s.last_obs = [], [s.query], "Bootstrapping."

    history = "\n".join(
        f"Thought: {t['thought']}\nAction: {t['action']}\nObservation: {t['observation']}"
        for t in s.scratchpad
    ) or "None yet."

    prompt = textwrap.dedent(f"""
        You are a research agent tasked with finding publicly available
        sources for the media below.

        Title / query:  {s.query}

        Scratchpad so far:
        {history}

        Latest observation:
        {s.last_obs}

        Respond with EITHER

        1.  Thought: <why next search should help>
            Action: Search["<query 1>", "<query 2>", ...]

        OR

        2.  Thought: <why a given URL is a valid answer>
            Action: Finish["<url>"]
    """).strip()

    resp = PLAN_LLM.invoke(prompt).content.strip()

    if DEBUG:
        print("\n════════════ PLANNER PROMPT ════════════")
        print(prompt)
        print("════════════ PLANNER RESPONSE ══════════")
        print(resp, "\n")

    thought = re.search(r"Thought:\s*(.*)", resp, re.S)
    action  = re.search(r"Action:\s*(.*)",  resp, re.S)
    if not (thought and action):
        s.last_obs = "Planner produced malformed output – retrying."
        return s

    thought, action = thought.group(1).strip(), action.group(1).strip()
    s.scratchpad.append({"thought": thought, "action": action, "observation": s.last_obs})

    if action.startswith("Search"):
        queries = extract_json_list(action) or [s.query]
        queries = [q if re.search(r"(mp4|mkv|torrent|download)", q, re.I) else q + " download"
                   for q in queries]
        s.search_terms = queries
    elif action.startswith("Finish"):
        url = extract_json_list(action)[0]
        s.best = {"url": url}
        s.verified = [("manual", s.best)]

    return s

def search(s: S):
    bad = set(s.bad_urls or [])
    urls = []
    for q in s.search_terms:
        urls += web_search.run(q, max_results=TOPK)
    urls = [u for u in urls if u not in bad]

    if not urls:
        s.last_obs, s.iter = "No more candidates.", MAX_ITER
        return s

    s.candidates = urls[:MAX_WORKERS]
    if DEBUG:
        print("CANDIDATES")
        for u in s.candidates:
            print("   •", u[:100])
    return s

def fetch(s: S):
    """Fetch candidate URLs in parallel. Any Ray worker failure is caught and
    converted into a failed result instead of crashing the whole graph."""
    results = {}
    for u in s.candidates:
        try:
            results[u] = fetch_media.run(u)
        except Exception as e:
            # Gracefully handle Ray worker crashes / timeouts / OOMs
            if DEBUG:
                print(f"⚠️  worker failed for {u[:80]} → {e.__class__.__name__}: {e}")
            results[u] = {"status": "failed", "reason": repr(e)}
    s.results = results
    if DEBUG:
        print("\n⬇️  FETCH RESULTS")
        for u, r in s.results.items():
            print(u[:80], "→", r.get("status","?"), f"({r.get('size','?')} B)")
    return s

def verify(s: S):
    ok, lines = [], []
    for u, r in s.results.items():
        if r["status"] == "ok":
            ok.append((u, r))
            lines.append(f"✔ {u.split('/')[2]}")
        else:
            lines.append(f"✘ {u.split('/')[2]} ({r.get('reason','?')})")

    s.verified, s.last_obs = ok, "; ".join(lines)
    return s

def rank(s: S):
    if s.verified:
        url, r = max(s.verified, key=lambda x: (x[1].get("size", 0), x[0]))
        s.best = {"url": url, **r}
    return s

def gate(s: S):
    s.iter += 1
    if s.best or s.verified or s.iter >= MAX_ITER:
        s.next = "exit"
    else:
        s.next = "planner"
    return s

g = StateGraph(S)
g.add_node("planner", planner)
g.add_node("search",  search)
g.add_node("fetch",   fetch)
g.add_node("verify",  verify)
g.add_node("rank",    rank)
g.add_node("gate",    gate)
g.add_node("exit",    lambda s: s)

g.add_edge("planner", "search")
g.add_edge("search",  "fetch")
g.add_edge("fetch",   "verify")
g.add_edge("verify",  "rank")
g.add_edge("rank",    "gate")
g.add_conditional_edges("gate", lambda s: s.next, {"planner": "planner", "exit": "exit"})
g.set_entry_point("planner")
orch = g.compile()

# Demo

import asyncio

def rel_to_notebook(path: str | Path) -> str:
    """Convert a path to be relative to the content directory.
    This is a no-op in the API context and only used for notebook compatibility."""
    return str(path)

async def main(init: S) -> Dict[str, Any]:
    """Run the inference pipeline with the given initial state."""
    try:
        await init.log(f"Starting search for: {init.query}")
        
        # Run the orchestration
        out = await orch.ainvoke(init, config={"recursion_limit": 40})
        
        # Log the final result
        best = out.get("best", {})
        if best:
            verified_count = len(out.get('verified', []))
            await init.log(f"Search completed successfully. Found {verified_count} valid result(s).", "success")
            
            if best.get("gcs_url"):
                title = best.get('title', 'Untitled')
                size_mb = best.get('size', 0) / 1e6
                await init.log(f"Best result: {title} ({size_mb:.2f} MB)", "success")
                
                # Send the result via WebSocket
                if init.websocket_manager:
                    await init.websocket_manager.broadcast(init.job_id, {
                        "type": "result",
                        "result": {
                            "title": title,
                            "url": best["gcs_url"],
                            "size": best.get("size"),
                            "description": best.get("description", "")
                        }
                    })
        
        return {
            "status": "completed",
            "result": best,
            "logs": init.logs,
            "iterations": out.get("iter", 0),
            "verified_count": len(out.get("verified", []))
        }
    except Exception as e:
        error_msg = f"Error during search: {str(e)}"
        logger.error(error_msg, exc_info=True)
        await init.log(error_msg, "error")
        
        # Notify WebSocket clients about the error
        if init.websocket_manager:
            await init.websocket_manager.broadcast(init.job_id, {
                "type": "error",
                "message": error_msg
            })
            
        return {
            "status": "error",
            "error": str(e),
            "logs": init.logs
        }

# For backward compatibility
if __name__ == "__main__":
    import asyncio
    
    async def run():
        init = S(
            query="Big Buck Bunny 2008 1080p mp4 download",
            iter=0,
            bad_urls=[]
        )
        result = await main(init)
        print("\nSearch completed:")
        print(json.dumps(result, indent=2))
    
    asyncio.run(run())