"""
Exa search functionality
"""
import asyncio
from exa_py import Exa
from core.config import EXA_API_KEY
from core.state import get_current_state
from core.logging import logger

exa = Exa(api_key=EXA_API_KEY)

def search_exa(query: str, k: int = 20) -> str:
    """Return up-to-k URLs (newline-separated) with WebSocket logging."""
    current_state = get_current_state()
    
    try:
        if current_state:
            asyncio.create_task(current_state.log(f"🔍 Searching Exa for: '{query}'", "info"))
        
        results = exa.search(query=query, num_results=k).results
        urls = [r.url for r in results]
        
        if current_state and urls:
            asyncio.create_task(current_state.log(f"✅ Found {len(urls)} URLs:", "info"))
            for i, url in enumerate(urls[:5]):
                asyncio.create_task(current_state.log(f"  {i+1}. {url}", "info"))
            if len(urls) > 5:
                asyncio.create_task(current_state.log(f"  ... and {len(urls) - 5} more URLs", "info"))
        elif current_state:
            asyncio.create_task(current_state.log(f"⚠️ No URLs found for: '{query}'", "warning"))
            
        return "\n".join(urls)
    except Exception as e:
        if current_state:
            asyncio.create_task(current_state.log(f"❌ Exa search failed: {e}", "error"))
        logger.error(f"Exa search failed for '{query}': {e}")
        return ""
