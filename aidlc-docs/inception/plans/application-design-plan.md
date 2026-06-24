# Application Design Plan — 部署内書籍管理アプリ

## 設計方針
- **アーキテクチャスタイル**: レイヤードアーキテクチャ（Router → Service → Repository → DB）
- **コンポーネント分割**: ドメイン単位（Auth / Book / Category / Loan / Import）
- **フロントエンド**: ページ単位 + 共通コンポーネント

## 生成ステップ

### Step 1: コンポーネント定義（components.md）
- [x] バックエンドコンポーネントの定義
- [x] フロントエンドコンポーネントの定義

### Step 2: コンポーネントメソッド定義（component-methods.md）
- [x] 各バックエンドサービスのメソッドシグネチャ
- [x] 各フロントエンドページ・コンポーネントのprops/state

### Step 3: サービス定義（services.md）
- [x] FastAPI ルーター（APIエンドポイント一覧）
- [x] フロントエンドAPI呼び出しサービス

### Step 4: 依存関係定義（component-dependency.md）
- [x] バックエンドレイヤー間の依存関係
- [x] フロントエンド・バックエンド間の依存関係

### Step 5: 統合ドキュメント（application-design.md）
- [x] 上記4ドキュメントの統合サマリー
