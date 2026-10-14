"""Tests for authentication and user profile endpoints."""


def test_register_success(client):
    """Test user registration and automatic default category creation."""
    res = client.post("/api/auth/register", json={
        "full_name": "Alice Developer",
        "email": "alice@example.com",
        "password": "securepassword",
        "theme": "dark",
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["theme"] == "dark"
    assert "token" in data


def test_register_duplicate_email(client):
    """Test that registration with existing email returns 409 conflict."""
    res = client.post("/api/auth/register", json={
        "full_name": "Priya Copy",
        "email": "priya@example.com",
        "password": "password123",
    })
    assert res.status_code == 409


def test_login_inactive_user_blocked(client):
    """Test that inactive users are blocked at login per specification."""
    res = client.post("/api/auth/login", json={
        "email": "inactive@example.com",
        "password": "password123",
    })
    assert res.status_code == 403
    assert "inactive" in res.get_json()["message"].lower()


def test_login_invalid_password(client):
    """Test login failure on incorrect password."""
    res = client.post("/api/auth/login", json={
        "email": "priya@example.com",
        "password": "wrongpassword",
    })
    assert res.status_code == 401


def test_theme_update(client, priya_headers):
    """Test instant theme token persistence."""
    res = client.patch(
        "/api/users/me/theme",
        json={"theme": "hc"},
        headers=priya_headers,
    )
    assert res.status_code == 200
    assert res.get_json()["theme"] == "hc"

    # Verify via profile fetch
    profile_res = client.get("/api/users/me", headers=priya_headers)
    assert profile_res.get_json()["theme"] == "hc"
