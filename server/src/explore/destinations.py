"""Curated destination list for the Explore feature.

Explore intentionally does NOT do a live "anywhere" search — SerpAPI/Google
Flights has no clean origin-agnostic "explore" endpoint, and looping an
unbounded destination set would blow through SerpAPI quota fast. Instead we
query fares for this fixed, hand-picked list per request (each hit cached
via TTLCache, see explore_cache.py), which keeps quota usage predictable:
one /api/explore request = at most len(DESTINATIONS) SerpAPI calls, most of
which will be cache hits after the first user of the day.

lat/lon are included so explore_search.py can pull "top places" for a
destination straight from the existing Places pipeline (search_places)
without a second geocoding round-trip.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Destination:
    code: str            # IATA code
    city: str
    country: str
    category: str        # "beach" | "city" | "mountain" | "heritage" | "adventure"
    lat: float
    lon: float


DESTINATIONS: list[Destination] = [
    Destination("DXB", "Dubai", "UAE", "city", 25.2048, 55.2708),
    Destination("BKK", "Bangkok", "Thailand", "city", 13.7563, 100.5018),
    Destination("SIN", "Singapore", "Singapore", "city", 1.3521, 103.8198),
    Destination("KUL", "Kuala Lumpur", "Malaysia", "city", 3.1390, 101.6869),
    Destination("CMB", "Colombo", "Sri Lanka", "beach", 6.9271, 79.8612),
    Destination("MLE", "Male", "Maldives", "beach", 4.1755, 73.5093),
    Destination("DPS", "Bali (Denpasar)", "Indonesia", "beach", -8.6500, 115.2167),
    Destination("KTM", "Kathmandu", "Nepal", "mountain", 27.7172, 85.3240),
    Destination("LEH", "Leh", "India", "mountain", 34.1526, 77.5771),
    Destination("IST", "Istanbul", "Turkey", "heritage", 41.0082, 28.9784),
    Destination("CAI", "Cairo", "Egypt", "heritage", 30.0444, 31.2357),
    Destination("AUH", "Abu Dhabi", "UAE", "city", 24.4539, 54.3773),
    Destination("HKT", "Phuket", "Thailand", "adventure", 7.8804, 98.3923),
    Destination("REP", "Siem Reap", "Cambodia", "heritage", 13.3671, 103.8448),
]


def get_destinations(category: str | None = None) -> list[Destination]:
    """Returns the curated list, optionally filtered by category. Used by
    explore_search.py before it starts pricing — filtering before pricing
    means a category filter also cuts SerpAPI calls, not just results."""
    if category is None:
        return DESTINATIONS
    return [d for d in DESTINATIONS if d.category == category]