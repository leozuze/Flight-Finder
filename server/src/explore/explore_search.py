"""Orchestrates Explore: prices every curated destination from a given
origin, filters by budget/category, sorts cheapest-first, and attaches a
"top places" teaser to only the top few results.
"""

import asyncio
from datetime import datetime, timedelta

from src.explore.destinations import get_destinations, Destination
from src.explore.explore_cache import build_explore_cache_key
from src.flights.flight_data import find_cheapest_flight
from src.places.places_search import search_places

# Explore isn't date-specific like a real search — one fixed near-term date
# keeps the query shape (and therefore the cache key) identical regardless
# of when a user happens to open the page.
EXPLORE_DEPART_OFFSET_DAYS = 21

# Only the cheapest N destinations get a places lookup — enriching all 14
# on every request would cost 14x the Geoapify/Overpass budget for results
# most users scroll past.
TOP_N_WITH_PLACES = 6
PLACES_CATEGORY_FOR_EXPLORE = "attractions"
PLACES_RADIUS_METERS = 20000


async def _price_destination(flight_search, cache, origin_code: str,
                              destination: Destination, currency: str, depart: str):
    key = build_explore_cache_key(origin_code, destination.code, currency)
    cached = cache.get(key)
    if cached is not None:
        return destination, cached

    result = await flight_search.check_flights(
        origin_city_code=origin_code,
        destination_city_code=destination.code,
        from_time=depart,
        trip_type="2",     # one-way — Explore shows "from ₹X", not round-trip
        is_direct=False,   # widen the search; long-haul Explore routes often connect
        currency=currency,
    )
    cheapest = find_cheapest_flight(result, trip_type="2")

    price_data = None
    if cheapest.price not in ("N/A", float("inf")):
        price_data = {
            "price": cheapest.price,
            "airline": cheapest.airline,
            "airlineLogo": cheapest.airline_logo,
            "departDate": cheapest.out_date,
            "stops": cheapest.stops,
        }

    cache.set(key, price_data)
    return destination, price_data


async def _attach_places(destination: Destination):
    try:
        result = await asyncio.to_thread(
            search_places,
            lat=destination.lat,
            lon=destination.lon,
            query=PLACES_CATEGORY_FOR_EXPLORE,
            radius=PLACES_RADIUS_METERS,
        )
        return [
            {"name": p.get("name"), "category": p.get("category")}
            for p in result.get("places", [])[:3]
        ]
    except Exception as e:
        print(f"[explore] places lookup failed for {destination.city}: {e}")
        return []


async def search_explore_destinations(flight_search, cache, origin_code: str,
                                       currency: str = "GBP",
                                       budget_max: float | None = None,
                                       category: str | None = None):
    candidates = get_destinations(category)
    by_code = {d.code: d for d in candidates}
    depart = (datetime.now() + timedelta(days=EXPLORE_DEPART_OFFSET_DAYS)).strftime("%Y-%m-%d")

    priced = await asyncio.gather(*[
        _price_destination(flight_search, cache, origin_code, dest, currency, depart)
        for dest in candidates
    ])

    results = []
    for destination, price_data in priced:
        if price_data is None:
            continue
        if budget_max is not None and price_data["price"] > budget_max:
            continue
        results.append({
            "code": destination.code,
            "city": destination.city,
            "country": destination.country,
            "category": destination.category,
            "lat": destination.lat,
            "lon": destination.lon,
            **price_data,
        })

    results.sort(key=lambda r: r["price"])

    top = results[:TOP_N_WITH_PLACES]
    places_lists = await asyncio.gather(*[_attach_places(by_code[r["code"]]) for r in top])
    for r, places in zip(top, places_lists):
        r["topPlaces"] = places
    for r in results[TOP_N_WITH_PLACES:]:
        r["topPlaces"] = []

    return results