"""Integration and API tests for core /api/links endpoints (POST, GET, PUT, DELETE)."""


def test_post_link_success(client, priya_headers):
    """Test POST /api/links successfully creates bookmark in personal vault."""
    payload = {
        "title": "PostgreSQL Documentation",
        "url": "https://www.postgresql.org/docs/",
        "note": "SQL syntax and indexing reference",
        "tag": "database",
        "is_starred": True,
        "is_pinned": False,
    }
    res = client.post("/api/links", json=payload, headers=priya_headers)
    assert res.status_code == 201
    data = res.get_json()
    assert data["title"] == "PostgreSQL Documentation"
    assert data["url"] == "https://www.postgresql.org/docs"  # trailing slash normalized
    assert data["tag"] == "database"
    assert data["is_starred"] is True
    assert data["is_pinned"] is False
    assert data["click_count"] == 0
    assert "id" in data


def test_post_link_missing_required_fields(client, priya_headers):
    """Test POST /api/links rejects requests missing title or URL."""
    res_no_url = client.post("/api/links", json={"title": "Missing URL"}, headers=priya_headers)
    assert res_no_url.status_code == 400

    res_no_title = client.post("/api/links", json={"url": "https://example.com"}, headers=priya_headers)
    assert res_no_title.status_code == 400


def test_get_links_list_and_filters(client, priya_headers):
    """Test GET /api/links returns links with category, tag, search, and sorting."""
    # Seed specific links for testing
    client.post("/api/links", json={"title": "Alpha Item", "url": "https://alpha.com", "tag": "test"}, headers=priya_headers)
    client.post("/api/links", json={"title": "Beta Item", "url": "https://beta.com", "tag": "prod", "is_starred": True}, headers=priya_headers)

    # 1. Fetch all
    res_all = client.get("/api/links", headers=priya_headers)
    assert res_all.status_code == 200
    data = res_all.get_json()
    assert "pinned" in data and "unpinned" in data and "all" in data
    assert any(l["title"] == "Alpha Item" for l in data["all"])

    # 2. Filter by search
    res_search = client.get("/api/links?search=beta", headers=priya_headers)
    titles = [l["title"] for l in res_search.get_json()["all"]]
    assert "Beta Item" in titles
    assert "Alpha Item" not in titles

    # 3. Filter by starred
    res_starred = client.get("/api/links?starred=true", headers=priya_headers)
    starred_titles = [l["title"] for l in res_starred.get_json()["all"]]
    assert "Beta Item" in starred_titles
    assert "Alpha Item" not in starred_titles


def test_put_link_update(client, priya_headers):
    """Test PUT /api/links/:id updates bookmark details."""
    created = client.post(
        "/api/links",
        json={"title": "Old Title", "url": "https://initial.org", "tag": "v1"},
        headers=priya_headers,
    ).get_json()
    link_id = created["id"]

    update_payload = {
        "title": "Updated Title v2",
        "url": "https://updated-domain.org",
        "note": "Modified notes",
        "tag": "v2",
        "is_starred": True,
    }
    res = client.put(f"/api/links/{link_id}", json=update_payload, headers=priya_headers)
    assert res.status_code == 200
    updated = res.get_json()
    assert updated["title"] == "Updated Title v2"
    assert updated["url"] == "https://updated-domain.org"
    assert updated["tag"] == "v2"
    assert updated["note"] == "Modified notes"
    assert updated["is_starred"] is True


def test_put_link_duplicate_url_conflict(client, priya_headers):
    """Test PUT /api/links/:id rejects changing URL to one that already exists in user's vault."""
    link1 = client.post("/api/links", json={"title": "First", "url": "https://unique-one.com"}, headers=priya_headers).get_json()
    link2 = client.post("/api/links", json={"title": "Second", "url": "https://unique-two.com"}, headers=priya_headers).get_json()

    # Attempt to change link2's URL to match link1's URL
    res = client.put(f"/api/links/{link2['id']}", json={"url": "https://unique-one.com"}, headers=priya_headers)
    assert res.status_code == 409
    assert "already exists" in res.get_json()["message"]


def test_delete_link_and_exclusion(client, priya_headers):
    """Test DELETE /api/links/:id soft deletes and excludes from active list."""
    link = client.post("/api/links", json={"title": "To Delete", "url": "https://remove-me.com"}, headers=priya_headers).get_json()
    link_id = link["id"]

    # Delete
    del_res = client.delete(f"/api/links/{link_id}", headers=priya_headers)
    assert del_res.status_code == 200
    assert del_res.get_json()["success"] is True

    # Ensure not present in listing
    fetch_res = client.get("/api/links", headers=priya_headers)
    active_ids = [l["id"] for l in fetch_res.get_json()["all"]]
    assert link_id not in active_ids


def test_cross_user_isolation(client, priya_headers, ravi_headers):
    """Test that links are private: user cannot access, modify or delete another user's links."""
    priya_link = client.post(
        "/api/links",
        json={"title": "Priya Secret", "url": "https://priya-private.org"},
        headers=priya_headers,
    ).get_json()
    link_id = priya_link["id"]

    # Ravi attempts to update Priya's link -> 404
    ravi_put = client.put(f"/api/links/{link_id}", json={"title": "Hacked"}, headers=ravi_headers)
    assert ravi_put.status_code == 404

    # Ravi attempts to delete Priya's link -> 404
    ravi_del = client.delete(f"/api/links/{link_id}", headers=ravi_headers)
    assert ravi_del.status_code == 404
