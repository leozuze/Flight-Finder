"""Orchestrates Explore: single Google Travel Explore call per origin for
the bulk of pricing, topped up with a small, capped number of direct
google_flights calls for curated destinations the Explore call didn't
happen to cover. Cross-referenced against the curated list for category
tagging, then filtered by budget, capped to a handful of results, and
enriched with a "top places" teaser.

Why the top-up exists: google_travel_explore's arrival_id does NOT accept
a comma-separated list (confirmed against the API — it validates the whole
string as one code and rejects it), so there's no single-call way to force
pricing for all 14 curated destinations. The suggested-destinations call
usually covers most of them anyway; this just fills the gaps instead of
falling back to pricing all 14 individually every time.
"""

import asyncio
import os
import httpx

from src.explore.destinations import get_destinations, Destination
from src.explore.explore_cache import build_explore_cache_key
from src.flights.flight_data import find_cheapest_flight
from src.places.places_search import search_places

SERPAPI_KEY = os.environ["SERPAPI_KEY"]
SERPAPI_ENDPOINT = os.environ["SERPAPI_ENDPOINT"]

# Only ever show this many destinations on the Explore page.
MAX_RESULTS = 5
TOP_N_WITH_PLACES = 5  # matches MAX_RESULTS — every shown result gets a places teaser
PLACES_CATEGORY_FOR_EXPLORE = "attractions"
PLACES_RADIUS_METERS = 20000

# Cost guard on the top-up path — worst case (Explore misses everything)
# this is 1 + MAX_TOPUP_CALLS SerpAPI calls instead of 1 + 14.
MAX_TOPUP_CALLS = 5


def _airline_logo_url(airline_code: str | None) -> str | None:
    if not airline_code:
        return None
    return f"https://www.gstatic.com/flights/airline_logos/70px/{airline_code}.png"


async def _fetch_explore(origin_code: str, currency: str) -> list[dict]:
    """One call to Google Travel Explore's 'suggest destinations' mode —
    departure_id only, no arrival_id. Returns Google's suggested basket."""
    params = {
        "engine": "google_travel_explore",
        "departure_id": origin_code,
        "currency": currency,
        "type": "2",
        "api_key": SERPAPI_KEY,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(SERPAPI_ENDPOINT, params=params)
        resp.raise_for_status()
        return resp.json().get("destinations", [])


async def _fetch_single_route(flight_search, origin_code: str, destination: Destination,
                               currency: str, depart: str) -> dict | None:
    """Top-up path: prices one curated destination directly via google_flights,
    only called for destinations the Explore call didn't already cover."""
    result = await flight_search.check_flights(
        origin_city_code=origin_code,
        destination_city_code=destination.code,
        from_time=depart,
        trip_type="2",
        is_direct=False,
        currency=currency,
    )
    cheapest = find_cheapest_flight(result, trip_type="2")
    if cheapest.price in ("N/A", float("inf")):
        return None
    return {
        "code": destination.code,
        "city": destination.city,
        "country": destination.country,
        "category": destination.category,
        "lat": destination.lat,
        "lon": destination.lon,
        "price": cheapest.price,
        "airline": cheapest.airline,
        "airlineLogo": cheapest.airline_logo,
        "departDate": cheapest.out_date,
        "stops": cheapest.stops,
    }


async def _attach_places(lat: float, lon: float):
    try:
        result = await asyncio.to_thread(
            search_places, lat=lat, lon=lon,
            query=PLACES_CATEGORY_FOR_EXPLORE, radius=PLACES_RADIUS_METERS,
        )
        return [
            {"name": p.get("name"), "category": p.get("category")}
            for p in result.get("places", [])[:3]
        ]
    except Exception as e:
        print(f"[explore] places lookup failed for {lat},{lon}: {e}")
        return []


async def search_explore_destinations(flight_search, cache, origin_code: str,
                                       currency: str = "GBP",
                                       budget_max: float | None = None,
                                       category: str | None = None):
    key = build_explore_cache_key(origin_code, "*", currency)
    destinations = cache.get(key)
    if destinations is None:
        destinations = await _fetch_explore(origin_code, currency)
        cache.set(key, destinations)

    curated_list = get_destinations(category)
    curated_by_code = {d.code: d for d in curated_list}

    results = []
    covered_codes = set()
    for d in destinations:
        code = (d.get("destination_airport") or {}).get("code")
        curated = curated_by_code.get(code)
        if curated is None:
            continue
        price = d.get("flight_price")
        if price is None:
            continue
        covered_codes.add(code)
        results.append({
            "code": code,
            "city": curated.city,
            "country": curated.country,
            "category": curated.category,
            "lat": curated.lat,
            "lon": curated.lon,
            "price": price,
            "airline": d.get("airline"),
            "airlineLogo": _airline_logo_url(d.get("airline_code")),
            "departDate": d.get("start_date"),
            "stops": d.get("number_of_stops"),
        })

    if budget_max is not None:
        results = [r for r in results if r["price"] <= budget_max]

    # Only top up if we don't already have enough to show — no point pricing
    # a 6th, 7th, 8th destination when MAX_RESULTS caps the page at 5 anyway.
    needed = MAX_RESULTS - len(results)
    if needed > 0:
        missing = [d for d in curated_list if d.code not in covered_codes][:min(needed, MAX_TOPUP_CALLS)]
        if missing:
            depart = _default_depart_date()
            topup = await asyncio.gather(*[
                _fetch_single_route(flight_search, origin_code, d, currency, depart)
                for d in missing
            ])
            topup_results = [r for r in topup if r is not None]
            if budget_max is not None:
                topup_results = [r for r in topup_results if r["price"] <= budget_max]
            results.extend(topup_results)

    results.sort(key=lambda r: r["price"])
    results = results[:MAX_RESULTS]

    places_lists = await asyncio.gather(*[_attach_places(r["lat"], r["lon"]) for r in results])
    for r, places in zip(results, places_lists):
        r["topPlaces"] = places

    return results


def _default_depart_date() -> str:
    from datetime import datetime, timedelta
    return (datetime.now() + timedelta(days=21)).strftime("%Y-%m-%d")