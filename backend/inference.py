import os, re, json, time, asyncio, datetime as dt, hashlib, textwrap, logging
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

# --------------- basic setup -------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if "OPENAI_API_KEY" not in os.environ:
    raise RuntimeError("OPENAI_API_KEY env-var is required")
if "EXA_API_KEY" not in os.environ:
    raise RuntimeError("EXA_API_KEY env-var is required")

# --------------- third-party imports ----------------------------------------
import httpx
from exa_py               import Exa
from langchain.agents     import Tool, initialize_agent, AgentType, AgentExecutor
from langchain_openai     import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.callbacks.base import BaseCallbackHandler

# --------------- tools -------------------------------------------------------
exa = Exa(api_key=os.getenv("EXA_API_KEY"))
URL_RE = re.compile(r'https?://\S+')

def search_exa(query: str, k: int = 20) -> str:
    """Return up-to-k URLs (newline-separated)."""
    return "\n".join(r.url for r in exa.search(query=query, num_results=k).results)

PLAYABLE_CT = re.compile(
    r"^(video/|application/(x-mpegURL|vnd\.apple\.mpegurl))", re.I)
ARCHIVE_OK  = re.compile(
    r"https?://(?:archive\.org|youtu\.be|youtube\.com|vimeo\.com)", re.I)

WHITELIST = re.compile(
    r"https?://("
    r"(www\.)?youtube\.com/"
    r"|youtu\.be/"
    r"|archive\.org/"
    r"|player\.vimeo\.com/"
    r"|tubitv\.com/"
    r"|plex\.tv/"
    r"|watch\.plex\.tv/"
    r"|.*\.roku\.com/"
    r")",
    re.I,
)

PLAYABLE_CT = re.compile(r"^(video/|application/(x-mpegURL|vnd\.apple\.mpegurl))", re.I)


async def _head_ok(url: str) -> str:
    if WHITELIST.search(url):
        return "OK"

    #  try HEAD
    try:
        async with httpx.AsyncClient(
            timeout=3,
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0"},   # fewer 403s
        ) as c:
            r = await c.head(url)
        # Some sites answer 405 (Method Not Allowed) to HEAD
        if r.status_code in (301, 302):
            # follow Location once more
            loc = r.headers.get("location")
            return await _head_ok(loc) if loc else "BAD"
        if PLAYABLE_CT.search(r.headers.get("content-type", "")):
            return "OK"
        # If HEAD failed, fall back to GET first 2 KB
        async with httpx.AsyncClient(timeout=4, follow_redirects=True) as c:
            r = await c.get(url, headers={"Range": "bytes=0-2047"})
        if PLAYABLE_CT.search(r.headers.get("content-type", "")):
            return "OK"
    except Exception:
        pass
    return "BAD"


def check_playable(url: str) -> str:          # sync wrapper for LangChain
    return asyncio.run(_head_ok(url))

tools = [
    Tool(name="search_exa",
         func=search_exa,
         description="Search the web with Exa. Input: plain query string."),
    Tool(name="check_playable",
         func=check_playable,
         description="HEAD-checks a URL. Returns 'OK' or 'BAD'.")
]

# --------------- LLMs --------------------------------------------------------
VID_LLM   = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.3)
REC_LLM   = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.4)

REC_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     """You are FilmScout. Suggest **2-3** movies the user can *legally watch online*
(public-domain or Creative-Commons).  Return EACH on its own JSON line, e.g.

{{"title":"The Hitch-Hiker","year":1953,"why":"Public-domain noir classic"}}"""),
    ("human", "{question}")
])

async def recommend_titles(question: str) -> List[Dict]:
    raw = await REC_LLM.ainvoke(
        REC_PROMPT.format_prompt(question=question).to_messages()
    )

    # pick only lines that look like JSON dicts
    candidates = [
        json.loads(line)
        for line in raw.content.splitlines()
        if line.lstrip().startswith("{")
    ]

    # ⇢ keep only dicts that have BOTH 'title' and 'year'
    movies = [
        m for m in candidates
        if isinstance(m, dict) and "title" in m and "year" in m
    ]

    return movies[:3] 

# --------------- VidScout prompt --------------------------------------------
PREFIX = """
You are **VidScout**.

1. On every turn call `search_exa` **once** with a 15-25 token query
   that should surface a single film.
2. Pick ONE candidate URL and call `check_playable(url)`.
3. As soon as `check_playable` returns **OK**, reply exactly:

FINISH: <url>

Do *not* call any more tools after that. Think step-by-step.
"""
SUFFIX = "Remember: stop as soon as you have a playable link."

# --------------- logging callback -------------------------------------------

class LogHandler(BaseCallbackHandler):
    def __init__(self, state): 
        self.state = state

    def _add(self, msg: str, lvl: str = "info"):
        ts = dt.datetime.utcnow().isoformat()
        log_entry = {"type": lvl, "message": msg, "timestamp": ts}
        
        # Add to state logs
        self.state.logs.append(log_entry)
        logger.info(msg)

        # Broadcast if websocket available
        if self.state.websocket_manager:
            asyncio.create_task(
                self.state.websocket_manager.broadcast(
                    self.state.job_id,
                    {"type": "log", "message": msg, "timestamp": ts, "level": lvl}
                )
            )

    def on_llm_end(self, response, **kw):
        text = response.generations[0][0].text.strip()
        self._add(f"🧠 LLM Reasoning: {text}", "debug")

    def on_tool_start(self, tool, input_str, **kw):
        tool_name = tool.name if hasattr(tool, 'name') else str(tool)
        self._add(f"🔧 Calling {tool_name}: {input_str}", "debug")

    def on_tool_end(self, output, **kw):
        short = output if len(output) < 200 else output[:197] + "..."
        self._add(f"📋 Tool Result: {short}", "debug")

# --------------- state dataclass --------------------------------------------
@dataclass
class S:
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
    best: Optional[str] = None  # Single definition

    logs: List[Dict[str, str]] = field(default_factory=list)

    async def log(self, message: str, level: str = "info"):
        ts = dt.datetime.utcnow().isoformat()
        self.logs.append({"type": level, "message": message, "timestamp": ts})
        logger.info(f"[{level.upper()}] {message}")

        if self.websocket_manager:
            await self.websocket_manager.broadcast(
                self.job_id,
                {"type": "log", "message": message, "timestamp": ts, "level": level},
            )

# --------------- build VidScout agent ---------------------------------------
# vid_agent: AgentExecutor = initialize_agent(
#     tools=tools,
#     llm=VID_LLM,
#     agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
#     verbose=False,
#     max_iterations=4,
#     handle_parsing_errors=True,
#     agent_kwargs={
#         "prefix": PREFIX, 
#         "suffix": SUFFIX,
#         "input_variables": ["input"]  # Add this line
#     }
# )

from langchain.agents.react.agent import create_react_agent
from langchain.agents import AgentExecutor
from langchain_core.prompts import PromptTemplate

# Use a simple PromptTemplate instead of ChatPromptTemplate
prompt_template = PromptTemplate.from_template("""
{prefix}

You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}
""")

# Create the agent with the simple prompt
react_chain = create_react_agent(
    llm=VID_LLM,
    tools=tools,
    prompt=prompt_template,
)

vid_agent: AgentExecutor = AgentExecutor(
    agent=react_chain,
    tools=tools,
    verbose=False,
    max_iterations=4,
    handle_parsing_errors=True,
)

# Keep the run_vid_agent function simple
# async def run_vid_agent(prompt: str, callbacks: list) -> str:
#     try:
#         result = await asyncio.to_thread(
#             vid_agent.invoke,
#             {
#                 "input": prompt,
#                 "prefix": PREFIX.strip(),
#             },
#             {"callbacks": callbacks},
#         )
#         return result.get("output", "")
#     except Exception as e:
#         logger.error(f"VidAgent error: {e}")
#         return f"Error: {e}"

async def run_vid_agent(prompt: str, callbacks: list) -> str: 
    try:
        # callbacks must go in the keyword-only `config` argument
        result = await asyncio.to_thread(
            vid_agent.invoke,
            {"input": prompt, "prefix": PREFIX.strip()},
            config={"callbacks": callbacks},     # ✅ now taken into account
        )
        return result.get("output", "")
    except Exception as e:
        logger.error(f"VidAgent error: {e}")
        return f"Error: {e}"

# --------------- driver ------------------------------------------------------

async def run_backend(user_query: str) -> Dict[str, Any]:
    try:
        state = S(query=user_query)
        
        await state.log(f"Starting search: {user_query}")

        try:
            movies = await recommend_titles(user_query)
            await state.log(f"Planner step: {movies}")
            logger.info(f"recommend_titles returned: {movies}")
        except Exception as e:
            logger.error(f"Error in recommend_titles: {e}", exc_info=True)
            await state.log(f"Error in recommend_titles: {e}", "error")
            return {"status": "error", "logs": state.logs, "error": str(e)}
        
        if not movies:
            await state.log("FilmScout returned nothing", "error")
            return {"status": "error", "logs": state.logs}

        for mv in movies:
            try:
                await state.log(f"Trying {mv.get('title', 'Unknown')} ({mv.get('year', 'Unknown')}) …")
                
                # Create callback INSIDE the loop to ensure fresh state reference
                cb = LogHandler(state)
                
                seed = f"\"{mv.get('title', '')}\" {mv.get('year', '')} full movie watch online"
                prompt = (f"Find a playable link for \"{mv.get('title', '')}\" ({mv.get('year', '')}). "
                          f"Start with the query: {seed}")

                result: str = await run_vid_agent(prompt, [cb])

                # After agent completes, merge any additional logs from callback
                # (In case they got disconnected)
                if hasattr(cb, 'state') and cb.state.logs:
                    for log_entry in cb.state.logs:
                        if log_entry not in state.logs:
                            state.logs.append(log_entry)

                # parse VidScout response
                link = None
                if isinstance(result, str):
                    if result.lstrip().upper().startswith("FINISH:"):
                        link = result.split(":", 1)[1].strip()
                    else:
                        m = URL_RE.search(result)
                        link = m.group(0) if m else None

                if link:
                    state.best = link
                    await state.log(f"Success → {link}", "success")
                    break
                    
            except Exception as e:
                logger.error(f"Error processing movie {mv}: {e}", exc_info=True)
                await state.log(f"Error processing movie {mv}: {e}", "error")
                continue

        if not state.best:
            await state.log("No playable link found for any suggestion", "error")
            return {"status": "error", "logs": state.logs}

        return {
            "status": "completed",
            "result": {
                "title": mv.get("title", "Unknown"),
                "year":  mv.get("year", "Unknown"),
                "why":   mv.get("why", ""),
                "url":   state.best,
            },
            "logs": state.logs,  # This should now contain all the detailed logs
        }
        
    except Exception as e:
        logger.error(f"Unexpected error in run_backend: {e}", exc_info=True)
        return {"status": "error", "error": str(e), "logs": getattr(state, 'logs', [])}


main = run_backend

# --------------- ad-hoc demo -------------------------------------------------
if __name__ == "__main__":
    demo_q = "Find me a good evening movie about finance and entrepreneurship."
    out = asyncio.run(run_backend(demo_q))
    print(json.dumps(out, indent=2))