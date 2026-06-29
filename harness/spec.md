# フロントエンドのデザイン刷新 — 「書架（Reading Room）」デザインシステムの導入

## 背景

現状のフロントエンドは Tailwind のデフォルトユーティリティ（`blue-600` / `gray-50` / 白カード + `rounded-lg border`）のみで構成されており、ハーネスの Design 評価軸でいう **Originality（独創性）が低い**。色・タイポグラフィに明確なアイデンティティがなく、「AI が生成しがちな無個性なダッシュボード」に見える。

本改修は **機能・API・データ構造には一切手を入れず**、デザイントークンとスタイルだけを刷新する frontend-only スコープ。書籍管理という題材と日本語 UI に合わせ、**紙・革装丁・図書室の真鍮ランプ**を想起させる意図的なビジュアルアイデンティティ「書架（Reading Room）」を導入する。

## スコープ

- scope: **frontend-only**
- db_changes: **なし**
- new_endpoints: **なし**
- 既存の `data-testid` / フォーム挙動 / ルーティング / API 呼び出しは **完全に維持**（QA テストとの互換性を壊さない）

## デザイン方針（Reading Room）

| 役割 | 内容 |
|---|---|
| ブランド（プライマリ） | 深い「図書館グリーン」= 革装丁・蔵書ラベルを想起する forest green スケール |
| アクセント | 真鍮（brass / amber）= ランプ・箔押しの金 |
| ニュートラル | 温かみのある紙色（warm paper / cream）。冷たい `gray-50` を廃止 |
| テキスト | 温黒（warm near-black `ink`）と段階的なミュート色 |
| ステータス | 在架 = brand 系サージュ、貸出中 = clay（テラコッタ） |
| 書体 | 見出し = 明朝（Shippori Mincho）/ 本文・UI = Zen Kaku Gothic New |
| 形状・影 | 角丸 `xl`、温かい線色、紙の浮き上がりを表す柔らかいシャドウ |

ヘッダーは白から **深緑の図書室バー**へ変更し、アプリ全体の identity アンカーにする。

## フロントエンドタスク

1. **デザイントークン定義** — `frontend/tailwind.config.ts` の `theme.extend` に `brand` / `brass` / `ink` / `paper` / `surface` / `line` / `clay` カラースケール、`fontFamily.sans` / `fontFamily.serif`、`boxShadow.card` / `boxShadow.raised` を追加。
2. **グローバルスタイル** — `frontend/src/index.css` に `@layer base`（紙色背景・温黒テキスト・明朝見出し）と `@layer components`（`.card` `.input` `.field-label` `.btn-primary` `.btn-secondary` `.btn-danger-outline` `.badge-available` `.badge-borrowed` `.page-title` `.section-title`）を定義。
3. **Web フォント読み込み** — `frontend/index.html` に Google Fonts（Shippori Mincho / Zen Kaku Gothic New）の `<link>` を追加。
4. **共有コンポーネント再スタイル** — `Layout.tsx`（深緑ヘッダー）, `BookCard.tsx`, `SearchBar.tsx`, `Pagination.tsx`, `ConfirmDialog.tsx`。
5. **認証ページ再スタイル** — `LoginPage.tsx`, `UserRegisterPage.tsx`（紙色背景 + 製本風カード）。
6. **主要ページ再スタイル** — `BookListPage.tsx`, `BookDetailPage.tsx`, `BookFormPage.tsx`, `CategoryPage.tsx`, `LocationPage.tsx`, `LoanListPage.tsx`, `ImportPage.tsx`。

## 受入条件（ユーザー視点）

1. アプリ全体の背景が冷たいグレーから温かい紙色に変わり、ヘッダーが深緑の図書室バーになっている。
2. プライマリボタン・リンク・フォーカスリングが青ではなくブランドの図書館グリーン／真鍮で統一されている。
3. 見出しが明朝体、本文が日本語ゴシックで表示され、タイポgrafィ階層が明確である。
4. 書籍カード・ステータスバッジ（在架／貸出中）・テーブル・フォームが同一のデザイントークンで一貫している。
5. すべての既存操作（ログイン・登録・書籍 CRUD・貸出／返却・カテゴリ／保管場所管理・インポート）が従来通り動作し、`data-testid` が変わっていない。
6. `cd frontend && npx tsc --noEmit` が型エラーなしで通る。
