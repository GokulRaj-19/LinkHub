"""Vercel Serverless Function entrypoint for LinkHub Flask REST API."""
import os
import sys

# Add the backend directory to Python sys.path so app modules resolve seamlessly
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from app.extensions import db

env = os.getenv("FLASK_ENV", "production")
app = create_app(env)

# Automatically create tables in cloud database on first initialization
with app.app_context():
    try:
        db.create_all()
    except Exception as exc:
        app.logger.warning("Vercel DB auto-init skipped or failed: %s", exc)

if __name__ == "__main__":
    app.run()
