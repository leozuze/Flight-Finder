import os
import requests
from dotenv import load_dotenv

from src.places.place_categories import get_osm_tag

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

OVERPASS_API_URL = os.getenv("OVERPASS_API_URL")

MAX_RADIUS_METERS = 50000  # hard cap — past this, Overpass reliably times out or gets rejected
REQUEST_TIMEOUT = 20        # seconds, kept just under Overpass's own [timeout:25]


def search_osm_places(lat: float, lon: float, category: str, radius: int = 2000):
    """
    Search OpenStreetMap (via Overpass) for places of a given category near a location.
    radius is in meters (default 2km, hard-capped at MAX_RADIUS_METERS).

    Never raises — any Overpass failure (timeout, rate limit, bad response) logs
    and returns [], so one flaky category doesn't take down the whole /places search.
    """
    tag = get_osm_tag(category)
    if tag is None:
        return []  # category not supported via OSM either

    if radius > MAX_RADIUS_METERS:
        print(f"[osm_data] radius {radius}m exceeds cap, clamping to {MAX_RADIUS_METERS}m")
        radius = MAX_RADIUS_METERS

    key, value = tag

    query = f"""
    [out:json][timeout:25];
    (
      node["{key}"="{value}"](around:{radius},{lat},{lon});
      way["{key}"="{value}"](around:{radius},{lat},{lon});
      relation["{key}"="{value}"](around:{radius},{lat},{lon});
    );
    out center;
    """
    headers = {"User-Agent": "NuveX/1.0 (leonoelzuze@gmail.com)"}

    try:
        response = requests.post(
            OVERPASS_API_URL,
            data={"data": query},
            headers=headers,
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"[osm_data] Overpass request failed for '{category}': {e}")
        return []
    except ValueError as e:  # malformed JSON body
        print(f"[osm_data] Overpass returned invalid JSON for '{category}': {e}")
        return []

    return _parse_osm_response(data)


def _parse_osm_response(data: dict):
    """
    Normalize raw Overpass JSON into the same shape places_data.py uses,
    so places_search.py can merge Geoapify + OSM results without caring where they came from.

    Elements with no OSM 'name' tag are dropped — an "Unnamed" pin is rarely
    useful as a search result, so we only keep named ones. Dropped count is
    logged so you can gauge how much of an area's OSM data is unnamed/sparse.
    """
    results = []
    dropped = 0

    for element in data.get("elements", []):
        tags = element.get("tags", {})
        name = tags.get("name")

        if not name:
            dropped += 1
            continue

        if element["type"] == "node":
            lat = element.get("lat")
            lon = element.get("lon")
        else:
            center = element.get("center", {})
            lat = center.get("lat")
            lon = center.get("lon")

        if lat is None or lon is None:
            dropped += 1
            continue

        results.append({
            "id": f"osm_{element['type']}_{element['id']}",
            "name": name,
            "lat": lat,
            "lon": lon,
            "address": tags.get("addr:full") or tags.get("addr:street"),
            "source": "osm",
        })

    if dropped:
        print(f"[osm_data] dropped {dropped} unnamed/coordinate-less OSM results")

    return results


if __name__ == "__main__":
    results = search_osm_places(18.5204, 73.8567, "Courts", radius=2000)
    print(f"Found {len(results)} results:")
    for r in results:
        print(r)