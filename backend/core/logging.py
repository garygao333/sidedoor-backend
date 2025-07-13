"""
Logging handlers and utilities
"""
import asyncio
import datetime as dt
import logging
from langchain.callbacks.base import BaseCallbackHandler

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LogHandler(BaseCallbackHandler):
    def __init__(self, state): 
        self.state = state
        self._last_tool = None

    def _add(self, msg: str, lvl: str = "info"):
        ts = dt.datetime.utcnow().isoformat()
        log_entry = {"type": lvl, "message": msg, "timestamp": ts}
        
        self.state.logs.append(log_entry)
        logger.info(msg)

        if self.state.websocket_manager:
            asyncio.create_task(
                self.state.websocket_manager.broadcast(
                    self.state.job_id,
                    {"type": "log", "message": msg, "timestamp": ts, "level": lvl}
                )
            )

    def on_llm_start(self, serialized, prompts, **kw):
        self._add(f"🧠 LLM thinking...", "debug")

    def on_llm_end(self, response, **kw):
        text = response.generations[0][0].text.strip()
        if "Thought:" in text:
            thought = text.split("Thought:")[-1].split("Action:")[0].strip()
            if thought:
                self._add(f"💭 {thought}", "debug")

    def on_tool_start(self, tool, input_str, **kw):
        tool_name = tool.name if hasattr(tool, 'name') else str(tool)
        self._last_tool = tool_name

    def on_tool_end(self, output, **kw):
        pass

    def on_agent_finish(self, finish, **kw):
        output = finish.return_values.get("output", "")
        if "FINISH:" in output.upper():
            url = output.split(":", 1)[1].strip()
            self._add(f"🎯 Agent finished with: {url}", "success")
