import os

from src.flights.cache import TTLCache

PHOTO_CACHE_TTL_SECONDS = int(os.getenv("PHOTO_CACHE_TTL_SECONDS", "2592000"))  # 30 days — photos don't go stale like fares do

photos_cache = TTLCache(default_ttl_seconds=PHOTO_CACHE_TTL_SECONDS)