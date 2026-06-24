# ビルド手順

## 前提条件

- **Docker**: Docker 24.x 以上
- **Docker Compose**: v2（`docker compose` コマンド対応）
- **ディスク容量**: 約2GB（イメージ込み）
- **ネットワーク**: イメージの初回ダウンロード時にインターネット接続が必要

---

## ビルドステップ

### 1. 環境変数ファイルの準備

```bash
cd c:\Users\yuma\Documents\kiro_test
cp .env.example .env
```

`.env` を編集し、以下を本番用の値に変更:

```env
POSTGRES_PASSWORD=<強固なパスワード>
SECRET_KEY=<ランダム32バイトhex>
```

SECRET_KEY の生成:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

プロキシ環境の場合は以下をアンコメント:
```env
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080
NO_PROXY=localhost,127.0.0.1,db,backend
```

### 2. Docker イメージのビルド

```bash
docker compose build
```

**期待される出力:**
- `db`: postgres:16-alpine の pull
- `backend`: Python依存パッケージのインストール（requirements.txt）
- `frontend`: npm ci → Vite ビルド → Nginx イメージ構築

**ビルド時間の目安:** 初回5〜10分（ネットワーク速度依存）

### 3. コンテナの起動

```bash
docker compose up -d
```

### 4. 起動確認

```bash
# 全コンテナが Running か確認
docker compose ps

# 期待される状態:
# db       - Running (healthy)
# backend  - Running (healthy)
# frontend - Running
```

### 5. ヘルスチェック確認

```bash
# バックエンドの直接ヘルスチェック
docker compose exec backend curl -f http://localhost:8000/health
# 期待: {"status":"ok"}

# フロントエンド経由のヘルスチェック
curl http://localhost:3000/health
# 期待: {"status":"ok"}
```

### 6. ブラウザアクセス

http://localhost:3000 にアクセスしてログイン画面が表示されることを確認。

---

## トラブルシューティング

### backend がヘルスチェックで失敗する

```bash
docker compose logs backend
```

よくある原因:
- DB接続エラー → `.env` の `POSTGRES_PASSWORD` が db コンテナと一致しているか確認
- Alembic マイグレーションエラー → `docker compose exec backend alembic upgrade head` を手動実行

### frontend がビルドで失敗する（プロキシ環境）

```bash
docker compose logs frontend
```

npm のネットワークエラーの場合:
- `.env` に `HTTP_PROXY` / `HTTPS_PROXY` を正しく設定しているか確認
- `NO_PROXY` に `localhost,127.0.0.1` が含まれているか確認

### db が起動しない

```bash
docker compose logs db
```

- ボリュームの権限エラー → `docker compose down -v` で完全リセット後に再起動
