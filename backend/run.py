"""Server entrypoint for LinkHub API."""

import os
from app import create_app
from app.extensions import db

env = os.getenv("FLASK_ENV", "development")
app = create_app(env)

# Auto-create tables on startup (works with both Gunicorn and local development)
with app.app_context():
    try:
        db.create_all()
    except Exception as exc:
        app.logger.warning("Database auto-init skipped or failed: %s", exc)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=env == "development")

