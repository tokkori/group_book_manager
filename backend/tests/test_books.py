"""書籍テスト: US-04〜US-11"""
import pytest


def create_book(client, headers, **kwargs):
    payload = {"title": "テスト書籍", "author": "著者名", **kwargs}
    return client.post("/api/books", json=payload, headers=headers)


def test_create_book_success(client, auth_headers):
    resp = create_book(client, auth_headers, isbn="978-4-00-000000-0", location="棚A-1")
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "テスト書籍"
    assert data["is_borrowed"] is False


def test_create_book_no_title(client, auth_headers):
    resp = client.post("/api/books", json={"title": ""}, headers=auth_headers)
    assert resp.status_code == 422


def test_create_book_isbn_duplicate_warning(client, auth_headers):
    create_book(client, auth_headers, isbn="978-4-00-000001-0")
    resp = create_book(client, auth_headers, isbn="978-4-00-000001-0")
    assert resp.status_code == 201
    assert resp.json()["isbn_duplicate"] is True


def test_get_books_list(client, auth_headers):
    create_book(client, auth_headers, title="Python入門")
    create_book(client, auth_headers, title="JavaScript入門")
    resp = client.get("/api/books", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


def test_get_books_keyword_search(client, auth_headers):
    create_book(client, auth_headers, title="Python入門")
    create_book(client, auth_headers, title="JavaScript入門")
    resp = client.get("/api/books?keyword=Python", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
    assert resp.json()["items"][0]["title"] == "Python入門"


def test_get_book_detail(client, auth_headers):
    book_id = create_book(client, auth_headers).json()["id"]
    resp = client.get(f"/api/books/{book_id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == book_id
    assert "loan_history" in data


def test_get_book_not_found(client, auth_headers):
    resp = client.get("/api/books/9999", headers=auth_headers)
    assert resp.status_code == 404


def test_update_book(client, auth_headers):
    book_id = create_book(client, auth_headers).json()["id"]
    resp = client.put(f"/api/books/{book_id}", json={"title": "更新タイトル", "location": "棚B-2"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "更新タイトル"


def test_delete_book_success(client, auth_headers):
    book_id = create_book(client, auth_headers).json()["id"]
    resp = client.delete(f"/api/books/{book_id}", headers=auth_headers)
    assert resp.status_code == 204


def test_delete_borrowed_book_fails(client, auth_headers):
    book_id = create_book(client, auth_headers).json()["id"]
    client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers)
    resp = client.delete(f"/api/books/{book_id}", headers=auth_headers)
    assert resp.status_code == 400
    assert "貸出中" in resp.json()["detail"]


def test_filter_by_category(client, auth_headers):
    # カテゴリ作成
    cat_resp = client.post("/api/categories", json={"name": "技術書"}, headers=auth_headers)
    cat_id = cat_resp.json()["id"]
    create_book(client, auth_headers, title="技術書1", category_id=cat_id)
    create_book(client, auth_headers, title="小説1")

    resp = client.get(f"/api/books?category_id={cat_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
    assert resp.json()["items"][0]["title"] == "技術書1"
