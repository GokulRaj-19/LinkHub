"""Helper functions for LinkHub backend."""
import random
import re
from urllib.parse import urlparse, urlunparse
from flask import jsonify

TEAM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def validate_url(url: str) -> bool:
    """Validate whether a string is a legitimate HTTP/HTTPS URL."""
    if not url or not isinstance(url, str):
        return False
    cleaned = url.strip()
    if re.search(r"^(javascript:|data:|file:|vbscript:)", cleaned, re.IGNORECASE):
        return False

    pattern = re.compile(
        r"^https?://"  # http:// or https://
        r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"  # domain...
        r"localhost|"  # localhost...
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # ...or ip
        r"(?::\d+)?"  # optional port
        r"(?:/?|[/?]\S+)$",
        re.IGNORECASE,
    )
    return bool(pattern.match(cleaned))


def normalize_url(url: str) -> str:
    """Normalize URL by adding default https, lowercasing domain, and stripping trailing slash."""
    if not url:
        return ""
    cleaned = url.strip()
    if not re.match(r"^https?://", cleaned, re.IGNORECASE):
        cleaned = "https://" + cleaned

    try:
        parsed = urlparse(cleaned)
        scheme = (parsed.scheme or "https").lower()
        netloc = parsed.netloc.lower()
        path = parsed.path.rstrip("/")
        if not path:
            path = ""
        normalized = urlunparse((scheme, netloc, path, parsed.params, parsed.query, parsed.fragment))
        return normalized
    except Exception:
        return cleaned


def generate_slug(text: str) -> str:
    """Generate a clean URL-friendly slug from title or text."""
    if not text:
        return ""
    slug = text.strip().lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    return slug.strip("-")


def parse_link_metadata(url: str, html_snippet: str | None = None) -> dict:
    """Extract domain, favicon URL, and optional title/description from URL & HTML."""
    normalized = normalize_url(url)
    parsed = urlparse(normalized)
    domain = parsed.netloc
    favicon_url = f"{parsed.scheme}://{domain}/favicon.ico" if domain else ""

    metadata = {
        "url": normalized,
        "domain": domain,
        "favicon_url": favicon_url,
        "title": None,
        "description": None,
    }

    if html_snippet:
        title_match = re.search(r"<title[^>]*>(.*?)</title>", html_snippet, re.IGNORECASE | re.DOTALL)
        if title_match:
            metadata["title"] = title_match.group(1).strip()

        desc_match = re.search(
            r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']',
            html_snippet,
            re.IGNORECASE,
        ) or re.search(
            r'<meta[^>]*content=["\'](.*?)["\'][^>]*name=["\']description["\']',
            html_snippet,
            re.IGNORECASE,
        )
        if desc_match:
            metadata["description"] = desc_match.group(1).strip()

    return metadata


def generate_team_code(length: int = 8) -> str:
    """Generate random uppercase alphanumeric team join code."""
    return "".join(random.choice(TEAM_CODE_CHARS) for _ in range(length))


def success_response(data=None, message: str | None = None, status_code: int = 200):
    """Standardized JSON success response."""
    payload = {}
    if data is not None:
        if isinstance(data, dict):
            payload.update(data)
        else:
            payload["data"] = data
    if message:
        payload["message"] = message
    return jsonify(payload), status_code


def error_response(message: str, status_code: int = 400, **kwargs):
    """Standardized JSON error response."""
    payload = {"message": message, "error": True}
    payload.update(kwargs)
    return jsonify(payload), status_code
