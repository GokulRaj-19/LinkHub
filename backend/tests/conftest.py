"""Pytest fixtures and mock test data for LinkHub backend tests."""
import pytest
from app import create_app
from app.extensions import db
from app.models.category import Category
from app.models.team import Team, TeamMembership
from app.models.user import User


@pytest.fixture
def app():
    """Create test application context with in-memory database."""
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        # Seed test users
        priya = User(email="priya@example.com", full_name="Priya Sharma", role="user", theme="brand")
        priya.set_password("password123")
        ravi = User(email="ravi@example.com", full_name="Ravi Kumar", role="user", theme="sketch")
        ravi.set_password("password123")
        admin = User(email="admin@linkhub.dev", full_name="System Admin", role="admin", theme="sketch")
        admin.set_password("adminpassword")
        inactive = User(email="inactive@example.com", full_name="Inactive User", role="user", is_active=False)
        inactive.set_password("password123")

        db.session.add_all([priya, ravi, admin, inactive])
        db.session.commit()

        # Seed categories
        cat = Category(user_id=priya.id, name="Work", color="#7048E0")
        db.session.add(cat)
        db.session.commit()

        # Seed team
        team = Team(name="Platform Squad", lead_id=priya.id, team_code="TESTCODE", code_active=True)
        db.session.add(team)
        db.session.flush()

        db.session.add_all([
            TeamMembership(team_id=team.id, user_id=priya.id, role="lead"),
            TeamMembership(team_id=team.id, user_id=ravi.id, role="member"),
        ])
        db.session.commit()

        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Test HTTP client."""
    return app.test_client()


def get_token(client, email, password):
    """Helper to authenticate and retrieve access token."""
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.get_json()["token"]


@pytest.fixture
def priya_headers(client):
    """Authorization headers for Priya (Team Leader)."""
    token = get_token(client, "priya@example.com", "password123")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def ravi_headers(client):
    """Authorization headers for Ravi (Team Member)."""
    token = get_token(client, "ravi@example.com", "password123")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client):
    """Authorization headers for System Admin."""
    token = get_token(client, "admin@linkhub.dev", "adminpassword")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_link_payload():
    """Mock dictionary payload for creating a single link."""
    return {
        "title": "React 19 Official Documentation",
        "url": "https://react.dev/blog/2024/12/05/react-19",
        "note": "Reference for actions, useOptimistic, and useActionState",
        "tag": "frontend",
        "is_starred": True,
        "is_pinned": False,
    }


@pytest.fixture
def sample_links_batch():
    """Batch of mock link payloads for search and filter testing."""
    return [
        {"title": "Vite Build Tool", "url": "https://vite.dev", "tag": "tooling", "is_starred": False, "is_pinned": True},
        {"title": "Tailwind CSS Colors", "url": "https://tailwindcss.com/docs/customizing-colors", "tag": "css", "is_starred": True, "is_pinned": False},
        {"title": "Lucide React Icons", "url": "https://lucide.dev/icons", "tag": "design", "is_starred": True, "is_pinned": True},
    ]
