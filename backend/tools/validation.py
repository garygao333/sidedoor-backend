"""
URL validation and playability checking
"""
import asyncio
import httpx
from core.config import WHITELIST, PLAYABLE_CT
from core.state import get_current_state
from core.logging import logger

async def _head_ok(url: str) -> str:
    if WHITELIST.search(url):
        return "OK"

    try:
        async with httpx.AsyncClient(
            timeout=3,
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0"},
        ) as c:
            r = await c.head(url)
        
        if r.status_code in (301, 302):
            loc = r.headers.get("location")
            return await _head_ok(loc) if loc else "BAD"
        if PLAYABLE_CT.search(r.headers.get("content-type", "")):
            return "OK"
        
        async with httpx.AsyncClient(timeout=4, follow_redirects=True) as c:
            r = await c.get(url, headers={"Range": "bytes=0-2047"})
        if PLAYABLE_CT.search(r.headers.get("content-type", "")):
            return "OK"
    except Exception:
        pass
    return "BAD"

def check_playable(url: str) -> str:
    """Check if URL is playable with WebSocket logging."""
    current_state = get_current_state()
    
    if current_state:
        asyncio.create_task(current_state.log(f"🔧 Checking playability: {url}", "info"))
    
    result = asyncio.run(_head_ok(url))
    
    if current_state:
        if result == "OK":
            asyncio.create_task(current_state.log(f"✅ Playable: {url}", "success"))
        else:
            asyncio.create_task(current_state.log(f"❌ Not playable: {url}", "warning"))
    
    return result
