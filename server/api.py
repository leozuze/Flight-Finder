import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, date

import httpx
from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.airport_board import AirportBoard
from src.cache import TTLCache
from src.data_manager import DataManager
from src.flight_data import find_all_flights_sorted, find_cheapest_flight
from src.flight_search import FlightSearch

TRIP_TYPE_MAP = {"round": "1", "oneway": "2"}
CLASS_MAP = {"economy": "1", "premium": "2", "business": "3", "first": "4"}

SEARCH_WINDOW_DAYS = 30  # only used by the /api/flights quick-search path
FLIGHT_CACHE_TTL_SECONDS = 900  # 15 min — flight prices don't meaningfully change faster than this


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
    if depart_parsed < date.today():
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