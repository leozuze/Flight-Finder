import os

import requests
from dotenv import load_dotenv

from src.places.photos_cache import photos_cache

load_dotenv()

WIKIMEDIA_USER_AGENT = os.getenv("WIKIMEDIA_USER_AGENT", "Nuvex/1.0")
MAPILLARY_ACCESS_TOKEN = os.getenv("MAPILLARY_ACCESS_TOKEN")

WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"
MAPILLARY_API_URL = "https://graph.mapillary.com/images"

REQUEST_TIMEOUT = 6  # kept tight — this runs inline in the search request path


def _get_wikimedia_photo(place_name: str) -> str | None:
    """Best-effort: searches Wikipedia for the place name and returns the
    lead thumbnail of the top hit, in one request. Works well for
    landmarks/museums/parks with an article; returns None for most
    small/local businesses, which is expected — that's what the Mapillary
    fallback and client-side category images below are for."""
    if not place_name:
        return None

    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": place_name,
        "gsrlimit": 1,
        "prop": "pageimages",
        "piprop": "thumbnail",
        "pithumbsize": 800,
        "format": "json",
    }
    headers = {"User-Agent": WIKIMEDIA_USER_AGENT}

    try:
        resp = requests.get(WIKIPEDIA_API_URL, params=params, headers=headers, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except requests.exceptions.RequestException as e:
        print(f"[photos] Wikimedia request failed for '{place_name}': {e}")
        return None
    except ValueError as e:
        print(f"[photos] Wikimedia returned invalid JSON for '{place_name}': {e}")
        return None

    for page in data.get("query", {}).get("pages", {}).values():
        thumb = page.get("thumbnail", {}).get("source")
        if thumb:
            return thumb
    return None


def _bbox_around(lat: float, lon: float, radius_meters: int) -> str:
    # Rough degrees-per-meter conversion — fine at the small radii (tens of
    # meters) used here for a single-point lookup, not meant for large areas.
    deg = radius_meters / 111_000
    return f"{lon - deg},{lat - deg},{lon + deg},{lat + deg}"


def _get_mapillary_photo(lat: float, lon: float, radius_meters: int = 60) -> str | None:
    """Best-effort: nearest street-level image within a small bbox around
    the coordinates. This is imagery NEAR the place, not necessarily OF
    it — used only as a fallback when Wikimedia has nothing."""
    if not MAPILLARY_ACCESS_TOKEN:
        return None

    params = {
        "access_token": MAPILLARY_ACCESS_TOKEN,
        "fields": "thumb_1024_url",
        "bbox": _bbox_around(lat, lon, radius_meters),
        "limit": 1,
    }

    try:
        resp = requests.get(MAPILLARY_API_URL, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except requests.exceptions.RequestException as e:
        print(f"[photos] Mapillary request failed for ({lat}, {lon}): {e}")
        return None
    except ValueError as e:
        print(f"[photos] Mapillary returned invalid JSON for ({lat}, {lon}): {e}")
        return None

    results = data.get("data", [])
    return results[0].get("thumb_1024_url") if results else None


def get_place_photo(place_id: str, name: str, lat: float, lon: float) -> str | None:
    """One place's best-effort photo. Wikimedia first (by name), Mapillary
    second (by coordinates), None if both miss. Cached per place_id so a
    repeat search never re-hits either API for the same place. Never
    raises — a photo lookup failure must not break the places search."""
    cache_key = f"photo:{place_id}"
    cached = photos_cache.get(cache_key)
    if cached is not None:
        return cached or None  # "" is the cached "looked up, found nothing" sentinel

    photo = _get_wikimedia_photo(name)
    if not photo:
        photo = _get_mapillary_photo(lat, lon)

    photos_cache.set(cache_key, photo or "")
    return photo


def enrich_places(place_dicts: list[dict], limit: int = 12) -> list[dict]:
    """Mutates place_dicts in place, adding 'photoUrl' to the first `limit`
    entries. Beyond the limit, photoUrl is set to None and the frontend
    falls back to a category stock image — enriching every result in a
    40-place batch with 2 external calls each is too slow to do inline on
    every request."""
    for i, place in enumerate(place_dicts):
        if i >= limit:
            place["photoUrl"] = None
            continue
        place["photoUrl"] = get_place_photo(
            place.get("id"), place.get("name"), place.get("lat"), place.get("lon")
        )
    return place_dicts