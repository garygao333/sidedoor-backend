"""
State management and dataclasses
"""
import datetime as dt
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

# Global state for tools to access
current_state = None

@dataclass
class SearchState:
    query: str
    iter: int = 0 
    bad_urls: List[str] = field(default_factory=list)
    logs: List[Dict[str, Any]] = field(default_factory=list)
    websocket_manager: Optional[Any] = None   
    job_id: str = ""
    scratchpad: List[Dict[str, str]] = field(default_factory=list)
    last_obs: str = ""
    search_terms: List[str] = field(default_factory=list)
    candidates: List[str] = field(default_factory=list)
    results: Dict[str, Any] = field(default_factory=dict)
    verified: List[Any] = field(default_factory=list)
    best: Optional[str] = None

    async def log(self, message: str, level: str = "info"):
        ts = dt.datetime.utcnow().isoformat()
        self.logs.append({"type": level, "message": message, "timestamp": ts})
        
        if self.websocket_manager:
            await self.websocket_manager.broadcast(
                self.job_id,
                {"type": "log", "message": message, "timestamp": ts, "level": level},
            )

def set_current_state(state: SearchState) -> None:
    """Set the global current state for tools to access"""
    global current_state
    current_state = state

def get_current_state() -> Optional[SearchState]:
    """Get the current global state"""
    global current_state
    return current_state

def clear_current_state() -> None:
    """Clear the global state"""
    global current_state
    current_state = None
