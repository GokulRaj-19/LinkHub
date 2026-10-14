"""Application factory module for LinkHub backend."""
import os
from flask import Flask, jsonify
from app.config import config_by_name
from app.extensions import bcrypt, cors, db, jwt, migrate
from app.routes import all_blueprints


def create_app(config_name: str | None = None) -> Flask:
    """Create and configure an instance of the Flask application."""
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "development").lower()

    app = Flask(__name__)
    config_class = config_by_name.get(config_name, config_by_name["default"])
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
    )

    # Register blueprints
    for bp in all_blueprints:
        app.register_blueprint(bp)

    # Health check route
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "LinkHub API",
            "version": "2.0.0",
        }), 200

    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": True, "message": str(error.description or "Bad request")}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": True, "message": str(error.description or "Unauthorized")}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": True, "message": str(error.description or "Forbidden")}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": True, "message": str(error.description or "Resource not found")}), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"error": True, "message": "An internal server error occurred."}), 500

    return app
