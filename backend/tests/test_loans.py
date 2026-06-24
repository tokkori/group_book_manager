"""貸出・返却テスト: US-14〜US-17"""


def create_book(client, headers):
    return client.post("/api/books", json={"title": "テスト書籍"}, headers=headers).json()["id"]


def test_borrow_book(client, auth_headers):
    book_id = create_book(client, auth_headers)
    resp = client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["book_id"] == book_id
    assert data["return_date"] is None


def test_borrow_already_borrowed_fails(client, auth_headers, auth_headers_2):
    book_id = create_book(client, auth_headers)
    client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers)
    resp = client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers_2)
    assert resp.status_code == 400
    assert "貸出中" in resp.json()["detail"]


def test_borrow_nonexistent_book(client, auth_headers):
    resp = client.post("/api/loans", json={"book_id": 9999}, headers=auth_headers)
    assert resp.status_code == 404


def test_return_book(client, auth_headers):
    book_id = create_book(client, auth_headers)
    loan_id = client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers).json()["id"]
    resp = client.put(f"/api/loans/{loan_id}/return", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["return_date"] is not None


def test_return_already_returned_fails(client, auth_headers):
    book_id = create_book(client, auth_headers)
    loan_id = client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers).json()["id"]
    client.put(f"/api/loans/{loan_id}/return", headers=auth_headers)
    resp = client.put(f"/api/loans/{loan_id}/return", headers=auth_headers)
    assert resp.status_code == 400
    assert "返却済み" in resp.json()["detail"]


def test_return_by_another_user(client, auth_headers, auth_headers_2):
    """返却は誰でも可能（BR-LOAN-04）"""
    book_id = create_book(client, auth_headers)
    loan_id = client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers).json()["id"]
    resp = client.put(f"/api/loans/{loan_id}/return", headers=auth_headers_2)
    assert resp.status_code == 200


def test_get_active_loans(client, auth_headers):
    book_id1 = create_book(client, auth_headers)
    book_id2 = create_book(client, auth_headers)
    client.post("/api/loans", json={"book_id": book_id1}, headers=auth_headers)
    client.post("/api/loans", json={"book_id": book_id2}, headers=auth_headers)
    resp = client.get("/api/loans", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_loan_history(client, auth_headers):
    book_id = create_book(client, auth_headers)
    loan_id = client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers).json()["id"]
    client.put(f"/api/loans/{loan_id}/return", headers=auth_headers)
    client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers)

    resp = client.get(f"/api/loans/history/{book_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_book_status_after_borrow(client, auth_headers):
    """貸出後に書籍の is_borrowed が True になること"""
    book_id = create_book(client, auth_headers)
    client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers)
    book = client.get(f"/api/books/{book_id}", headers=auth_headers).json()
    assert book["is_borrowed"] is True


def test_book_status_after_return(client, auth_headers):
    """返却後に is_borrowed が False に戻ること"""
    book_id = create_book(client, auth_headers)
    loan_id = client.post("/api/loans", json={"book_id": book_id}, headers=auth_headers).json()["id"]
    client.put(f"/api/loans/{loan_id}/return", headers=auth_headers)
    book = client.get(f"/api/books/{book_id}", headers=auth_headers).json()
    assert book["is_borrowed"] is False
