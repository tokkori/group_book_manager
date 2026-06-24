# ドメインエンティティ定義

## User（ユーザー）

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| id | Integer | PK, Auto | 主キー |
| username | String(50) | UNIQUE, NOT NULL | ログインID |
| hashed_password | String(255) | NOT NULL | bcryptハッシュ済みパスワード |
| display_name | String(100) | NOT NULL | 表示名 |
| created_at | DateTime | NOT NULL, default=now | 作成日時 |

**制約:**
- username は英数字・アンダースコア・ハイフンのみ（3〜50文字）
- password は平文で8文字以上（ハッシュ化前）

---

## Category（カテゴリ）

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| id | Integer | PK, Auto | 主キー |
| name | String(100) | UNIQUE, NOT NULL | カテゴリ名 |
| description | String(500) | NULL可 | 説明 |

**制約:**
- name は1〜100文字
- nameは全カテゴリ内でユニーク

---

## Book（書籍）

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| id | Integer | PK, Auto | 主キー |
| title | String(500) | NOT NULL | タイトル |
| author | String(200) | NULL可 | 著者 |
| isbn | String(20) | NULL可, INDEX | ISBN（ハイフンあり/なし両対応） |
| publisher | String(200) | NULL可 | 出版社 |
| published_year | Integer | NULL可 | 出版年 |
| category_id | Integer | FK(Category.id), NULL可 | カテゴリ（SET NULL on delete） |
| location_id | Integer | FK(Location.id), NULL可 | 保管場所（SET NULL on delete） |
| location | String(200) | NULL可 | 保管場所テキスト（レガシー、参照用） |
| created_at | DateTime | NOT NULL, default=now | 作成日時 |
| updated_at | DateTime | NOT NULL, onupdate=now | 更新日時 |

**制約:**
- title は1〜500文字（必須）
- published_year は1000〜現在年の範囲
- ISBNはユニーク強制なし（重複は警告のみ）

**リレーション:**
- Category (Many-to-One, nullable) — カテゴリ削除時はNULL設定
- Location (Many-to-One, nullable) — 保管場所削除時はNULL設定
- LoanRecord (One-to-Many)

---

## Location（保管場所）

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| id | Integer | PK, Auto | 主キー |
| name | String(200) | UNIQUE, NOT NULL | 保管場所名（例: 棚A-1, 会議室本棚） |

**制約:**
- name は1〜200文字
- nameは全保管場所内でユニーク
- 書籍が紐付いている保管場所は削除不可

---

## LoanRecord（貸出記録）

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| id | Integer | PK, Auto | 主キー |
| book_id | Integer | FK(Book.id), NOT NULL | 書籍ID |
| user_id | Integer | FK(User.id), NOT NULL | 借り手ユーザーID |
| loan_date | Date | NOT NULL, default=today | 貸出日 |
| return_date | Date | NULL可 | 返却日（NULLは貸出中） |

**制約:**
- return_date is NULL → 貸出中
- return_date is NOT NULL → 返却済み
- 同一book_idで return_date IS NULL のレコードは最大1件

**リレーション:**
- Book (Many-to-One, CASCADE DELETE)
- User (Many-to-One, RESTRICT DELETE)

---

## ER図（テキスト表現）

```
+----------+       +----------+       +--------------+
|   User   |       |  Book    |       |  LoanRecord  |
+----------+       +----------+       +--------------+
| id (PK)  |<------| id (PK)  |<------| id (PK)      |
| username |  loan | title    |  loan | book_id (FK) |
| hashed_pw|       | author   |       | user_id (FK) |
| display  |       | isbn     |       | loan_date    |
| created  |       | publisher|       | return_date  |
+----------+       | pub_year |       +--------------+
                   | cat_id(FK)|
                   | location |      +----------+
                   | created  |      | Category |
                   | updated  |      +----------+
                   +----------+      | id (PK)  |
                        |            | name     |
                        +----------->| desc     |
                                     +----------+
```
