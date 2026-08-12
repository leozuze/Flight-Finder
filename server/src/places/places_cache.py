from src.flights.cache import TTLCache

PLACES_CACHE_TTL_SECONDS = 3600  # places don't shift like flight prices do — 1hr is safe

places_cache = TTLCache(default_ttl_seconds=PLACES_CACHE_TTL_SECONDS)


def build_places_cache_key(lat: float, lon: float, category: str, radius: int) -> str:
    """
    Round lat/lon to 4 decimal places (~11m precision) so near-identical
    searches (GPS jitter, map re-centering) hit the same cache entry
    instead of missing on tiny float differences.
    """
    lat_r = round(lat, 4)
    lon_r = round(lon, 4)
    return f"{lat_r}:{lon_r}:{category}:{radius}"