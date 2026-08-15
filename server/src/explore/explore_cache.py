"""TTLCache for Explore fare lookups.

Reuses the same TTLCache class as the main flight cache (src/flights/cache.py)
rather than a new caching mechanism. Destinations themselves need no cache —
they're a static in-memory list (destinations.py) with no fetch cost.

Explore is deliberately NOT date-specific like /api/search — it always prices
one fixed near-term date (see EXPLORE_DEPART_OFFSET_DAYS in explore_search.py),
so the cache key has no date component, just route + currency.
"""

from src.flights.cache import TTLCache

# 15 min — same TTL as the main flight cache. Explore fares don't need to be
# fresher than a regular search, and a longer TTL just means fewer SerpAPI
# calls across the ~14 curated routes.
EXPLORE_CACHE_TTL_SECONDS = 900

explore_cache = TTLCache(default_ttl_seconds=EXPLORE_CACHE_TTL_SECONDS)


def build_explore_cache_key(origin_code: str, destination_code: str, currency: str) -> str:
    return f"explore:{origin_code}:{destination_code}:{currency}"