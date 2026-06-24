# Infrastructure Design — book-manager

## コンテナ構成

### コンテナ一覧

| サービス名 | ベースイメージ | ポート | 役割 |
|---|---|---|---|
| db | postgres:16-alpine | 5432 (内部のみ) | PostgreSQL データベース |
| backend | python:3.12-slim (カスタム) | 8000 (内部) | FastAPI アプリケーション |
| frontend | node:20-alpine (ビルド) + nginx:alpine | 80→3000 | React SPA + Nginx静的配信 |

### ネットワーク

```
+--------------------------------------------------+
|  Docker Network: book-manager-network (bridge)   |
|                                                  |
|  +----------+   +----------+   +----------+      |
|  | frontend |-->| backend  |-->|    db    |      |
|  | :80      |   | :8000    |   | :5432    |      |
|  +----------+   +----------+   +----------+      |
|       |                                           |
+-------|-------------------------------------------+
        | ホストマシン
        | localhost:3000
```

**アクセスルール:**
- ホスト → frontend: `localhost:3000`（ブラウザからのアクセス）
- frontend（Nginx） → backend: `http://backend:8000`（リバースプロキシ）
- backend → db: `postgresql://db:5432`（内部通信のみ）
- db: 外部ポート公開なし（セキュリティ上の理由）

---

## ボリューム

| ボリューム名 | マウント先 | 用途 |
|---|---|---|
| postgres_data | /var/lib/postgresql/data | DBデータの永続化 |

---

## 環境変数一覧

### backend コンテナ

| 変数名 | 値（例） | 説明 |
|---|---|---|
| DATABASE_URL | postgresql://bookuser:bookpass@db:5432/bookdb | DB接続文字列 |
| SECRET_KEY | (ランダム32バイト hex) | JWTシークレットキー |
| ALGORITHM | HS256 | JWT署名アルゴリズム |
| ACCESS_TOKEN_EXPIRE_MINUTES | 480 | JWTトークン有効期限（8時間） |
| HTTP_PROXY | http://proxy.example.com:8080 | HTTPプロキシ（任意） |
| HTTPS_PROXY | http://proxy.example.com:8080 | HTTPSプロキシ（任意） |
| NO_PROXY | localhost,127.0.0.1,db | プロキシ除外ホスト（db は必須） |
| http_proxy | (HTTP_PROXYと同値) | Pythonライブラリ向け小文字版（任意） |
| https_proxy | (HTTPS_PROXYと同値) | Pythonライブラリ向け小文字版（任意） |
| no_proxy | (NO_PROXYと同値) | Pythonライブラリ向け小文字版（任意） |

### db コンテナ

| 変数名 | 値（例） | 説明 |
|---|---|---|
| POSTGRES_DB | bookdb | DB名 |
| POSTGRES_USER | bookuser | DBユーザー |
| POSTGRES_PASSWORD | bookpass | DBパスワード |

**注意**: 実際の運用では `.env` ファイルを使用し、`.gitignore` に追加すること。

---

## ヘルスチェック設定

### db
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U bookuser -d bookdb"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s
```

### backend
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 20s
```

### 起動順序制御
```
db (healthy) → backend (healthy) → frontend
```
`depends_on` + `condition: service_healthy` で保証

---

## Nginx 設定方針（frontend）

```nginx
# /api/* → backend にリバースプロキシ
location /api/ {
    proxy_pass http://backend:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# それ以外 → React SPA の index.html（クライアントサイドルーティング対応）
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```

---

## セキュリティ考慮事項

| 項目 | 対応 |
|---|---|
| DBポートの外部公開 | なし（内部ネットワークのみ） |
| SECRET_KEY の管理 | .env ファイル（.gitignore に追加） |
| パスワードの平文保存 | なし（bcryptハッシュ化） |
| コンテナ実行ユーザー | backend/frontend は非rootユーザーで実行 |
| DBパスワード | .env で管理、コードに直書きしない |
