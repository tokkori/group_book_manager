"""認証テスト: US-01 ログイン, US-02 ログアウト, US-03 ユーザー登録"""


def test_register_success(client):
    resp = client.post("/api/auth/register", json={
        "username": "alice",
        "display_name": "Alice",
        "password": "securepass",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "alice"
    assert "hashed_password" not in data


def test_register_duplicate_username(client):
    client.post("/api/auth/register", json={"username": "bob", "display_name": "Bob", "password": "pass1234"})
    resp = client.post("/api/auth/register", json={"username": "bob", "display_name": "Bob2", "password": "pass1234"})
    assert resp.status_code == 400
    assert "既に使用されています" in resp.json()["detail"]


def test_register_short_password(client):
    resp = client.post("/api/auth/register", json={"username": "charlie", "display_name": "Charlie", "password": "short"})
    assert resp.status_code == 422


def test_register_invalid_username_chars(client):
    resp = client.post("/api/auth/register", json={"username": "user name!", "display_name": "U", "password": "password123"})
    assert resp.status_code == 422


def test_login_success(client):
    client.post("/api/auth/register", json={"username": "dave", "display_name": "Dave", "password": "mypassword"})
    resp = client.post("/api/auth/login", json={"username": "dave", "password": "mypassword"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={"username": "eve", "display_name": "Eve", "password": "correctpass"})
    resp = client.post("/api/auth/login", json={"username": "eve", "password": "wrongpass"})
    assert resp.status_code == 401
    assert "正しくありません" in resp.json()["detail"]


def test_login_nonexistent_user(client):
    resp = client.post("/api/auth/login", json={"username": "ghost", "password": "anything"})
    assert resp.status_code == 401


def test_get_me(client, auth_headers):
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["username"] == "testuser"


def test_protected_endpoint_without_token(client):
    resp = client.get("/api/books")
    assert resp.status_code == 401


def test_health_check_no_auth(client):
    resp = client.get("/health")
    assert resp.status_code == 200
