"""Blueprints package initialization."""
from app.routes.admin import admin_bp
from app.routes.auth import auth_bp
from app.routes.categories import categories_bp
from app.routes.links import links_bp
from app.routes.tasks import tasks_bp
from app.routes.team_links import team_links_bp
from app.routes.team_members import team_members_bp
from app.routes.teams import teams_bp
from app.routes.users import users_bp

all_blueprints = [
    auth_bp,
    users_bp,
    links_bp,
    categories_bp,
    teams_bp,
    team_members_bp,
    team_links_bp,
    tasks_bp,
    admin_bp,
]

__all__ = ["all_blueprints"]
