"""インポートテスト: US-18"""
import io


def make_csv(rows: list[str]) -> bytes:
    content = "\n".join(rows)
    return content.encode("utf-8")


def test_import_csv_success(client, auth_headers):
    csv_data = make_csv([
        "title,author,isbn,publisher,published_year,location",
        "Python入門,山田太郎,978-4-00-000001-0,出版社A,2023,棚A-1",
        "JavaScript応用,鈴木花子,978-4-00-000002-0,出版社B,2022,棚A-2",
    ])
    resp = client.post(
        "/api/import/books",
        files={"file": ("books.csv", io.BytesIO(csv_data), "text/csv")},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] == 2
    assert data["skipped"] == 0
    assert len(data["errors"]) == 0


def test_import_csv_skip_empty_title(client, auth_headers):
    csv_data = make_csv([
        "title,author",
        "有効な書籍,著者A",
        ",著者B",  # タイトル空 → スキップ
    ])
    resp = client.post(
        "/api/import/books",
        files={"file": ("books.csv", io.BytesIO(csv_data), "text/csv")},
        headers=auth_headers,
    )
    data = resp.json()
    assert data["success"] == 1
    assert data["skipped"] == 1


def test_import_csv_skip_duplicate_isbn(client, auth_headers):
    # 先に1冊登録
    client.post("/api/books", json={"title": "既存書籍", "isbn": "978-4-00-000001-0"}, headers=auth_headers)

    csv_data = make_csv([
        "title,isbn",
        "新書籍,978-4-00-000001-0",  # ISBN重複 → スキップ
        "別書籍,978-4-00-000002-0",
    ])
    resp = client.post(
        "/api/import/books",
        files={"file": ("books.csv", io.BytesIO(csv_data), "text/csv")},
        headers=auth_headers,
    )
    data = resp.json()
    assert data["success"] == 1
    assert data["skipped"] == 1


def test_import_invalid_file_type(client, auth_headers):
    resp = client.post(
        "/api/import/books",
        files={"file": ("books.txt", io.BytesIO(b"not a csv"), "text/plain")},
        headers=auth_headers,
    )
    assert resp.status_code == 400
    assert "CSV" in resp.json()["detail"]


def test_import_with_category_autocreate(client, auth_headers):
    """カテゴリが存在しない場合は自動作成されること"""
    csv_data = make_csv([
        "title,category",
        "技術書,新カテゴリ",
    ])
    client.post(
        "/api/import/books",
        files={"file": ("books.csv", io.BytesIO(csv_data), "text/csv")},
        headers=auth_headers,
    )
    cats = client.get("/api/categories", headers=auth_headers).json()
    assert any(c["name"] == "新カテゴリ" for c in cats)
