"""カテゴリテスト: US-12, US-13"""


def test_create_category(client, auth_headers):
    resp = client.post("/api/categories", json={"name": "技術書", "description": "技術関連の書籍"}, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.json()["name"] == "技術書"


def test_create_duplicate_category(client, auth_headers):
    client.post("/api/categories", json={"name": "技術書"}, headers=auth_headers)
    resp = client.post("/api/categories", json={"name": "技術書"}, headers=auth_headers)
    assert resp.status_code == 400
    assert "既に存在します" in resp.json()["detail"]


def test_get_categories(client, auth_headers):
    client.post("/api/categories", json={"name": "カテゴリA"}, headers=auth_headers)
    client.post("/api/categories", json={"name": "カテゴリB"}, headers=auth_headers)
    resp = client.get("/api/categories", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_update_category(client, auth_headers):
    cat_id = client.post("/api/categories", json={"name": "旧名"}, headers=auth_headers).json()["id"]
    resp = client.put(f"/api/categories/{cat_id}", json={"name": "新名"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "新名"


def test_delete_empty_category(client, auth_headers):
    cat_id = client.post("/api/categories", json={"name": "空カテゴリ"}, headers=auth_headers).json()["id"]
    resp = client.delete(f"/api/categories/{cat_id}", headers=auth_headers)
    assert resp.status_code == 204


def test_delete_category_with_books_fails(client, auth_headers):
    cat_id = client.post("/api/categories", json={"name": "使用中"}, headers=auth_headers).json()["id"]
    client.post("/api/books", json={"title": "本", "category_id": cat_id}, headers=auth_headers)
    resp = client.delete(f"/api/categories/{cat_id}", headers=auth_headers)
    assert resp.status_code == 400
    assert "書籍が登録されています" in resp.json()["detail"]
