# 統合テスト手順

## 目的

Docker Compose で3コンテナ（db / backend / frontend）が連携して正しく動作するか確認する。

---

## テストシナリオ

### Scenario 1: エンドツーエンド — ユーザー登録からログインまで

1. `docker compose up -d` でシステム起動
2. `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"integuser","display_name":"統合テストユーザー","password":"testpass123"}'`
   - 期待: 201 Created
3. `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"integuser","password":"testpass123"}'`
   - 期待: 200 OK、`access_token` が返される

### Scenario 2: 書籍CRUD フロー

1. ログインしてトークン取得（Scenario 1）
2. `curl -X POST http://localhost:3000/api/books -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title":"統合テスト書籍","author":"テスト著者","location":"棚A-1"}'`
   - 期待: 201 Created
3. `curl http://localhost:3000/api/books -H "Authorization: Bearer $TOKEN"`
   - 期待: 200 OK、`total >= 1`
4. `curl -X DELETE http://localhost:3000/api/books/{id} -H "Authorization: Bearer $TOKEN"`
   - 期待: 204 No Content

### Scenario 3: 貸出・返却フロー

1. 書籍登録（Scenario 2 の Step 2）
2. `curl -X POST http://localhost:3000/api/loans -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"book_id":1}'`
   - 期待: 201 Created
3. 同一書籍を再度貸出
   - 期待: 400 "この書籍は現在貸出中です"
4. `curl -X PUT http://localhost:3000/api/loans/{loan_id}/return -H "Authorization: Bearer $TOKEN"`
   - 期待: 200 OK、`return_date` が設定

### Scenario 4: フロントエンド → バックエンド接続

1. `curl http://localhost:3000/`
   - 期待: 200 OK、HTML（React SPAの index.html）
2. `curl http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"integuser","password":"testpass123"}'`
   - 期待: 200 OK（Nginx → backend プロキシ成功）

### Scenario 5: PostgreSQL データ永続化

1. 書籍を登録
2. `docker compose down` → `docker compose up -d`
3. 書籍が存在することを確認（ボリュームマウントで永続化）

---

## 実行方法（手動）

```bash
# 1. システム起動
docker compose up -d

# 2. 起動待ち（ヘルスチェック通過まで）
docker compose ps  # 全サービスが healthy/running になるまで待つ

# 3. テスト実行（下記コマンドを順番に実行）
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"integuser","display_name":"テスト","password":"testpass123"}' | echo "registered")

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"integuser","password":"testpass123"}' | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

echo "Token: $TOKEN"

curl -s http://localhost:3000/api/books -H "Authorization: Bearer $TOKEN" | python -m json.tool

# 4. クリーンアップ
docker compose down -v
```

---

## 成功基準

- 全シナリオでHTTPステータスコードが期待値通り
- フロントエンド（localhost:3000）経由でバックエンドAPIにアクセスできる
- PostgreSQL にデータが正しく保存される
- コンテナ再起動後もデータが保持される
