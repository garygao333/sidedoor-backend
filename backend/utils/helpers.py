"""
Utility functions and helpers
"""
import re
from core.config import URL_RE

def parse_agent_result(result: str) -> str:
    """Parse agent result to extract URL"""
    if not isinstance(result, str):
        return None
        
    if result.lstrip().upper().startswith("FINISH:"):
        return result.split(":", 1)[1].strip()
    else:
        m = URL_RE.search(result)
        return m.group(0) if m else None