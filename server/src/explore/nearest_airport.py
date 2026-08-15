"""Finds the geographically nearest airport(s) to a lat/lon, using a bundled
OpenFlights dataset (~6,000 airports with valid IATA codes worldwide).
Loaded once into memory at import time — a static reference file shipped
with the backend, no network call, no external storage.

Known limitation: OpenFlights doesn't flag which airports have actual
scheduled commercial service, so pure nearest-by-distance occasionally
lands on a small airfield SerpAPI has no fares for. find_nearest_airports()
returns multiple candidates so callers can fall back to the next-nearest
if the closest one comes back empty — see /api/explore in api.py.
"""

import csv
import math
from dataclasses import dataclass
from pathlib import Path

DATA_PATH = Path(__file__).parent / "airports.csv"


@dataclass(frozen=True)
class Airport:
    iata: str
    name: str
    city: str
    country: str
    lat: float
    lon: float


def _load_airports() -> list[Airport]:
    with open(DATA_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [
            Airport(
                iata=row["iata"],
                name=row["name"],
                city=row["city"],
                country=row["country"],
                lat=float(row["lat"]),
                lon=float(row["lon"]),
            )
            for row in reader
        ]


# Loaded once at import — ~6k rows, trivial memory footprint, and sorting
# this per-request (see find_nearest_airports) is a few ms even unindexed.
_AIRPORTS: list[Airport] = _load_airports()


def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def find_nearest_airports(lat: float, lon: float, limit: int = 3) -> list[Airport]:
    """Nearest `limit` airports to (lat, lon), closest first."""
    return sorted(_AIRPORTS, key=lambda a: _haversine_km(lat, lon, a.lat, a.lon))[:limit]