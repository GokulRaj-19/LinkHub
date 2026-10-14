"""Application configuration module."""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class BaseConfig:
    """Base application configuration."""

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "linkhub-dev-secret-key-change-in-prod",
    )
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY", "linkhub-jwt-secret-key-change-in-prod"
    )

    # JWT Settings - Support both Bearer headers and HTTP-only cookies
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_EXPIRES_DAYS", 7))
    )
    JWT_COOKIE_HTTPONLY = True
    JWT_COOKIE_SECURE = (
        os.getenv("JWT_COOKIE_SECURE", "False").lower() == "true"
    )
    JWT_COOKIE_SAMESITE = os.getenv("JWT_COOKIE_SAMESITE", "Lax")
    # Set to True when CSRF header is configured.
    JWT_COOKIE_CSRF_PROTECT = False

    # Database
    db_url = os.getenv(
        "DATABASE_URL", "sqlite:///linkhub.db"
    )
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }


class DevelopmentConfig(BaseConfig):
    """Development environment configuration."""

    DEBUG = True


class ProductionConfig(BaseConfig):
    """Production environment configuration."""

    DEBUG = False
    JWT_COOKIE_SECURE = True


class TestingConfig(BaseConfig):
    """Testing environment configuration."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_COOKIE_SECURE = False
    WTF_CSRF_ENABLED = False


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
