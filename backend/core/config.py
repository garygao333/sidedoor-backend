"""
Environment variables and configuration constants
"""
import os
import re

# Environment validation
if "GOOGLE_API_KEY" not in os.environ:
    raise RuntimeError("GOOGLE_API_KEY env-var is required")
if "EXA_API_KEY" not in os.environ:
    raise RuntimeError("EXA_API_KEY env-var is required")

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
EXA_API_KEY = os.getenv("EXA_API_KEY")

# Regex patterns
URL_RE = re.compile(r'https?://\S+')
PLAYABLE_CT = re.compile(
    r"^(video/|audio/|application/(x-mpegURL|vnd\.apple\.mpegurl|x-shockwave-flash)|text/html)", 
    re.I
)
ARCHIVE_OK = re.compile(r"https?://(?:archive\.org|youtu\.be|youtube\.com|vimeo\.com)", re.I)

WHITELIST = re.compile(
    r"https?://("
    r"(www\.)?youtube\.com/"
    r"|youtu\.be/"
    r"|archive\.org/"
    r"|player\.vimeo\.com/"
    r"|vimeo\.com/"
    r"|123movies\."
    r"|123movieshd\."
    r"|123moviesfree\."
    r"|fmovies\."
    r"|putlocker\."
    r"|solarmovie\."
    r"|gomovies\."
    r"|yesmovies\."
    r"|watchseries\."
    r"|primewire\."
    r"|movie4k\."
    r"|movies123\."
    r"|hdeuropix\."
    r"|openload\."
    r"|streamango\."
    r"|vidlox\."
    r"|rapidvideo\."
    r"|streamplay\."
    r"|plex\.tv/"
    r"|watch\.plex\.tv/"
    r"|.*\.roku\.com/"
    r"|dailymotion\.com/"
    r"|metacafe\.com/"
    r"|veoh\.com/"
    r"|break\.com/"
    r"|crackle\.com/"
    r"|tubi\.tv/"
    r"|tubitv\.com/"
    r"|pluto\.tv/"
    r"|vudu\.com/"
    r"|crunchyroll\.com/"
    r"|funimation\.com/"
    r"|archive\.today/"
    r"|web\.archive\.org/"
    r")",
    re.I,
)

# Agent prompts
VIDSCOUT_PREFIX = """
You are **VidScout**. Find streaming links for movies.

STRATEGY:
1. Call `search_exa` with specific terms that find actual streaming pages
2. For each movie, try these search patterns in order:
   - "[movie title] [year] archive.org full movie"
   - "[movie title] [year] youtube full length"
   - "[movie title] [year] vimeo complete film"
   - "[movie title] [year] watch online free"

3. Pick the FIRST URL from search results and call `check_playable(url)`
4. If it returns "OK", reply: FINISH: <url>
5. If "BAD", try the NEXT URL from the same search results
6. Only search again if ALL URLs from current search fail

IMPORTANT: Test multiple URLs from each search before trying new search terms.
"""

VIDSCOUT_SUFFIX = "Remember: stop as soon as you have a playable link."
