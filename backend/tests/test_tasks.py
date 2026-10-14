"""Tests for Kanban tasks, assignments, and idempotency protection."""


def test_create_task_leader_only(client, priya_headers, ravi_headers):
    """Test that only team leaders can create and assign tasks."""
    teams_res = client.get("/api/teams/mine", headers=priya_headers)
    team_id = teams_res.get_json()[0]["id"]

    # Member attempt should fail with 403
    forbidden_res = client.post(
        f"/api/teams/{team_id}/tasks",
        json={"title": "Unauthorized Task", "assigned_to": 2},
        headers=ravi_headers,
    )
    assert forbidden_res.status_code == 403

    # Leader attempt succeeds
    ok_res = client.post(
        f"/api/teams/{team_id}/tasks",
        json={"title": "Valid Task", "assigned_to": 2, "priority": "high"},
        headers=priya_headers,
    )
    assert ok_res.status_code == 201
    assert ok_res.get_json()["title"] == "Valid Task"


def test_task_idempotency_double_click(client, priya_headers):
    """Test acceptance criteria: task created twice by double-click produces one task."""
    teams_res = client.get("/api/teams/mine", headers=priya_headers)
    team_id = teams_res.get_json()[0]["id"]

    idem_key = "test-double-click-key-123"
    res1 = client.post(
        f"/api/teams/{team_id}/tasks",
        json={"title": "Idempotent Task", "assigned_to": 2, "idempotency_key": idem_key},
        headers=priya_headers,
    )
    assert res1.status_code == 201
    task1 = res1.get_json()

    # Second click with same idempotency key returns existing task
    res2 = client.post(
        f"/api/teams/{team_id}/tasks",
        json={"title": "Idempotent Task", "assigned_to": 2, "idempotency_key": idem_key},
        headers=priya_headers,
    )
    assert res2.status_code in (200, 201)
    task2 = res2.get_json()
    assert task1["id"] == task2["id"]


def test_assign_task_only_to_team_members(client, priya_headers):
    """Test business rule: tasks can only be assigned to current members of the squad."""
    teams_res = client.get("/api/teams/mine", headers=priya_headers)
    team_id = teams_res.get_json()[0]["id"]

    # User 3 (admin or non-member in fixture)
    res = client.post(
        f"/api/teams/{team_id}/tasks",
        json={"title": "Invalid Member Task", "assigned_to": 999},
        headers=priya_headers,
    )
    assert res.status_code == 400
    assert "current members" in res.get_json()["message"]


def test_member_updates_own_task(client, priya_headers, ravi_headers):
    """Test assigned member can update progress/status of their assigned task."""
    teams_res = client.get("/api/teams/mine", headers=priya_headers)
    team_id = teams_res.get_json()[0]["id"]

    task_res = client.post(
        f"/api/teams/{team_id}/tasks",
        json={"title": "Ravi Work Item", "assigned_to": 2},
        headers=priya_headers,
    )
    task_id = task_res.get_json()["id"]

    # Ravi updates status to done
    patch_res = client.patch(
        f"/api/tasks/{task_id}",
        json={"status": "done"},
        headers=ravi_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.get_json()["status"] == "done"
    assert patch_res.get_json()["progress"] == 100
