"""Tests for custom categories and link dependency deletion rules."""


def test_create_category_and_unique_per_user(client, priya_headers):
    """Test custom category creation and per-user name uniqueness."""
    res1 = client.post(
        "/api/categories",
        json={"name": "Reading List", "color": "#28A8E0"},
        headers=priya_headers,
    )
    assert res1.status_code == 201

    # Duplicate in same scope
    res2 = client.post(
        "/api/categories",
        json={"name": "Reading List"},
        headers=priya_headers,
    )
    assert res2.status_code == 409
    assert "already exists" in res2.get_json()["message"]


def test_delete_category_with_links_dependency_rule(client, priya_headers):
    """Test acceptance criteria: deleting a category with links forces a move first."""
    # Create category A and category B
    cat_a = client.post("/api/categories", json={"name": "Cat A"}, headers=priya_headers).get_json()["id"]
    cat_b = client.post("/api/categories", json={"name": "Cat B"}, headers=priya_headers).get_json()["id"]

    # Create link under Category A
    link_res = client.post(
        "/api/links",
        json={"title": "Dependent Link", "url": "https://dep.com", "category_id": cat_a},
        headers=priya_headers,
    )
    link_id = link_res.get_json()["id"]

    # Attempt to delete Cat A without move_to target
    blocked_res = client.delete(f"/api/categories/{cat_a}", headers=priya_headers)
    assert blocked_res.status_code == 400
    assert blocked_res.get_json()["hasDependentLinks"] is True

    # Delete Cat A with move_to Cat B
    ok_res = client.delete(f"/api/categories/{cat_a}?move_to={cat_b}", headers=priya_headers)
    assert ok_res.status_code == 200

    # Verify link has moved to Cat B
    links_res = client.get("/api/links", headers=priya_headers)
    target_link = next(l for l in links_res.get_json()["all"] if l["id"] == link_id)
    assert target_link["category_id"] == cat_b
