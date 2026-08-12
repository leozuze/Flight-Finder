import os
from dotenv import load_dotenv
import httpx

load_dotenv()


class FlightSearch:
    """This class is responsible for talking to the Flight Search API."""

    def __init__(self, client: httpx.AsyncClient):
        """The httpx client is created once in main.py's lifespan and shared
        across every request — no more opening a new connection per call."""
        self.serpapi_key = os.getenv('SERPAPI_KEY')
        self.flight_endpoint = os.getenv('SERPAPI_ENDPOINT')
        self.client = client

    async def check_flights(self, origin_city_code, destination_city_code,
                             from_time, to_time=None, is_direct=True, trip_type="1",
                             currency="GBP", adults="1", travel_class="1"):
        """Method to check flight availability and prices."""
        flight_params = {
            "engine": "google_flights",
            "departure_id": origin_city_code,
            "arrival_id": destination_city_code,
            "outbound_date": from_time,
            "type": trip_type,
            "adults": str(adults),
            "currency": currency,
            "travel_class": travel_class,
            "api_key": self.serpapi_key,
        }

        if trip_type == '1' and to_time:
            flight_params['return_date'] = to_time

        if is_direct:
            flight_params['stops'] = '0'

        try:
            response = await self.client.get(self.flight_endpoint, params=flight_params, timeout=30)
            response.raise_for_status()
            return response.json()

        except httpx.TimeoutException:
            print('Flight search timed out. Please try again.')
            return None

        except httpx.HTTPStatusError as e:
            print(f"Flight search failed: {e.response.status_code} - {e.response.text}")
            return None

        except httpx.RequestError as e:
            print(f"Network error during flight search: {e}")
            return None

    async def get_iata_code(self, city_name):
        """Method to get IATA code for a given city name. Passes through
        unchanged if the input is already a 3-letter IATA code, so callers
        (main.py, airport board, etc.) no longer need their own pass-through
        check before calling this — one source of truth."""
        value = city_name.strip()
        if len(value) == 3 and value.isalpha():
            return value.upper()

        params = {
            "engine": "google_flights_autocomplete",
            "q": city_name,
            "api_key": self.serpapi_key
        }

        try:
            response = await self.client.get(self.flight_endpoint, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            suggestions = data.get("suggestions", [])
            for suggestion in suggestions:
                airports = suggestion.get("airports", [])
                if airports:
                    return airports[0].get("id")

        except httpx.RequestError as e:
            print(f"Error fetching IATA code for {city_name}: {e}")

        return "N/A"

    async def get_flight_status(self, flight_number, date):
        """Method to get live status for a specific flight number and date via Google Search."""
        params = {
            "engine": "google",
            "q": f"{flight_number} flight status {date}",
            "api_key": self.serpapi_key,
        }
        try:
            response = await self.client.get(self.flight_endpoint, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            flight_result = data.get("flight_result")
            if not flight_result:
                return None
            for entry in flight_result.get("dates", []):
                if entry.get("date") == date:
                    return entry.get("metadata", {}).get("status")
            dates = flight_result.get("dates", [])
            return dates[0].get("metadata", {}).get("status") if dates else None
        except httpx.RequestError as e:
            print(f"Error fetching flight status: {e}")
            return None