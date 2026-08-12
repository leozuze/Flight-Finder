class FlightData:
    """This class is responsible for structuring the flight data."""

    def __init__(self, price, origin_airport, destination_airport, out_date,
                 return_date, stops, stop_airports=None,
                 airline=None, airline_logo=None, flight_number=None, aircraft=None):
        self.price = price
        self.origin_airport = origin_airport
        self.destination_airport = destination_airport
        self.out_date = out_date          # full departure datetime, e.g. "2026-07-04 13:05"
        self.return_date = return_date    # full arrival datetime of that same flight
        self.stops = stops
        self.stop_airports = stop_airports or []
        self.airline = airline
        self.airline_logo = airline_logo
        self.flight_number = flight_number
        self.aircraft = aircraft


def find_cheapest_flight(data, trip_type="1"):
    if data is None or ('best_flights' not in data and 'other_flights' not in data):
        return FlightData("N/A", "N/A", "N/A", "N/A", "N/A", "N/A")

    all_flights = data.get('best_flights', []) + data.get('other_flights', [])

    cheapest_flight = FlightData(
        price=float('inf'),
        origin_airport="N/A",
        destination_airport="N/A",
        out_date="N/A",
        return_date="N/A",
        stops="N/A"
    )

    for flight in all_flights:
        if "price" not in flight:
            continue
        price = flight["price"]
        if price < cheapest_flight.price:
            legs = flight["flights"]
            cheapest_flight.price = price
            cheapest_flight.origin_airport = legs[0]["departure_airport"]["id"]
            cheapest_flight.stops = len(legs) - 1
            cheapest_flight.destination_airport = legs[-1]["arrival_airport"]["id"]

            # Real departure datetime of the first leg, and real arrival datetime
            # of the last leg — not the search-window bounds.
            cheapest_flight.out_date = legs[0]["departure_airport"].get("time", "N/A")
            cheapest_flight.return_date = legs[-1]["arrival_airport"].get("time", "N/A")

            cheapest_flight.stop_airports = [leg['arrival_airport']['id'] for leg in legs[:-1]]

            first_leg = legs[0]
            cheapest_flight.airline = first_leg.get("airline")
            cheapest_flight.airline_logo = first_leg.get("airline_logo")
            cheapest_flight.flight_number = first_leg.get("flight_number")
            cheapest_flight.aircraft = first_leg.get("airplane")

    if cheapest_flight.price == float('inf'):
        return FlightData("N/A", "N/A", "N/A", "N/A", "N/A", "N/A", [])
    return cheapest_flight

def _build_flight_data(flight, trip_type="1"):
    """Helper: turns one raw SerpApi flight dict into a FlightData object."""
    legs = flight["flights"]
    first_leg = legs[0]

    return FlightData(
        price=flight["price"],
        origin_airport=legs[0]["departure_airport"]["id"],
        destination_airport=legs[-1]["arrival_airport"]["id"],
        out_date=legs[0]["departure_airport"].get("time", "N/A"),
        return_date=legs[-1]["arrival_airport"].get("time", "N/A"),
        stops=len(legs) - 1,
        stop_airports=[leg['arrival_airport']['id'] for leg in legs[:-1]],
        airline=first_leg.get("airline"),
        airline_logo=first_leg.get("airline_logo"),
        flight_number=first_leg.get("flight_number"),
        aircraft=first_leg.get("airplane"),
    )


def find_all_flights_sorted(data, trip_type="1"):
    """Returns every flight found, sorted cheapest-first, as a list of FlightData."""
    if data is None or ('best_flights' not in data and 'other_flights' not in data):
        return []

    all_flights = data.get('best_flights', []) + data.get('other_flights', [])
    valid_flights = [f for f in all_flights if "price" in f]

    valid_flights.sort(key=lambda f: f["price"])

    return [_build_flight_data(f, trip_type) for f in valid_flights]