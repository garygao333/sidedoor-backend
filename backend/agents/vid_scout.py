"""
Video finding agent
"""
import asyncio
from langchain.agents import Tool, AgentExecutor
from langchain.agents.react.agent import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from tools.search import search_exa
from tools.validation import check_playable
from core.config import GOOGLE_API_KEY, VIDSCOUT_PREFIX

VID_LLM = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.3,
    google_api_key=GOOGLE_API_KEY
)

tools = [
    Tool(name="search_exa",
         func=search_exa,
         description="Search the web with Exa. Input: plain query string."),
    Tool(name="check_playable",
         func=check_playable,
         description="HEAD-checks a URL. Returns 'OK' or 'BAD'.")
]

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

async def run_vid_agent(prompt: str, callbacks: list) -> str: 
    try:
        result = await asyncio.to_thread(
            vid_agent.invoke,
            {"input": prompt, "prefix": VIDSCOUT_PREFIX.strip()},
            config={"callbacks": callbacks},
        )
        return result.get("output", "")
    except Exception as e:
        from core.logging import logger
        logger.error(f"VidAgent error: {e}")
        return f"Error: {e}"