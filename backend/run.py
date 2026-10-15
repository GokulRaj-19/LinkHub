"""Server entrypoint for LinkHub API."""

import os
from app import create_app
from app.extensions import db

env = os.getenv("FLASK_ENV", "development")
app = create_app(env)

# Auto-create tables and seed initial demo data on startup
with app.app_context():
    try:
        db.create_all()
        try:
            from seed import run_seed
            run_seed(app)
        except Exception as seed_err:
            app.logger.warning("Database seed warning: %s", seed_err)
    except Exception as exc:
        app.logger.warning("Database auto-init skipped or failed: %s", exc)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=env == "development")

