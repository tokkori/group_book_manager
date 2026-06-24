# ユニットテスト実行手順

## テスト対象

| テストファイル | 対象 | テスト数（概算） |
|---|---|---|
| test_auth.py | ログイン・登録・JWT | 10 |
| test_books.py | 書籍CRUD・検索・削除チェック | 11 |
| test_categories.py | カテゴリCRUD・削除チェック | 6 |
| test_loans.py | 貸出・返却・重複チェック | 9 |
| test_import.py | CSVインポート・スキップ | 5 |

---

## 実行方法

### Docker コンテナ内で実行

```bash
# コンテナ起動中に実行
docker compose exec backend pytest tests/ -v
```

### 特定のテストファイルのみ実行

```bash
docker compose exec backend pytest tests/test_auth.py -v
docker compose exec backend pytest tests/test_books.py -v
docker compose exec backend pytest tests/test_loans.py -v
```

### カバレッジ付き実行

```bash
docker compose exec backend pytest tests/ --cov=app --cov-report=term-missing -v
```

---

## テスト環境

- **テストDB**: インメモリ SQLite（テストごとにリセット）
- **テストクライアント**: FastAPI の TestClient
- **Fixtures**:
  - `client` — テスト用HTTPクライアント（DBセッション差し替え済み）
  - `auth_headers` — 認証済みユーザー1のJWTヘッダー
  - `auth_headers_2` — 認証済みユーザー2のJWTヘッダー

---

## 期待される結果

```
========================= test session starts =========================
...
tests/test_auth.py::test_register_success PASSED
tests/test_auth.py::test_register_duplicate_username PASSED
tests/test_auth.py::test_login_success PASSED
...
========================= 41 passed in Xs =========================
```

全テスト PASSED、0 failures を確認する。

---

## テスト失敗時の対応

1. エラーメッセージからどのアサーションが失敗したか確認
2. 該当するService/Repositoryのロジックを修正
3. テストを再実行して PASSED を確認
