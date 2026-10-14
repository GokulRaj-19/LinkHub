"""Rate limiting utility for sensitive operations."""
import time
from collections import defaultdict
from threading import Lock

_failed_join_lock = Lock()
_failed_joins = defaultdict(list)


def check_join_rate_limit(user_id: int, max_attempts: int = 5, window_seconds: int = 60) -> bool:
    """Return True if user is within the rate limit, False if exceeded."""
    now = time.time()
    with _failed_join_lock:
        attempts = [t for t in _failed_joins[user_id] if now - t < window_seconds]
        _failed_joins[user_id] = attempts
        return len(attempts) < max_attempts


def record_failed_join(user_id: int) -> None:
    """Record a failed join attempt for rate limiting."""
    now = time.time()
    with _failed_join_lock:
        _failed_joins[user_id].append(now)


def reset_failed_joins(user_id: int) -> None:
    """Reset failed join attempts on successful join."""
    with _failed_join_lock:
        if user_id in _failed_joins:
            del _failed_joins[user_id]
