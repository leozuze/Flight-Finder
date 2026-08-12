import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

import requests

from src.flights.cache import TTLCache

GEOAPIFY_GEOCODE_URL = os.getenv("GEOAPIFY_GEOCODE_URL")
GEOAPIFY_REVERSE_GEOCODE_URL = os.getenv("GEOAPIFY_REVERSE_GEOCODE_URL")  # optional — falls back to .replace() below if unset
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")

GEOCODE_CACHE_TTL_SECONDS = 86400  # 24h — a city/place's coordinates don't meaningfully change

geocode_cache = TTLCache(default_ttl_seconds=GEOCODE_CACHE_TTL_SECONDS)


def geocode_text(query: str):
    """
    Convert a place name/address into lat/lon.
    Example: geocode_text("Pune, India") -> {"lat": 18.52, "lon": 73.85, "formatted": "Pune, Maharashtra, India"}

    Cached for GEOCODE_CACHE_TTL_SECONDS on the normalized query text. A "no
    match" result is deliberately NOT cached, so a mistyped query doesn't
    stay permanently unresolvable if the user retypes it correctly.
    """
    cache_key = query.strip().lower()
    cached = geocode_cache.get(cache_key)
    if cached is not None:
        return cached

    params = {
        "text": query,
        "apiKey": GEOAPIFY_API_KEY,
        "limit": 1
    }

    response = requests.get(GEOAPIFY_GEOCODE_URL, params=params)
    response.raise_for_status()  # throws error if request failed
    data = response.json()

    features = data.get("features", [])
    if not features:
        return None  # no match found — not cached

    top_result = features[0]["properties"]
    result = {
        "lat": top_result.get("lat"),
        "lon": top_result.get("lon"),
        "formatted": top_result.get("formatted")
    }
    geocode_cache.set(cache_key, result)
    return result


def reverse_geocode(lat: float, lon: float):
    """
    Convert coordinates back into a readable address.
    Useful if you want to show 'You searched near: <address>' on the frontend.
    """
    url = GEOAPIFY_REVERSE_GEOCODE_URL or GEOAPIFY_GEOCODE_URL.replace("search", "reverse")

    params = {
        "lat": lat,
        "lon": lon,
        "apiKey": GEOAPIFY_API_KEY
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()

    features = data.get("features", [])
    if not features:
        return None

    return features[0]["properties"].get("formatted")