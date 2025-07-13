import asyncio
import httpx
from core.config import WHITELIST, PLAYABLE_CT
from core.state import get_current_state
from core.logging import logger

async def _head_ok_robust(url: str) -> str:
    """More robust URL checking"""
    print(f"🔧 Checking URL: {url}")
    
    # Whitelist check
    if WHITELIST.search(url):
        print(f"✅ URL in whitelist: {url}")
        return "OK"
    
    # Check for known streaming patterns in URL
    streaming_indicators = [
        'archive.org', 'youtube.com', 'youtu.be', 'vimeo.com',
        'movie', 'watch', 'stream', 'video', 'film'
    ]
    
    url_lower = url.lower()
    if any(indicator in url_lower for indicator in streaming_indicators):
        print(f"✅ URL contains streaming indicators: {url}")
        return "OK"
    
    # Try actual HTTP check
    try:
        async with httpx.AsyncClient(
            timeout=10,  # Increased timeout
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
        ) as c:
            try:
                r = await c.head(url)
                if r.status_code in [200, 301, 302]:
                    print(f"✅ HEAD request successful: {url}")
                    return "OK"
            except:
                # If HEAD fails, try GET
                try:
                    r = await c.get(url, headers={"Range": "bytes=0-1023"})
                    if r.status_code in [200, 206]:
                        print(f"✅ GET request successful: {url}")
                        return "OK"
                except:
                    pass
    except Exception as e:
        print(f"❌ HTTP check failed for {url}: {e}")
    
    print(f"❌ URL failed all checks: {url}")
    return "BAD"

def check_playable(url: str) -> str:
    """Check if URL is playable"""
    current_state = get_current_state()
    
    print(f"🔧 check_playable called with: {url}")
    
    try:
        result = asyncio.run(_head_ok_robust(url))
        print(f"🔧 check_playable result: {result}")
        return result
    except Exception as e:
        print(f"❌ check_playable error: {e}")
        return "BAD"

# """
# URL validation and playability checking
# """
# import asyncio
# import httpx
# from core.config import WHITELIST, PLAYABLE_CT
# from core.state import get_current_state
# from core.logging import logger

# async def _head_ok(url: str) -> str:

#     """More lenient URL validation."""
    
#     # First, check whitelist (now expanded)
#     if WHITELIST.search(url):
#         return "OK"
    
#     # Also allow any domain that looks like a streaming site
#     streaming_patterns = [
#         r'movies?',
#         r'watch',
#         r'stream',
#         r'video',
#         r'film',
#         r'cinema',
#         r'tube',
#         r'play'
#     ]
    
#     domain_pattern = r'|'.join(streaming_patterns)
#     if re.search(domain_pattern, url, re.I):
#         # If URL contains streaming-related keywords, be more lenient
#         pass
    
#     try:
#         async with httpx.AsyncClient(
#             timeout=5,  # Increased timeout
#             follow_redirects=True,
#             headers={
#                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
#             },
#         ) as c:
            
#             # Try HEAD first
#             try:
#                 r = await c.head(url)
#                 if r.status_code == 200:
#                     content_type = r.headers.get("content-type", "").lower()
                    
#                     # More lenient content type checking
#                     if any(ct in content_type for ct in ['video', 'audio', 'stream', 'html', 'text']):
#                         return "OK"
                        
#             except Exception:
#                 pass
            
#             # If HEAD fails, try GET with range
#             try:
#                 r = await c.get(url, headers={"Range": "bytes=0-1023"})  # First 1KB
#                 if r.status_code in [200, 206]:  # 206 = Partial Content
#                     content_type = r.headers.get("content-type", "").lower()
                    
#                     # Check for video/streaming indicators
#                     if any(ct in content_type for ct in ['video', 'audio', 'stream', 'html']):
#                         return "OK"
                    
#                     # Check response content for streaming indicators
#                     content = r.text[:500].lower()
#                     if any(keyword in content for keyword in ['video', 'player', 'stream', 'movie']):
#                         return "OK"
                        
#             except Exception:
#                 pass
                
#     except Exception:
#         pass
    
#     return "BAD"

#     # if WHITELIST.search(url):
#     #     return "OK"

#     # try:
#     #     async with httpx.AsyncClient(
#     #         timeout=3,
#     #         follow_redirects=True,
#     #         headers={"User-Agent": "Mozilla/5.0"},
#     #     ) as c:
#     #         r = await c.head(url)
        
#     #     if r.status_code in (301, 302):
#     #         loc = r.headers.get("location")
#     #         return await _head_ok(loc) if loc else "BAD"
#     #     if PLAYABLE_CT.search(r.headers.get("content-type", "")):
#     #         return "OK"
        
#     #     async with httpx.AsyncClient(timeout=4, follow_redirects=True) as c:
#     #         r = await c.get(url, headers={"Range": "bytes=0-2047"})
#     #     if PLAYABLE_CT.search(r.headers.get("content-type", "")):
#     #         return "OK"
#     # except Exception:
#     #     pass
#     # return "BAD"

# def check_playable(url: str) -> str:
#     """Check if URL is playable with WebSocket logging."""
#     current_state = get_current_state()
    
#     if current_state:
#         asyncio.create_task(current_state.log(f"🔧 Checking playability: {url}", "info"))
    
#     result = asyncio.run(_head_ok(url))
    
#     if current_state:
#         if result == "OK":
#             asyncio.create_task(current_state.log(f"✅ Playable: {url}", "success"))
#         else:
#             asyncio.create_task(current_state.log(f"❌ Not playable: {url}", "warning"))
    
#     return result
