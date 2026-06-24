# 要件確認の質問

書籍管理アプリの開発にあたり、以下の質問にお答えください。
各質問の `[Answer]:` タグの後に、選択肢の記号（A, B, C など）を記入してください。
選択肢に当てはまるものがない場合は `X` を選び、具体的な内容を記載してください。

---

## Question 1: アプリケーションの種類
どのような形態のアプリケーションを希望しますか？

A) Webアプリケーション（ブラウザで使用）

B) デスクトップアプリケーション（PCにインストール）

C) モバイルアプリ（スマートフォン対応）

D) WebアプリとモバイルアプリのPC対応（レスポンシブ）

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2: 想定利用者
このアプリを誰が使いますか？

A) 部署メンバー全員（閲覧・貸出申請など）

B) 管理者のみ（書籍管理・在庫管理）

C) 部署メンバー（一般ユーザー）＋ 管理者（管理者権限）の2種類のユーザー

D) 社内全員が使えるが、管理は特定部署が行う

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3: 主要な機能（複数選択可）
アプリに必要な機能はどれですか？（該当するものをカンマ区切りで回答例: A,B,C）

A) 書籍の登録・編集・削除（タイトル、著者、ISBN等）

B) 書籍の検索・一覧表示

C) 貸出・返却管理（誰がいつ借りているかを管理）

D) 貸出予約機能

E) 書籍の評価・レビュー機能

F) カテゴリ・タグ管理

G) 蔵書数・在庫数の管理

X) Other (please describe after [Answer]: tag below)

[Answer]: A,B,C,F,X(書籍の場所の登録)

---

## Question 4: 認証・ログイン
ユーザー認証はどのように行いますか？

A) 認証なし（社内LANのみで使用するため不要）

B) シンプルなID/パスワード認証

C) 社内のActive Directory / LDAP と連携したSSOを希望

D) GoogleなどのOAuth認証

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5: データの保存先
データをどこに保存しますか？

A) ローカルサーバー（社内に立てるサーバー）

B) クラウド（AWS、Azure、GCPなど）

C) どちらでも良い（AIに任せる）

D) 既存のデータベースサーバーに追加したい

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6: 既存データの移行
現在、書籍情報をどこかで管理していますか？

A) Excelやスプレッドシートで管理している（データ移行が必要）

B) 紙やホワイトボードで管理している

C) まだどこにも管理していない（新規）

D) 別のシステムで管理している（移行が必要）

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7: 想定規模
管理する書籍数と利用者数の規模はどのくらいですか？

A) 小規模：書籍50冊以下、利用者10名以下

B) 中規模：書籍50〜500冊、利用者10〜50名

C) 大規模：書籍500冊以上、利用者50名以上

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8: 技術スタック（バックエンド）
バックエンドの技術に希望や制約はありますか？

A) 特になし（AIに任せる、モダンなスタックで）

B) Python（FastAPI / Django など）

C) Node.js（Express / NestJS など）

D) Java（Spring Boot など）

E) PHP（Laravel など）

X) Other (please describe after [Answer]: tag below)

[Answer]: B(FastAPI)

---

## Question 9: 技術スタック（フロントエンド）
フロントエンドの技術に希望や制約はありますか？

A) 特になし（AIに任せる）

B) React

C) Vue.js

D) Angular

E) シンプルなHTML/CSSのみ（フレームワーク不使用）

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 10: バーコード・ISBN機能
書籍のバーコード（ISBN）スキャン機能は必要ですか？

A) 不要（手入力のみ）

B) あると便利（カメラやバーコードリーダーで読み取りたい）

C) 必須（必ずバーコードスキャン機能を含めてほしい）

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 11: 通知機能
返却期限の通知など、通知機能は必要ですか？

A) 不要

B) アプリ内通知のみでよい

C) メール通知が必要

D) Slack等のチャットツールへの通知が必要

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 12: セキュリティ要件
このアプリのセキュリティ要件はどのレベルですか？

A) 最小限（社内ツールのため、基本的なセキュリティのみでよい）

B) 標準（一般的なWebアプリのセキュリティ対策を適用）

C) 高セキュリティ（機密情報を扱うため、厳格なセキュリティが必要）

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 13: セキュリティ拡張の適用 (Security Baseline Extension)
AI-DLCにはセキュリティルールを自動チェックする拡張機能があります。適用しますか？

A) Yes — すべてのSECURITYルールをブロッキング制約として適用（本番グレードのアプリに推奨）

B) No — SECURITYルールをスキップ（PoC、プロトタイプ、実験的プロジェクトに適したオプション）

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 14: 回復力・可用性拡張の適用 (Resiliency Baseline Extension)
AI-DLCには回復力・高可用性のベストプラクティスを適用する拡張機能があります。適用しますか？

**この拡張機能とは**: AWS Well-Architectedフレームワーク（信頼性の柱）に基づく設計時のベストプラクティスを適用します。フォルトトレランス、高可用性、オブザーバビリティ、リカバリー性を設計・コードに組み込みます。

A) Yes — 回復力ベースラインをベストプラクティスとして適用（業務クリティカルなワークロードに推奨）

B) No — 回復力ベースラインをスキップ（PoC、プロトタイプ、実験的プロジェクトに適したオプション）

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 15: プロパティベーステスト拡張の適用 (Property-Based Testing Extension)
AI-DLCにはプロパティベーステスト（PBT）ルールを適用する拡張機能があります。適用しますか？

A) Yes — すべてのPBTルールをブロッキング制約として適用（ビジネスロジック、データ変換、シリアライゼーション、ステートフルコンポーネントを持つプロジェクトに推奨）

B) Partial — 純粋関数とシリアライゼーションのラウンドトリップのみにPBTルールを適用（限定的なアルゴリズム複雑度のプロジェクトに適したオプション）

C) No — すべてのPBTルールをスキップ（シンプルなCRUDアプリ、UIのみのプロジェクト、または重要なビジネスロジックのない薄い統合レイヤーに適したオプション）

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

回答が完了したら「完了しました」とお知らせください。
