import os
from dotenv import load_dotenv
import httpx

load_dotenv()


class DataManager:
    """This class is responsible for talking to the Google Sheet."""

    def __init__(self, client: httpx.AsyncClient):
        self.sheety_headers = {
            "Authorization": f"Basic {os.getenv('SHEETY_TOKEN')}"
        }
        self.sheety_endpoint = os.getenv('SHEETY_ENDPOINT')
        self.sheety_users_endpoint = os.getenv('SHEETY_ENDPOINT_USERS')
        self.sheety_searches_endpoint = os.getenv('SHEETY_ENDPOINT_SEARCHES')
        self.client = client

    async def get_data(self):
        """Method to get data from the Google Sheet on prices sheet."""
        try:
            response = await self.client.get(self.sheety_endpoint, headers=self.sheety_headers)
            response.raise_for_status()
            data = response.json()
            return data['prices']

        except httpx.HTTPStatusError as e:
            print(f"Failed to fetch prices data: {e}")
            return []

        except httpx.RequestError as e:
            print(f"Network error fetching prices: {e}")
            return []

    async def get_customer_emails(self):
        """Method to get customer emails from the Google Sheet on users sheet."""
        try:
            response = await self.client.get(self.sheety_users_endpoint, headers=self.sheety_headers)
            response.raise_for_status()
            data = response.json()
            return data['users']

        except httpx.HTTPStatusError as e:
            print(f"Failed to fetch users: {e}")
            return []

        except httpx.RequestError as e:
            print(f"Network error fetching users: {e}")
            return []

    async def update_lowest_price(self, row_id, new_price):
        """Method to update the lowest price in the Google Sheet prices sheet."""
        try:
            update_endpoint = f"{self.sheety_endpoint}/{row_id}"
            update_data = {"price": {"lowestPrice": new_price}}
            response = await self.client.put(update_endpoint, json=update_data, headers=self.sheety_headers)
            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            print(f"Failed to update price: {e}")
            return None

        except httpx.RequestError as e:
            print(f"Network error updating price: {e}")
            return None

    async def post_search_result(self, email, origin, destination, origin_code, destination_code,
                                  price, outbound, inbound, stops, stop_airports):
        """Method to post a new search result to the Google Sheet searches sheet.
        Now called via BackgroundTasks — runs after the response is sent, not before."""
        payload = {
            'search': {
                'email': email,
                'origin': origin,
                'destination': destination,
                'originCode': origin_code,
                'destinationCode': destination_code,
                'price': price,
                'outbound': outbound,
                'inbound': inbound,
                'stops': stops,
                'stopAirports': ','.join(stop_airports) if stop_airports else 'N/A'
            }
        }

        try:
            response = await self.client.post(
                self.sheety_searches_endpoint,
                json=payload,
                headers=self.sheety_headers
            )
            response.raise_for_status()
            return response.json()

        except httpx.HTTPStatusError as e:
            print(f"Failed to save search result: {e}")
            return None

        except httpx.RequestError as e:
            print(f"Network error saving search: {e}")
            return None