import time
from typing import Any, Optional


class TTLCache:
    """Simple in-process cache with per-key expiry.

    Good enough for a single Render instance. Once you're running
    multiple instances/workers (Tier 3), swap this for a Redis-backed
    version with the same get/set interface — nothing else in the app
    needs to change.
    """

    def __init__(self, default_ttl_seconds: int = 900):
        self._store: dict[str, tuple[float, Any]] = {}
        self._default_ttl = default_ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.time() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None):
        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl
        self._store[key] = (time.time() + ttl, value)

    def clear_expired(self):
        now = time.time()
        expired = [k for k, (exp, _) in self._store.items() if exp < now]
        for k in expired:
            del self._store[k]