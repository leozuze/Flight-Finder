import os
from dataclasses import asdict

import requests
from dotenv import load_dotenv

from src.places.category_resolver import resolve_category
from src.places.place_categories import get_category_code, get_osm_tag
from src.places.osm_data import search_osm_places
from src.places.places_data import Place, parse_geoapify_response, dedupe_places, haversine_distance_meters
from src.places.places_cache import places_cache, build_places_cache_key
from src.places.photos import enrich_places

load_dotenv()

GEOAPIFY_PLACES_URL = os.getenv("GEOAPIFY_PLACES_URL")
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")

DEFAULT_RADIUS_METERS = 15000  # was 3000 — "near me" now searches out to 15km
MAX_RESULTS_PER_CATEGORY = 40
REQUEST_TIMEOUT = 10
DEFAULT_PHOTO_ENRICH_LIMIT = 12  # see photos.py — only the first N results get a real photo lookup


def _fetch_geoapify_places(lat: float, lon: float, category_code: str, category_label: str, radius: int) -> list[Place]:
    """
    FIX: this used to call parse_geoapify_response(data, category=category_code)
    — storing the raw Geoapify slug (e.g. "catering.restaurant") on every
    resulting Place. That's the API's taxonomy key, not something the
    frontend's category pills, filters, or image-fallback lookup ever knew
    about — all of which compare against the resolver's friendly names
    (e.g. "Restaurants"). The OSM branch in _search_single_category was
    already doing this correctly (category=category_name); this brings the
    Geoapify branch in line with it. category_code is still used for the
    actual API request param — only the label stored on the Place changes.
    """
    params = {
        "categories": category_code,
        "filter": f"circle:{lon},{lat},{radius}",
        "bias": f"proximity:{lon},{lat}",
        "limit": MAX_RESULTS_PER_CATEGORY,
        "apiKey": GEOAPIFY_API_KEY,
    }
    try:
        response = requests.get(GEOAPIFY_PLACES_URL, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"[places_search] Geoapify request failed for '{category_code}': {e}")
        return []
    except ValueError as e:
        print(f"[places_search] Geoapify returned invalid JSON for '{category_code}': {e}")
        return []

    return parse_geoapify_response(data, category=category_label)


def _search_single_category(lat: float, lon: float, category_name: str, radius: int) -> list[Place]:
    results: list[Place] = []

    geoapify_code = get_category_code(category_name)
    if geoapify_code:
        results.extend(_fetch_geoapify_places(lat, lon, geoapify_code, category_name, radius))

    osm_tag = get_osm_tag(category_name)
    if osm_tag:
        osm_raw = search_osm_places(lat, lon, category_name, radius=radius)
        results.extend([
            Place(
                id=r["id"], name=r["name"], lat=r["lat"], lon=r["lon"],
                address=r["address"], category=category_name, source="osm",
            )
            for r in osm_raw
        ])

    return results


def _search_categories(lat: float, lon: float, categories: list[str], radius: int) -> list[Place]:
    """
    Cache-or-fetch loop, extracted so search_places() (resolver-driven
    categories) and default_places.search_default_places() (fixed default
    categories) share one implementation instead of drifting apart.
    Behavior is identical to what search_places() did inline before.
    """
    all_places: list[Place] = []
    for category_name in categories:
        cache_key = build_places_cache_key(lat, lon, category_name, radius)
        cached = places_cache.get(cache_key)

        if cached is not None:
            all_places.extend([Place(**p) for p in cached])
            continue

        category_places = _search_single_category(lat, lon, category_name, radius)
        places_cache.set(cache_key, [asdict(p) for p in category_places])
        all_places.extend(category_places)

    return all_places


def _apply_real_distance(places: list[Place], user_lat: float, user_lon: float) -> None:
    """
    Overrides each place's distance with the real straight-line distance
    from the user's ACTUAL coordinates, replacing whatever
    distance-from-search-center value Geoapify/OSM attached. Needed because
    searching "cafes in NIBM" centers the search at NIBM, but the user
    isn't necessarily standing in NIBM — the distance shown on each card
    should answer "how far is this from me", not "how far is this from
    the search center".
    """
    for p in places:
        if p.lat is None or p.lon is None:
            continue
        p.distance_meters = haversine_distance_meters(user_lat, user_lon, p.lat, p.lon)


def search_places(
    lat: float,
    lon: float,
    query: str,
    radius: int = DEFAULT_RADIUS_METERS,
    user_lat: float | None = None,
    user_lon: float | None = None,
) -> dict:
    matches = resolve_category(query)
    if not matches:
        return {
            "resolvedCategories": [],
            "ambiguous": False,
            "places": [],
            "error": f"No category found for '{query}'.",
        }

    matched_categories = [name for name, _score in matches]
    all_places = _search_categories(lat, lon, matched_categories, radius)
    deduped = dedupe_places(all_places)

    if user_lat is not None and user_lon is not None:
        _apply_real_distance(deduped, user_lat, user_lon)

    place_dicts = [p.to_dict() for p in deduped]
    enrich_places(place_dicts, limit=DEFAULT_PHOTO_ENRICH_LIMIT)

    return {
        "resolvedCategories": matched_categories,
        "ambiguous": len(matched_categories) > 1,
        "places": place_dicts,
    }