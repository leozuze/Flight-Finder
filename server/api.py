from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta

from src.flight_search import FlightSearch
from src.flight_data import find_cheapest_flight, find_all_flights_sorted
from src.data_manager import DataManager
from src.notification_manager import NotificationManager

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

flight_search = FlightSearch()
data_manager = DataManager()
notification_manager = NotificationManager()

TRIP_TYPE_MAP = {"round": "1", "oneway": "2"}
CLASS_MAP = {"economy": "1", "premium": "2", "business": "3", "first": "4"}

SEARCH_WINDOW_DAYS = 30  # always search the next month automatically — no longer user-configurable


class StatusRequest(BaseModel):
    flightNumber: str
    date: str


@app.post("/api/status")
def get_status(req: StatusRequest):
    status = flight_search.get_flight_status(req.flightNumber, req.date)
    return {"status": status}


class SearchRequest(BaseModel):
    origin: str
    destination: str
    tripType: str      # "round" | "oneway"
    budget: float
    currency: str
    email: str
    adults: int = 1
    travelClass: str = "economy"


@app.post("/api/search")
def search_flights(req: SearchRequest):
    trip_type = TRIP_TYPE_MAP[req.tripType]
    travel_class = CLASS_MAP[req.travelClass]

    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=SEARCH_WINDOW_DAYS)).strftime("%Y-%m-%d")

    origin_code = flight_search.get_iata_code(req.origin)
    destination_code = flight_search.get_iata_code(req.destination)

    if origin_code == "N/A" or destination_code == "N/A":
        return {"error": "Could not find IATA codes for the given cities."}

    flights = flight_search.check_flights(
        origin_city_code=origin_code,
        destination_city_code=destination_code,
        from_time=tomorrow,
        to_time=end_date if trip_type == "1" else None,
        is_direct=True,
        trip_type=trip_type,
        currency=req.currency,
        adults=req.adults,
        travel_class=travel_class,
    )
    cheapest = find_cheapest_flight(flights, trip_type=trip_type)

    if cheapest.price == "N/A":
        flights = flight_search.check_flights(
            origin_city_code=origin_code,
            destination_city_code=destination_code,
            from_time=tomorrow,
            to_time=end_date if trip_type == "1" else None,
            is_direct=False,
            trip_type=trip_type,
            currency=req.currency,
            adults=req.adults,
            travel_class=travel_class,
        )
        cheapest = find_cheapest_flight(flights, trip_type=trip_type)

    if cheapest.price == "N/A":
        return {"error": "No flights found within your criteria."}
    
    # Build the full sorted list from whichever search (direct or indirect) succeeded
    all_sorted = find_all_flights_sorted(flights, trip_type=trip_type)
    other_flights = all_sorted[1:] if len(all_sorted) > 1 else []

    data_manager.post_search_result(
        email=req.email,
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

    if cheapest.price <= req.budget:
        notification_manager.send_emails(
            customer_emails=[req.email],
            price=cheapest.price,
            departure_code=cheapest.origin_airport,
            arrival_code=cheapest.destination_airport,
            outbound_date=cheapest.out_date,
            inbound_date=cheapest.return_date,
            stops=cheapest.stops,
            stop_airports=cheapest.stop_airports,
            currency=req.currency,
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
def get_flights_only(req: FlightsOnlyRequest):
    trip_type = TRIP_TYPE_MAP[req.tripType]
    travel_class = CLASS_MAP[req.travelClass]

    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=SEARCH_WINDOW_DAYS)).strftime("%Y-%m-%d")

    origin_code = flight_search.get_iata_code(req.origin)
    destination_code = flight_search.get_iata_code(req.destination)

    if origin_code == "N/A" or destination_code == "N/A":
        return {"error": "Could not find IATA codes for the given cities."}

    flights = flight_search.check_flights(
        origin_city_code=origin_code,
        destination_city_code=destination_code,
        from_time=tomorrow,
        to_time=end_date if trip_type == "1" else None,
        is_direct=True,
        trip_type=trip_type,
        currency=req.currency,
        adults=req.adults,
        travel_class=travel_class,
    )
    all_sorted = find_all_flights_sorted(flights, trip_type=trip_type)

    if not all_sorted:
        flights = flight_search.check_flights(
            origin_city_code=origin_code,
            destination_city_code=destination_code,
            from_time=tomorrow,
            to_time=end_date if trip_type == "1" else None,
            is_direct=False,
            trip_type=trip_type,
            currency=req.currency,
            adults=req.adults,
            travel_class=travel_class,
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