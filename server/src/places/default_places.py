from src.places.places_data import dedupe_places
from src.places.places_search import _search_categories, DEFAULT_RADIUS_METERS, DEFAULT_PHOTO_ENRICH_LIMIT
from src.places.photos import enrich_places

# Fixed set shown when someone lands on Places (or later, Explore) before
# they've typed a search — must match PLACE_REGISTRY key names exactly.
# Adjust freely; these four give a reasonable "food + outdoors + culture"
# default mix without over-fetching categories.
DEFAULT_CATEGORIES = ["Restaurants", "Cafes", "Parks", "Tourist Attractions"]


def search_default_places(lat: float, lon: float, radius: int = DEFAULT_RADIUS_METERS) -> dict:
    """Same response shape as places_search.search_places(), but always
    searches DEFAULT_CATEGORIES instead of resolving free text. Used to
    populate the page before the user has searched anything."""
    all_places = _search_categories(lat, lon, DEFAULT_CATEGORIES, radius)
    deduped = dedupe_places(all_places)

    place_dicts = [p.to_dict() for p in deduped]
    enrich_places(place_dicts, limit=DEFAULT_PHOTO_ENRICH_LIMIT)

    return {
        "resolvedCategories": DEFAULT_CATEGORIES,
        "ambiguous": False,
        "places": place_dicts,
    }