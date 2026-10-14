"""Custom decorators for role and squad membership authorization."""
from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.extensions import db
from app.models.team import Team, TeamMembership
from app.models.user import User
from app.utils.helpers import error_response


def get_authenticated_user() -> User | None:
    """Retrieve the currently authenticated User model instance from JWT identity."""
    identity = get_jwt_identity()
    if not identity:
        return None
    user_id = int(identity)
    user = db.session.get(User, user_id)
    if not user or not user.is_active:
        return None
    return user


def admin_required():
    """Decorator to enforce Admin role."""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user = get_authenticated_user()
            if not user:
                return error_response("Unauthorized or inactive account.", 401)
            if user.role != "admin":
                return error_response("Forbidden: Admin privileges required.", 403)
            return fn(*args, **kwargs)
        return decorator
    return wrapper


def team_member_required(param_name: str = "id"):
    """Decorator to enforce user is a member, leader, or admin of the specified team."""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user = get_authenticated_user()
            if not user:
                return error_response("Unauthorized.", 401)
            team_id = kwargs.get(param_name)
            if not team_id:
                return error_response("Missing team identifier.", 400)

            # Admins have read access or system access
            if user.role == "admin":
                return fn(*args, **kwargs)

            membership = TeamMembership.query.filter_by(
                team_id=int(team_id), user_id=user.id
            ).first()
            if not membership:
                return error_response("Forbidden: You are not a member of this squad.", 403)
            return fn(*args, **kwargs)
        return decorator
    return wrapper


def team_lead_required(param_name: str = "id"):
    """Decorator to enforce user is the leader of the specified team."""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user = get_authenticated_user()
            if not user:
                return error_response("Unauthorized.", 401)
            team_id = kwargs.get(param_name)
            if not team_id:
                return error_response("Missing team identifier.", 400)

            team = db.session.get(Team, int(team_id))
            if not team:
                return error_response("Team not found.", 404)
            if team.lead_id != user.id:
                return error_response("Forbidden: Team Leader privileges required.", 403)
            return fn(*args, **kwargs)
        return decorator
    return wrapper
