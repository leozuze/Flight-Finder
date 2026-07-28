import asyncio
import os
from dotenv import load_dotenv
import httpx

load_dotenv()


class AirportBoard:
    """This class is responsible for talking to the aviationstack Flight API
    to build airport arrivals/departures boards and single flight-number lookups."""

    def __init__(self, client: httpx.AsyncClient):
        self.api_key = os.getenv('AVIATIONSTACK_KEY')
        self.flight_endpoint = os.getenv('AVIATIONSTACK_BASE_URL')
        self.client = client

    async def _get(self, params):
        """Method to call the aviationstack /flights endpoint with the given filters."""
        params = {**params, "access_key": self.api_key}
        try:
            response = await self.client.get(self.flight_endpoint, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            if "error" in data:
                print(f"aviationstack error: {data['error']}")
                return []

            return data.get("data", [])

        except httpx.TimeoutException:
            print("Airport board request timed out. Please try again.")
            return []

        except httpx.HTTPStatusError as e:
            print(f"Airport board request failed: {e.response.status_code} - {e.response.text}")
            return []

        except httpx.RequestError as e:
            print(f"Network error during airport board request: {e}")
            return []

    async def get_departures(self, airport_iata, flight_status=None):
        """Method to get flights departing the given airport (IATA code)."""
        params = {"dep_iata": airport_iata}
        if flight_status:
            params["flight_status"] = flight_status
        return [self._normalize(f, "departure") for f in await self._get(params)]

    async def get_arrivals(self, airport_iata, flight_status=None):
        """Method to get flights arriving at the given airport (IATA code)."""
        params = {"arr_iata": airport_iata}
        if flight_status:
            params["flight_status"] = flight_status
        return [self._normalize(f, "arrival") for f in await self._get(params)]

    async def get_board(self, airport_iata):
        """Method to get the full board: arrivals and departures fetched
        concurrently instead of one after the other."""
        arrivals, departures = await asyncio.gather(
            self.get_arrivals(airport_iata),
            self.get_departures(airport_iata),
        )
        return {"arrivals": arrivals, "departures": departures}

    async def get_flight(self, flight_iata):
        """Method to look up a single flight by flight number, e.g. 'KQ706'."""
        normalized = flight_iata.replace(" ", "").upper().strip()
        results = await self._get({"flight_iata": normalized})
        return self._normalize(results[0], "flight") if results else None

    @staticmethod
    def _normalize(flight, kind):
        """Helper: flattens a raw aviationstack flight dict into the fields the frontend needs."""
        departure = flight.get("departure") or {}
        arrival = flight.get("arrival") or {}
        airline = flight.get("airline") or {}
        flight_info = flight.get("flight") or {}
        aircraft = flight.get("aircraft") or {}

        other_airport = arrival if kind == "departure" else departure
        relevant_leg = arrival if kind == "arrival" else departure

        return {
            "ident": flight_info.get("iata") or flight_info.get("icao") or "N/A",
            "airline": airline.get("name") or "N/A",
            "aircraftType": aircraft.get("iata") or aircraft.get("icao") or "N/A",
            "airportCode": other_airport.get("iata") or "N/A",
            "airportName": other_airport.get("airport") or "N/A",
            "scheduledTime": relevant_leg.get("scheduled"),
            "estimatedTime": relevant_leg.get("estimated"),
            "actualTime": relevant_leg.get("actual"),
            "terminal": relevant_leg.get("terminal") or "N/A",
            "gate": relevant_leg.get("gate") or "N/A",
            "status": flight.get("flight_status") or "N/A",
            "departureAirport": departure.get("airport") or "N/A",
            "departureCode": departure.get("iata") or "N/A",
            "arrivalAirport": arrival.get("airport") or "N/A",
            "arrivalCode": arrival.get("iata") or "N/A",
        }