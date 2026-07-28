import os
from dotenv import load_dotenv
import httpx

load_dotenv()


class NotificationManager:
    """Sends price-alert emails via Resend's HTTP API.

    Switched away from raw Gmail SMTP because Render's free tier blocks
    outbound traffic on SMTP ports 25/465/587 (since Sept 2025) — that's
    why this worked locally but silently failed in production. An HTTPS
    POST isn't affected by that block.
    """

    def __init__(self, client: httpx.AsyncClient):
        self.api_key = os.getenv('RESEND_API_KEY')
        self.from_email = os.getenv('NOTIFICATION_FROM_EMAIL')  # e.g. alerts@yourdomain.com
        self.client = client
        self.endpoint = "https://api.resend.com/emails"

    async def send_emails(self, customer_emails, price, departure_code, arrival_code,
                           outbound_date, inbound_date, stops, currency="GBP", stop_airports=None):
        stops_info = "Direct" if stops == 0 else f"via {','.join(stop_airports or [])}"

        text_body = (
            f"Low price alert: Only {currency}{price} to fly from {departure_code} to {arrival_code}.\n"
            f"From {outbound_date} to {inbound_date}.\n"
            f"Stops: {stops_info}"
        )

        headers = {"Authorization": f"Bearer {self.api_key}"}
        results = []

        for email in customer_emails:
            payload = {
                "from": self.from_email,
                "to": [email],
                "subject": "New Low Price Flight!",
                "text": text_body,
            }
            try:
                response = await self.client.post(self.endpoint, json=payload, headers=headers, timeout=15)
                response.raise_for_status()
                results.append({"email": email, "sent": True})

            except httpx.HTTPStatusError as e:
                print(f"Email failed for {email}: {e.response.status_code} - {e.response.text}")
                results.append({"email": email, "sent": False, "error": str(e)})

            except httpx.RequestError as e:
                print(f"Network error sending email to {email}: {e}")
                results.append({"email": email, "sent": False, "error": str(e)})

        return results