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
PLAYABLE_CT = re.compile(r"^(video/|application/(x-mpegURL|vnd\.apple\.mpegurl))", re.I)
ARCHIVE_OK = re.compile(r"https?://(?:archive\.org|youtu\.be|youtube\.com|vimeo\.com)", re.I)

WHITELIST = re.compile(
    r"https?://("
    r"(www\.)?youtube\.com/"
    r"|youtu\.be/"
    r"|archive\.org/"
    r"|player\.vimeo\.com/"
    r"|plex\.tv/"
    r"|watch\.plex\.tv/"
    r"|.*\.roku\.com/"
    r")",
    re.I,
)

# Agent prompts
VIDSCOUT_PREFIX = """
You are **VidScout**.

1. On every turn call `search_exa` **once** with a 15-25 token query
   that should surface a single film.
2. Pick ONE candidate URL and call `check_playable(url)`.
3. As soon as `check_playable` returns **OK**, reply exactly:

FINISH: <url>

Do *not* call any more tools after that. Think step-by-step.
"""

VIDSCOUT_SUFFIX = "Remember: stop as soon as you have a playable link."
