"""
Movie recommendation logic
"""
import json
from typing import List, Dict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import GOOGLE_API_KEY

REC_LLM = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.4,
    google_api_key=GOOGLE_API_KEY
)

REC_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     """You are FilmScout. Suggest **2-3** movies the user can *legally watch online*
from sources like Archive.org, YouTube, Vimeo, or other public domain/Creative Commons sources.

Focus on:
- Classic films (pre-1970s) that are likely in public domain
- Independent films with Creative Commons licenses  
- Educational or documentary content
- Films from Internet Archive collections

Return EACH on its own JSON line, e.g.
{{"title":"The Hitch-Hiker","year":1953,"why":"Public-domain noir classic on Archive.org"}}
{{"title":"Plan 9 from Outer Space","year":1959,"why":"Ed Wood classic available on YouTube"}}"""),
    ("human", "{question}")
])

async def recommend_titles(question: str) -> List[Dict]:
    raw = await REC_LLM.ainvoke(
        REC_PROMPT.format_prompt(question=question).to_messages()
    )

    candidates = [
        json.loads(line)
        for line in raw.content.splitlines()
        if line.lstrip().startswith("{")
    ]

    movies = [
        m for m in candidates
        if isinstance(m, dict) and "title" in m and "year" in m
    ]

    return movies[:3] 