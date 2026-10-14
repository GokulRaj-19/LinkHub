"""Tests for personal vault links endpoints."""


def test_create_link_and_duplicate_check(client, priya_headers):
    """Test link creation and normalized URL duplicate prevention."""
    res1 = client.post(
        "/api/links",
        json={"title": "Flask Repo", "url": "https://github.com/pallets/flask/"},
        headers=priya_headers,
    )
    assert res1.status_code == 201
    link1 = res1.get_json()
    assert link1["url"] == "https://github.com/pallets/flask"

    # Attempt to add duplicate with different casing/trailing slash
    res2 = client.post(
        "/api/links",
        json={"title": "Flask Duplicate", "url": "HTTPS://GITHUB.COM/pallets/flask"},
        headers=priya_headers,
    )
    assert res2.status_code == 409
    assert "already exists" in res2.get_json()["message"]


def test_star_and_pin_toggles(client, priya_headers):
    """Test star, pin, and click counter operations."""
    res = client.post(
        "/api/links",
        json={"title": "Documentation", "url": "https://docs.python.org"},
        headers=priya_headers,
    )
    link_id = res.get_json()["id"]

    # Star
    star_res = client.patch(f"/api/links/{link_id}/star", headers=priya_headers)
    assert star_res.status_code == 200
    assert star_res.get_json()["is_starred"] is True

    # Pin
    pin_res = client.patch(f"/api/links/{link_id}/pin", headers=priya_headers)
    assert pin_res.status_code == 200
    assert pin_res.get_json()["is_pinned"] is True
    assert pin_res.get_json()["pinned_at"] is not None

    # Click increment
    click_res = client.post(f"/api/links/{link_id}/click", headers=priya_headers)
    assert click_res.status_code == 200
    assert click_res.get_json()["click_count"] == 1


def test_pinned_links_sort_first(client, priya_headers):
    """Test business rule: pinned links sort first, within pinned most recently pinned first."""
    client.post("/api/links", json={"title": "Unpinned 1", "url": "https://site1.com"}, headers=priya_headers)
    r2 = client.post("/api/links", json={"title": "Pinned 1", "url": "https://site2.com", "is_pinned": True}, headers=priya_headers)
    r3 = client.post("/api/links", json={"title": "Pinned 2", "url": "https://site3.com", "is_pinned": True}, headers=priya_headers)

    res = client.get("/api/links", headers=priya_headers)
    data = res.get_json()
    assert len(data["pinned"]) >= 2
    # Pinned 2 was pinned after Pinned 1, so Pinned 2 should be first in pinned
    assert data["pinned"][0]["id"] == r3.get_json()["id"]


def test_soft_delete(client, priya_headers):
    """Test that links are soft deleted and excluded from normal listings."""
    res = client.post(
        "/api/links",
        json={"title": "Temporary Link", "url": "https://temp.org"},
        headers=priya_headers,
    )
    link_id = res.get_json()["id"]

    del_res = client.delete(f"/api/links/{link_id}", headers=priya_headers)
    assert del_res.status_code == 200

    list_res = client.get("/api/links", headers=priya_headers)
    all_urls = [l["url"] for l in list_res.get_json()["all"]]
    assert "https://temp.org" not in all_urls
