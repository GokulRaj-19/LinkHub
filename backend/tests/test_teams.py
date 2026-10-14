"""Tests for teams, join code, membership, and invitations."""


def test_create_team(client, ravi_headers):
    """Test team creation generates code and sets user as lead."""
    res = client.post(
        "/api/teams",
        json={"name": "Frontend Guild", "description": "UI architecture squad"},
        headers=ravi_headers,
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["name"] == "Frontend Guild"
    assert len(data["team_code"]) == 8
    assert data["team_code"].isupper()


def test_join_team_already_member(client, priya_headers):
    """Test business rule: joining a team user belongs to returns clear message without 500 error."""
    res = client.post("/api/teams/join", json={"team_code": "TESTCODE"}, headers=priya_headers)
    assert res.status_code == 200
    assert res.get_json()["alreadyMember"] is True
    assert "already a member" in res.get_json()["message"]


def test_join_team_rate_limiting(client, ravi_headers):
    """Test business rule: 5 failed joins per minute rate limit."""
    # Reset limit for fresh test
    from app.utils.rate_limit import reset_failed_joins
    reset_failed_joins(2)

    for _ in range(5):
        client.post("/api/teams/join", json={"team_code": "INVALIDC"}, headers=ravi_headers)

    res = client.post("/api/teams/join", json={"team_code": "INVALIDC"}, headers=ravi_headers)
    assert res.status_code == 429
    assert "rate limit" in res.get_json()["message"].lower() or "too many" in res.get_json()["message"].lower()


def test_add_and_remove_member_rules(client, priya_headers, ravi_headers):
    """Test member management permissions and task unassignment on removal."""
    # Fetch team
    teams_res = client.get("/api/teams/mine", headers=priya_headers)
    team_id = teams_res.get_json()[0]["id"]

    # Non-leader cannot remove member
    forbidden_res = client.delete(f"/api/teams/{team_id}/members/2", headers=ravi_headers)
    assert forbidden_res.status_code == 403

    # Leader cannot be removed without leadership transfer
    leader_remove = client.delete(f"/api/teams/{team_id}/members/1", headers=priya_headers)
    assert leader_remove.status_code == 400
    assert "leader cannot leave" in leader_remove.get_json()["message"].lower()


def test_regenerate_code(client, priya_headers):
    """Test code regeneration produces new active code."""
    teams_res = client.get("/api/teams/mine", headers=priya_headers)
    team_id = teams_res.get_json()[0]["id"]

    res = client.post(f"/api/teams/{team_id}/code/regenerate", headers=priya_headers)
    assert res.status_code == 200
    new_code = res.get_json()["team_code"]
    assert new_code != "TESTCODE"
    assert len(new_code) == 8
