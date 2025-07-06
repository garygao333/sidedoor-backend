#!/usr/bin/env python3
"""
Seed mirror sites into Redis for the crawler workers
"""

import redis
import json
import os

# Mirror sites database (simplified for MVP)
MIRROR_SITES = [
    {
        "name": "1337x",
        "url": "https://1337x.to/search/{query}/1/",
        "type": "torrent",
        "selectors": {
            "results": "tbody tr",
            "title": ".name a:nth-child(2)",
            "link": ".name a:nth-child(2)",
            "size": ".size",
            "seeders": ".seeds"
        }
    },
    {
        "name": "YTS",
        "url": "https://yts.mx/browse-movies/{query}",
        "type": "movie",
        "selectors": {
            "results": ".browse-movie-wrap",
            "title": ".browse-movie-title",
            "link": ".browse-movie-link",
            "quality": ".browse-movie-tags"
        }
    },
    {
        "name": "LibGen",
        "url": "http://libgen.rs/search.php?req={query}",
        "type": "book",
        "selectors": {
            "results": "table[rules='cols'] tr",
            "title": "td:nth-child(3) a",
            "link": "td:nth-child(10) a",
            "size": "td:nth-child(8)"
        }
    },
    {
        "name": "Sci-Hub",
        "url": "https://sci-hub.se/{query}",
        "type": "article",
        "selectors": {
            "pdf_link": "#pdf",
            "title": "title"
        }
    }
]

def seed_mirrors():
    """Seed mirror sites into Redis"""
    redis_client = redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", "6379")),
        decode_responses=True
    )
    
    print("🌱 Seeding mirror sites...")
    
    # Clear existing mirrors
    redis_client.delete("mirrors")
    
    # Add each mirror site
    for mirror in MIRROR_SITES:
        redis_client.lpush("mirrors", json.dumps(mirror))
        print(f"✅ Added {mirror['name']}")
    
    print(f"🎉 Seeded {len(MIRROR_SITES)} mirror sites")
    
    # Also set up some demo search queries
    demo_queries = [
        "Dune Part Two 2024 1080p",
        "Interstellar 2014 4K",
        "The Three Body Problem Liu Cixin",
        "Foundation Isaac Asimov",
        "GPT-4 technical report"
    ]
    
    redis_client.delete("demo_queries")
    for query in demo_queries:
        redis_client.lpush("demo_queries", query)
    
    print(f"📝 Added {len(demo_queries)} demo queries")

if __name__ == "__main__":
    seed_mirrors()
