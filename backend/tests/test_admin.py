"""Tests for admin audit logging and CSV export."""


def test_admin_logs_access(client, admin_headers, ravi_headers):
    """Test admin logs access restriction (admin only)."""
    # Member gets 403 Forbidden
    forbidden = client.get("/api/admin/logs", headers=ravi_headers)
    assert forbidden.status_code == 403

    # Admin gets 200 OK
    res = client.get("/api/admin/logs", headers=admin_headers)
    assert res.status_code == 200
    assert isinstance(res.get_json(), list)


def test_admin_logs_export_csv(client, admin_headers):
    """Test CSV export download format."""
    res = client.get("/api/admin/logs/export", headers=admin_headers)
    assert res.status_code == 200
    assert res.mimetype == "text/csv"
    assert "attachment; filename=audit_logs.csv" in res.headers.get("Content-Disposition", "")
    content = res.get_data(as_text=True)
    assert "ID,Timestamp,User ID" in content
