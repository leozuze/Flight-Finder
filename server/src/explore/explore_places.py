"""Batches "worth seeing" place lookups (hotels / nature / attractions) for
several locations at once — the origin city plus whichever destinations
Explore is currently showing. Powers the "View all" places page so results
are scoped to the trip instead of the user's raw geolocation like
ExplorePlacesSection's inline strip.

Reuses search_places (same pipeline as /api/places) and a TTLCache (same
pattern as explore_cache.py) keyed per-location-per-category, so switching
tabs on the frontend after the first load is a cache hit, not a fresh call.
"""

import asyncio

from src.flights.cache import TTLCache
from src.places.places_search import search_places

CATEGORY_QUERIES = ["hotels", "nature", "tourist attractions"]
PER_CATEGORY_LIMIT = 6
PLACES_RADIUS_METERS = 15000
EXPLORE_PLACES_CACHE_TTL_SECONDS = 900  # same TTL as the other Explore caches

explore_places_cache = TTLCache(default_ttl_seconds=EXPLORE_PLACES_CACHE_TTL_SECONDS)

# "tourist attractions" -> "attractions" for a cleaner frontend key
_KEY_MAP = {"hotels": "hotels", "nature": "nature", "tourist attractions": "attractions"}


def _cache_key(location_code: str, query: str) -> str:
    return f"explore_places:{location_code}:{query}"


async def _search_category(location_code: str, lat: float, lon: float, query: str):
    key = _cache_key(location_code, query)
    cached = explore_places_cache.get(key)
    if cached is not None:
        return query, cached

    try:
        result = await asyncio.to_thread(
            search_places, lat=lat, lon=lon, query=query, radius=PLACES_RADIUS_METERS,
        )
        places = (result.get("places") or [])[:PER_CATEGORY_LIMIT]
    except Exception as e:
        print(f"[explore_places] '{query}' lookup failed for {location_code}: {e}")
        places = []

    explore_places_cache.set(key, places)
    return query, places


async def get_places_for_location(code: str, lat: float, lon: float) -> dict:
    """Returns {"hotels": [...], "nature": [...], "attractions": [...]},
    all three categories fetched concurrently."""
    results = await asyncio.gather(*[
        _search_category(code, lat, lon, q) for q in CATEGORY_QUERIES
    ])
    return {_KEY_MAP[q]: places for q, places in results}


async def get_explore_places(locations: list[dict]) -> list[dict]:
    """locations: [{"code", "city", "country", "lat", "lon"}, ...]
    Locations run concurrently; each is already internally concurrent
    across its 3 categories, so this is up to len(locations)*3 requests in
    flight, most of which are cache hits after the first load."""
    places_per_location = await asyncio.gather(*[
        get_places_for_location(loc["code"], loc["lat"], loc["lon"]) for loc in locations
    ])
    return [{**loc, "places": places} for loc, places in zip(locations, places_per_location)]