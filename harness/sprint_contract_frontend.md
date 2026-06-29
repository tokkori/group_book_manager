# スプリントコントラクト — フロントエンド（デザイン刷新）

sprint: **frontend**

## Deliverables（作成・変更するファイル）

- `frontend/index.html` — Google Fonts（Shippori Mincho / Zen Kaku Gothic New）の読み込み
- `frontend/tailwind.config.ts` — デザイントークン（colors / fontFamily / boxShadow）
- `frontend/src/index.css` — `@layer base` + `@layer components`（再利用クラス）
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/BookCard.tsx`
- `frontend/src/components/SearchBar.tsx`
- `frontend/src/components/Pagination.tsx`
- `frontend/src/components/ConfirmDialog.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/UserRegisterPage.tsx`
- `frontend/src/pages/BookListPage.tsx`
- `frontend/src/pages/BookDetailPage.tsx`
- `frontend/src/pages/BookFormPage.tsx`
- `frontend/src/pages/CategoryPage.tsx`
- `frontend/src/pages/LocationPage.tsx`
- `frontend/src/pages/LoanListPage.tsx`
- `frontend/src/pages/ImportPage.tsx`

## Success（QA が確認する成功基準）

1. `frontend/tailwind.config.ts` の `theme.extend.colors` に `brand` / `brass` / `ink` / `paper` / `surface` / `line` / `clay` が定義され、`fontFamily.serif` に明朝系、`fontFamily.sans` に和文ゴシックが設定されている。
2. `frontend/src/index.css` に `.btn-primary` `.card` `.input` `.badge-available` `.badge-borrowed` 等の再利用コンポーネントクラスが定義されている。
3. 全 16 ファイルから `blue-600` / `blue-700` / `blue-400` / `bg-gray-50`（ページ背景用途）等のデフォルト Tailwind 主要色が排除され、ブランドトークンに置き換わっている。
4. すべての既存 `data-testid` 属性が維持されている（追加は可、削除・変更は不可）。
5. フォーム送信・ボタン onClick・ルーティング等のロジックは一切変更されていない（className とマークアップ装飾のみの変更）。
6. `cd frontend && npx tsc --noEmit` が型エラー 0 で完了する。

## Out of scope（今スプリントで行わないこと）

- バックエンド（FastAPI）・DB・API スキーマの変更
- 新規ページ・新規機能の追加
- ルーティング構造・状態管理ロジックの変更
- 依存パッケージの追加（フォントは CDN `<link>` で読み込み、npm 依存は増やさない）
