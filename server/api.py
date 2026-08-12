import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, date

import httpx
from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.flights.airport_board import AirportBoard
from src.flights.cache import TTLCache
from src.flights.data_manager import DataManager
from src.flights.flight_data import find_all_flights_sorted, find_cheapest_flight
from src.flights.flight_search import FlightSearch
from src.places.places_search import search_places
from src.places.default_places import search_default_places
from src.places.geocoding import geocode_text, reverse_geocode
from src.places.osm_data import MAX_RADIUS_METERS as PLACES_MAX_RADIUS_METERS

TRIP_TYPE_MAP = {"round": "1", "oneway": "2"}
CLASS_MAP = {"economy": "1", "premium": "2", "business": "3", "first": "4"}

SEARCH_WINDOW_DAYS = 30  # only used by the /api/flights quick-search path
FLIGHT_CACHE_TTL_SECONDS = 900  # 15 min — flight prices don't meaningfully change faster than this

# Return-date fallback offsets, closest to the user's chosen date first.
# Only the return date flexes — depart date is never changed here.
DATE_FALLBACK_OFFSETS = [0, 1, -1, 2, -2, 3, -3]

# Grace window for the "depart date can't be in the past" check. date.today()
# runs in the server's timezone, so a user in a timezone behind the server's
# can pick a date that's genuinely "today" for them but already looks like
# "yesterday" once the server has rolled into its next day. A 1-day grace
# window absorbs that skew without a full client-timezone handshake, while
# still rejecting dates that are clearly in the past.
DEPART_DATE_GRACE_DAYS = 1


@asynccontextmanager
async def lifespan(app: FastAPI):
    """One shared async HTTP client + connection pool for the app's whole
    lifetime, instead of opening/closing a connection on every request."""
    async with httpx.AsyncClient() as client:
        app.state.flight_search = FlightSearch(client)
        app.state.data_manager = DataManager(client)
        app.state.airport_board = AirportBoard(client)
        app.state.flight_cache = TTLCache(default_ttl_seconds=FLIGHT_CACHE_TTL_SECONDS)
        yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://skyscout-sepia.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


def parse_iso_date(value: str) -> date | None:
    """Strictly parses a 'YYYY-MM-DD' string. Returns None for anything
    malformed, so callers can turn it into a clean {"error": ...} response
    instead of letting a bad string reach SerpApi."""
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def build_cache_key(origin_code, destination_code, trip_type, travel_class, currency, is_direct, depart, ret):
    # depart/ret are part of the key — two searches for the same route but
    # different dates must NOT collide on the same cache entry.
    return f"{origin_code}:{destination_code}:{trip_type}:{travel_class}:{currency}:{is_direct}:{depart}:{ret}"


async def _search_with_cache(flight_search, cache, origin_code, destination_code,
                              depart, ret, trip_type, currency, adults,
                              travel_class, is_direct):
    """Wraps check_flights with a TTL cache keyed on the search parameters,
    including the actual depart/return dates. Two users searching the same
    route for the same dates within the TTL hit the cache instead of both
    paying for a fresh SerpAPI call; different dates never share a key."""
    key = build_cache_key(origin_code, destination_code, trip_type, travel_class, currency, is_direct, depart, ret)
    cached = cache.get(key)
    if cached is not None:
        return cached

    result = await flight_search.check_flights(
        origin_city_code=origin_code,
        destination_city_code=destination_code,
        from_time=depart,
        to_time=ret if trip_type == "1" else None,
        is_direct=is_direct,
        trip_type=trip_type,
        currency=currency,
        adults=adults,
        travel_class=travel_class,
    )
    cache.set(key, result)
    return result


async def _search_round_trip_flexible(flight_search, cache, origin_code, destination_code,
                                       depart, ret, trip_type, currency, adults,
                                       travel_class, is_direct):
    """Round-trip only. Tries the user's exact return date first. If that
    comes back empty, nudges the return date by a few days (never before
    depart) and stops at the first date that actually has fares. The depart
    date is never changed — only the return date flexes.

    Returns (flights, actual_return_date_used).
    """
    depart_obj = datetime.strptime(depart, "%Y-%m-%d").date()
    ret_obj = datetime.strptime(ret, "%Y-%m-%d").date()

    last_flights = None
    for offset in DATE_FALLBACK_OFFSETS:
        candidate = ret_obj + timedelta(days=offset)
        if candidate < depart_obj:
            continue
        candidate_str = candidate.strftime("%Y-%m-%d")
        flights = await _search_with_cache(
            flight_search, cache, origin_code, destination_code, depart, candidate_str,
            trip_type, currency, adults, travel_class, is_direct,
        )
        last_flights = flights
        if find_cheapest_flight(flights, trip_type=trip_type).price != "N/A":
            return flights, candidate_str

    # Nothing found across any offset — return the last attempt (will be
    # treated as "no flights found" by the caller) and the original date.
    return last_flights, ret


class StatusRequest(BaseModel):
    flightNumber: str
    date: str


@app.post("/api/status")
async def get_status(req: StatusRequest):
    status = await app.state.flight_search.get_flight_status(req.flightNumber, req.date)
    return {"status": status}


class SearchRequest(BaseModel):
    origin: str
    destination: str
    tripType: str
    departDate: str                  # "YYYY-MM-DD"
    returnDate: str | None = None    # required if tripType == "round"
    budget: float
    currency: str
    adults: int = 1
    travelClass: str = "economy"


@app.post("/api/search")
async def search_flights(req: SearchRequest, background_tasks: BackgroundTasks):
    flight_search = app.state.flight_search
    data_manager = app.state.data_manager
    cache = app.state.flight_cache

    trip_type = TRIP_TYPE_MAP[req.tripType]
    travel_class = CLASS_MAP[req.travelClass]

    depart_parsed = parse_iso_date(req.departDate)
    if depart_parsed is None:
        return {"error": "Depart date must be a valid date in YYYY-MM-DD format."}
    # Grace window absorbs client/server timezone skew — see
    # DEPART_DATE_GRACE_DAYS comment above for why this isn't a hard
    # date.today() boundary.
    if depart_parsed < date.today() - timedelta(days=DEPART_DATE_GRACE_DAYS):
        return {"error": "Depart date cannot be in the past — choose today or a later date."}

    if trip_type == "1":
        if not req.returnDate:
            return {"error": "Return date is required for round-trip searches."}
        return_parsed = parse_iso_date(req.returnDate)
        if return_parsed is None:
            return {"error": "Return date must be a valid date in YYYY-MM-DD format."}
        if return_parsed < depart_parsed:
            return {"error": "Return date cannot be before the depart date."}

    depart = req.departDate
    ret = req.returnDate if trip_type == "1" else None

    origin_code, destination_code = await asyncio.gather(
        flight_search.get_iata_code(req.origin),
        flight_search.get_iata_code(req.destination),
    )

    if origin_code == "N/A" or destination_code == "N/A":
        return {"error": "Could not find IATA codes for the given cities."}

    actual_return = ret

    if trip_type == "1":
        flights, actual_return = await _search_round_trip_flexible(
            flight_search, cache, origin_code, destination_code, depart, ret,
            trip_type, req.currency, req.adults, travel_class, is_direct=True,
        )
        cheapest = find_cheapest_flight(flights, trip_type=trip_type)

        if cheapest.price == "N/A":
            flights, actual_return = await _search_round_trip_flexible(
                flight_search, cache, origin_code, destination_code, depart, ret,
                trip_type, req.currency, req.adults, travel_class, is_direct=False,
            )
            cheapest = find_cheapest_flight(flights, trip_type=trip_type)
    else:
        flights = await _search_with_cache(
            flight_search, cache, origin_code, destination_code, depart, ret,
            trip_type, req.currency, req.adults, travel_class, is_direct=True,
        )
        cheapest = find_cheapest_flight(flights, trip_type=trip_type)

        if cheapest.price == "N/A":
            flights = await _search_with_cache(
                flight_search, cache, origin_code, destination_code, depart, ret,
                trip_type, req.currency, req.adults, travel_class, is_direct=False,
            )
            cheapest = find_cheapest_flight(flights, trip_type=trip_type)

    if cheapest.price == "N/A":
        return {"error": "No flights found within your criteria."}

    all_sorted = find_all_flights_sorted(flights, trip_type=trip_type)
    other_flights = all_sorted[1:] if len(all_sorted) > 1 else []

    date_adjusted = trip_type == "1" and actual_return != req.returnDate

    # Sheety write is a side effect the user doesn't need to wait on — runs
    # after the response has already gone out. No longer tied to email/alerts.
    background_tasks.add_task(
        data_manager.post_search_result,
        origin=req.origin,
        destination=req.destination,
        origin_code=origin_code,
        destination_code=destination_code,
        price=cheapest.price,
        outbound=cheapest.out_date,
        inbound=cheapest.return_date,
        stops=cheapest.stops,
        stop_airports=cheapest.stop_airports,
    )

    return {
        "bestDeal": {
            "originCode": origin_code,
            "destinationCode": destination_code,
            "airline": cheapest.airline,
            "airlineLogo": cheapest.airline_logo,
            "flightNumber": cheapest.flight_number,
            "aircraft": cheapest.aircraft,
            "status": None,
            "price": cheapest.price,
            "currency": req.currency,
            "departDate": cheapest.out_date,
            "returnDate": cheapest.return_date,
            "requestedReturnDate": req.returnDate,
            "dateAdjusted": date_adjusted,
            "stops": cheapest.stops,
            "stopAirports": cheapest.stop_airports,
        },
        "otherFlights": [
            {
                "airline": f.airline,
                "airlineLogo": f.airline_logo,
                "flightNumber": f.flight_number,
                "aircraft": f.aircraft,
                "status": None,
                "price": f.price,
                "currency": req.currency,
                "departDate": f.out_date,
                "returnDate": f.return_date,
                "stops": f.stops,
                "stopAirports": f.stop_airports,
            }
            for f in other_flights
        ],
    }


class FlightsOnlyRequest(BaseModel):
    origin: str
    destination: str
    tripType: str = "round"
    adults: int = 1
    travelClass: str = "economy"
    currency: str = "GBP"


@app.post("/api/flights")
async def get_flights_only(req: FlightsOnlyRequest):
    flight_search = app.state.flight_search
    cache = app.state.flight_cache

    trip_type = TRIP_TYPE_MAP[req.tripType]
    travel_class = CLASS_MAP[req.travelClass]

    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=SEARCH_WINDOW_DAYS)).strftime("%Y-%m-%d")

    origin_code, destination_code = await asyncio.gather(
        flight_search.get_iata_code(req.origin),
        flight_search.get_iata_code(req.destination),
    )

    if origin_code == "N/A" or destination_code == "N/A":
        return {"error": "Could not find IATA codes for the given cities."}

    flights = await _search_with_cache(
        flight_search, cache, origin_code, destination_code, tomorrow, end_date,
        trip_type, req.currency, req.adults, travel_class, is_direct=True,
    )
    all_sorted = find_all_flights_sorted(flights, trip_type=trip_type)

    if not all_sorted:
        flights = await _search_with_cache(
            flight_search, cache, origin_code, destination_code, tomorrow, end_date,
            trip_type, req.currency, req.adults, travel_class, is_direct=False,
        )
        all_sorted = find_all_flights_sorted(flights, trip_type=trip_type)

    if not all_sorted:
        return {"error": "No flights found for that route."}

    return {
        "originCode": origin_code,
        "destinationCode": destination_code,
        "flights": [
            {
                "airline": f.airline,
                "airlineLogo": f.airline_logo,
                "flightNumber": f.flight_number,
                "aircraft": f.aircraft,
                "status": None,
                "price": f.price,
                "currency": req.currency,
                "departDate": f.out_date,
                "returnDate": f.return_date,
                "stops": f.stops,
                "stopAirports": f.stop_airports,
            }
            for f in all_sorted
        ],
    }


class AirportBoardRequest(BaseModel):
    airport: str


@app.post("/api/airport-board")
async def get_airport_board(req: AirportBoardRequest):
    flight_search = app.state.flight_search
    airport_board = app.state.airport_board

    airport_code = await flight_search.get_iata_code(req.airport)

    if airport_code == "N/A":
        return {"error": "Could not find an IATA code for the given airport/city."}

    board = await airport_board.get_board(airport_code)

    if not board["arrivals"] and not board["departures"]:
        return {"error": "No flight data found for that airport."}

    return {
        "airportCode": airport_code,
        "arrivals": board["arrivals"],
        "departures": board["departures"],
    }


class FlightLookupRequest(BaseModel):
    ident: str


@app.post("/api/flight")
async def get_flight_detail(req: FlightLookupRequest):
    airport_board = app.state.airport_board
    result = await airport_board.get_flight(req.ident.strip().upper())

    if not result:
        return {"error": "No flight found for that identifier."}

    return result


# --- Places ---

class PlacesRequest(BaseModel):
    query: str                        # category text, e.g. "restaurants", "mobile phone", "shop"
    lat: float | None = None          # "near me" flow — sent straight from browser geolocation
    lon: float | None = None
    location: str | None = None       # "search by place/city" flow — free text, geocoded below
    radius: int | None = None         # falls back to places_search.py's DEFAULT_RADIUS_METERS when omitted
    userLat: float | None = None      # NEW — user's real coordinates, always sent by the frontend.
    userLon: float | None = None      # Used to override each place's distance so "cafes in NIBM"
                                       # still shows distance from where the user actually is, not
                                       # from NIBM (the search center).


async def _reverse_geocode_safe(lat: float, lon: float) -> str | None:
    """Best-effort reverse geocode for display only ("You searched near:
    <address>"). Never allowed to fail the request — any Geoapify error here
    just means the response falls back to raw coordinates."""
    try:
        return await asyncio.to_thread(reverse_geocode, lat, lon)
    except Exception as e:
        print(f"[api] reverse_geocode failed for ({lat}, {lon}): {e}")
        return None


def _validate_latlon(lat: float, lon: float) -> str | None:
    """Returns an error string if out of range, else None."""
    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        return "lat/lon are out of valid range."
    return None


def _clamp_radius(radius: int | None, search_kwargs: dict, endpoint_label: str) -> str | None:
    """Validates and clamps radius into search_kwargs in place.
    Returns an error string if radius is invalid, else None."""
    if radius is None:
        return None
    if radius <= 0:
        return "radius must be a positive number of meters."
    if radius > PLACES_MAX_RADIUS_METERS:
        print(f"[api] {endpoint_label} radius {radius}m exceeds cap, clamping to {PLACES_MAX_RADIUS_METERS}m")
    search_kwargs["radius"] = min(radius, PLACES_MAX_RADIUS_METERS)
    return None


@app.post("/api/places")
async def get_places(req: PlacesRequest):
    resolved_location = None
    do_reverse_geocode = False

    if req.lat is not None and req.lon is not None:
        # Direct coordinates win when both lat/lon and a location string are
        # sent — this is the live GPS signal and is more precise than
        # re-geocoding a typed place name.
        latlon_error = _validate_latlon(req.lat, req.lon)
        if latlon_error:
            return {"error": latlon_error}
        lat, lon = req.lat, req.lon
        do_reverse_geocode = True
    elif req.location:
        try:
            geo = await asyncio.to_thread(geocode_text, req.location)
        except Exception as e:
            return {"error": f"Could not resolve location '{req.location}': {e}"}

        if geo is None:
            return {"error": f"Could not find a location matching '{req.location}'."}

        lat, lon = geo["lat"], geo["lon"]
        resolved_location = geo["formatted"]
    else:
        return {"error": "Provide either lat/lon (near me) or a location name to search."}

    search_kwargs = {"lat": lat, "lon": lon, "query": req.query}

    # Real-distance override — only meaningful when we know where the user
    # actually is. Applied regardless of whether this request came in via
    # lat/lon or a typed location string.
    if req.userLat is not None and req.userLon is not None:
        latlon_error = _validate_latlon(req.userLat, req.userLon)
        if latlon_error:
            return {"error": f"userLat/userLon: {latlon_error}"}
        search_kwargs["user_lat"] = req.userLat
        search_kwargs["user_lon"] = req.userLon

    radius_error = _clamp_radius(req.radius, search_kwargs, "/api/places")
    if radius_error:
        return {"error": radius_error}

    if do_reverse_geocode:
        # search_places and reverse_geocode are independent of each other —
        # run concurrently instead of paying for reverse-geocode latency on
        # top of the places search.
        result, resolved_location = await asyncio.gather(
            asyncio.to_thread(search_places, **search_kwargs),
            _reverse_geocode_safe(lat, lon),
        )
    else:
        result = await asyncio.to_thread(search_places, **search_kwargs)

    if result.get("error"):
        return {"error": result["error"]}

    result["searchedLocation"] = {"lat": lat, "lon": lon, "formatted": resolved_location}
    return result


class DefaultPlacesRequest(BaseModel):
    lat: float | None = None          # "near me" flow — sent straight from browser geolocation
    lon: float | None = None
    location: str | None = None       # IP-based city guess or hardcoded fallback, geocoded below
    radius: int | None = None


@app.post("/api/places/default")
async def get_default_places(req: DefaultPlacesRequest):
    """Same location-resolution flow as /api/places, but always searches
    default_places.DEFAULT_CATEGORIES instead of resolving free text.
    Used to populate the Places page (and later Explore) with content
    before the user has typed anything — see default_places.py.

    No userLat/userLon here: the search center IS the user's own location
    in this flow (there's no typed "in <place>" text to diverge from), so
    the distance Geoapify/OSM already return is already correct."""
    resolved_location = None
    do_reverse_geocode = False

    if req.lat is not None and req.lon is not None:
        latlon_error = _validate_latlon(req.lat, req.lon)
        if latlon_error:
            return {"error": latlon_error}
        lat, lon = req.lat, req.lon
        do_reverse_geocode = True
    elif req.location:
        try:
            geo = await asyncio.to_thread(geocode_text, req.location)
        except Exception as e:
            return {"error": f"Could not resolve location '{req.location}': {e}"}

        if geo is None:
            return {"error": f"Could not find a location matching '{req.location}'."}

        lat, lon = geo["lat"], geo["lon"]
        resolved_location = geo["formatted"]
    else:
        return {"error": "Provide either lat/lon (near me) or a location name to search."}

    search_kwargs = {"lat": lat, "lon": lon}
    radius_error = _clamp_radius(req.radius, search_kwargs, "/api/places/default")
    if radius_error:
        return {"error": radius_error}

    if do_reverse_geocode:
        result, resolved_location = await asyncio.gather(
            asyncio.to_thread(search_default_places, **search_kwargs),
            _reverse_geocode_safe(lat, lon),
        )
    else:
        result = await asyncio.to_thread(search_default_places, **search_kwargs)

    if result.get("error"):
        return {"error": result["error"]}

    result["searchedLocation"] = {"lat": lat, "lon": lon, "formatted": resolved_location}
    return result