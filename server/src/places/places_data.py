from dataclasses import dataclass
from math import radians, sin, cos, sqrt, atan2
from typing import Optional
from urllib.parse import quote_plus

from src.places.place_categories import LINEAR_FEATURE_CATEGORIES  # NEW


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two points, in meters. Shared by
    dedupe_places (proximity check) and places_search._apply_real_distance
    (real distance-from-user override)."""
    R = 6371000
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2) ** 2
    return 2 * R * atan2(sqrt(a), sqrt(1 - a))


def build_google_maps_url(name: str, address: Optional[str], lat: Optional[float], lon: Optional[float]) -> Optional[str]:
    """
    Builds a Google Maps "search" deep link (no API key required — this is
    Google's documented URL scheme, not the Places API) so the frontend can
    make a place card clickable and let Google supply photos/ratings/reviews
    that Geoapify and OSM don't provide.

    Prefers "name, address" for the best match accuracy, but Geoapify's
    "formatted" address often already starts with the place name (e.g.
    "Inox Movie Hall, Pune Station ...") — so we check first to avoid
    "Inox Movie Hall, Inox Movie Hall, ...". Falls back to just the
    address, then to raw coordinates, so a link is always produced as long
    as we have at least a location to point to.
    """
    if lat is None or lon is None:
        return None

    has_real_name = bool(name) and name != "Unnamed"

    if has_real_name and address:
        if address.strip().lower().startswith(name.strip().lower()):
            query = address
        else:
            query = f"{name}, {address}"
    elif has_real_name:
        query = name
    elif address:
        query = address
    else:
        query = f"{lat},{lon}"

    return f"https://www.google.com/maps/search/?api=1&query={quote_plus(query)}"


@dataclass
class Place:
    """
    Normalized place result. Every source (Geoapify Places API, OSM/Overpass)
    gets converted into this shape before reaching the caller, so the frontend
    never needs to know or care where a result came from.
    """
    id: str
    name: str
    lat: Optional[float]
    lon: Optional[float]
    address: Optional[str] = None
    category: Optional[str] = None      # the resolved category this result came from
    source: str = "unknown"             # "geoapify" or "osm"
    distance_meters: Optional[float] = None

    def to_dict(self) -> dict:
        """API-facing shape (camelCase) — used only for the final response, never for caching."""
        return {
            "id": self.id,
            "name": self.name,
            "lat": self.lat,
            "lon": self.lon,
            "address": self.address,
            "category": self.category,
            "source": self.source,
            "distanceMeters": self.distance_meters,
            "mapsUrl": build_google_maps_url(self.name, self.address, self.lat, self.lon),
        }


def parse_geoapify_response(data: dict, category: str) -> list[Place]:
    """Normalize a Geoapify Places API response (GeoJSON `features` list) into Place objects."""
    places = []
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        geometry = feature.get("geometry", {})
        coords = geometry.get("coordinates", [None, None])
        lon, lat = coords[0], coords[1]  # GeoJSON order is [lon, lat] — easy to flip by accident

        place_id = props.get("place_id") or f"geoapify_{props.get('name', 'unknown')}_{lat}_{lon}"

        places.append(Place(
            id=place_id,
            name=props.get("name") or props.get("address_line1") or "Unnamed",
            lat=lat,
            lon=lon,
            address=props.get("formatted"),
            category=category,
            source="geoapify",
            distance_meters=props.get("distance"),
        ))
    return places


def dedupe_places(places: list[Place], distance_threshold_meters: float = 30.0) -> list[Place]:
    """
    Geoapify and OSM sometimes index the same real-world place. Dedupe by
    name + rough proximity rather than exact id, since ids never match
    across sources anyway.

    NEW: categories in LINEAR_FEATURE_CATEGORIES (rivers, trails, cycling
    routes...) are backed by linear/area OSM geometries, not single points —
    the same named feature gets sampled as multiple nodes that can be well
    outside the normal 30m proximity radius. For those categories, same
    name alone is treated as a duplicate; the proximity check is skipped
    entirely rather than widened, since any distance threshold big enough
    to catch a long river would be too big and start merging genuinely
    different point-like places in other categories.
    """
    deduped: list[Place] = []
    for p in places:
        if p.lat is None or p.lon is None:
            deduped.append(p)
            continue
        is_dupe = False
        for existing in deduped:
            if existing.lat is None or existing.lon is None:
                continue
            same_name = existing.name.strip().lower() == p.name.strip().lower()
            if not same_name:
                continue
            if p.category in LINEAR_FEATURE_CATEGORIES or existing.category in LINEAR_FEATURE_CATEGORIES:
                is_dupe = True
                break
            if haversine_distance_meters(existing.lat, existing.lon, p.lat, p.lon) <= distance_threshold_meters:
                is_dupe = True
                break
        if not is_dupe:
            deduped.append(p)
    return deduped