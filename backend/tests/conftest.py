import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import get_db
from app.models.base import Base

# インメモリSQLiteをテスト用DBとして使用
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=False)
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    """登録済みユーザーのJWTヘッダーを返す"""
    client.post("/api/auth/register", json={
        "username": "testuser",
        "display_name": "テストユーザー",
        "password": "password123",
    })
    resp = client.post("/api/auth/login", json={"username": "testuser", "password": "password123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_2(client):
    """2人目のユーザーのJWTヘッダーを返す"""
    client.post("/api/auth/register", json={
        "username": "testuser2",
        "display_name": "テストユーザー2",
        "password": "password123",
    })
    resp = client.post("/api/auth/login", json={"username": "testuser2", "password": "password123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
