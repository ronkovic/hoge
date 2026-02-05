# Task-005: TDD Red Phase - バックエンドのデータベース接続とモデル実装

## 実行日時
2026-02-05

## タスク概要
PostgreSQLへの接続設定と、User, Post, Commentのモデルを実装するためのTDD Redフェーズを実行。

## プロジェクト情報
- **言語**: JavaScript (Node.js)
- **テストフレームワーク**: Jest
- **パッケージマネージャー**: npm
- **データベース**: PostgreSQL
- **DBライブラリ**: pg (node-postgres)

## 実施内容

### 1. プロジェクト構造の確認

既存の構成:
- `backend/db.js`: PostgreSQL接続設定 (pg.Pool使用)
- `backend/package.json`: Jest設定済み
- `backend/__tests__/api.test.js`: Todo APIのテスト (既存)
- `database/schema.sql`: todosテーブルのスキーマ

### 2. 要件分析

タスク005の要件に基づき、以下の3つのモデルを実装することを決定:

#### User モデル
- `id`: 主キー
- `name`: ユーザー名
- `email`: メールアドレス
- `created_at`: 作成日時

#### Post モデル
- `id`: 主キー
- `user_id`: ユーザーID (外部キー)
- `title`: タイトル
- `content`: 本文
- `created_at`: 作成日時

#### Comment モデル
- `id`: 主キー
- `post_id`: 投稿ID (外部キー)
- `user_id`: ユーザーID (外部キー)
- `content`: コメント内容
- `created_at`: 作成日時

### 3. テスト設計

#### テストパターン
既存のテストコード (`api.test.js`) を参考に、`test.each` を使用したテーブル駆動テストパターンを採用。

#### 作成したテストファイル
`backend/__tests__/models.test.js`

#### テストケース構成

**Database Connection (2テスト)**
1. データベースに接続できること
2. データベースからクエリ結果を取得できること

**User Model (5テスト)**
1. create - ユーザーを作成できること
2. findAll - 全てのユーザーを取得できること
3. findById - IDでユーザーを取得できること
4. update - ユーザー情報を更新できること
5. delete - ユーザーを削除できること

**Post Model (6テスト)**
1. create - 投稿を作成できること
2. findAll - 全ての投稿を取得できること
3. findById - IDで投稿を取得できること
4. findByUserId - ユーザーIDで投稿を取得できること
5. update - 投稿を更新できること
6. delete - 投稿を削除できること

**Comment Model (7テスト)**
1. create - コメントを作成できること
2. findAll - 全てのコメントを取得できること
3. findById - IDでコメントを取得できること
4. findByPostId - 投稿IDでコメントを取得できること
5. findByUserId - ユーザーIDでコメントを取得できること
6. update - コメントを更新できること
7. delete - コメントを削除できること

### 4. テスト実行結果

```
Test Suites: 1 failed, 1 total
Tests:       20 failed, 20 total
Snapshots:   0 total
Time:        0.204 s
```

**失敗の内訳:**
- Database Connection: 2件失敗 (DB接続エラー - 環境変数未設定のため)
- User Model: 5件失敗 (モデルファイルが存在しないため)
- Post Model: 6件失敗 (モデルファイルが存在しないため)
- Comment Model: 7件失敗 (モデルファイルが存在しないため)

### 5. エラー詳細

#### データベース接続エラー
```
AggregateError: at node_modules/pg-pool/index.js:45:11
```
原因: 環境変数 (.env) が設定されていないため、PostgreSQLに接続できない

#### モデルインポートエラー
```
expect(received).not.toBeNull()
Received: null
```
原因: `models/User.js`, `models/Post.js`, `models/Comment.js` が存在しないため

## TDD Red フェーズの成功条件

✅ **全てのテストが失敗している** (20/20件)
- モデルファイルが存在しないため、期待通りに失敗
- データベース接続テストも環境変数未設定のため失敗

## 次のステップ (Green Phase)

1. **データベーススキーマの作成**
   - `database/schema.sql` に User, Post, Comment テーブルを追加

2. **環境変数の設定**
   - `.env` ファイルを作成
   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD を設定

3. **モデルファイルの実装**
   - `backend/models/User.js` を実装
   - `backend/models/Post.js` を実装
   - `backend/models/Comment.js` を実装

4. **各モデルに必要なメソッド**
   - User: create, findAll, findById, update, delete
   - Post: create, findAll, findById, findByUserId, update, delete
   - Comment: create, findAll, findById, findByPostId, findByUserId, update, delete

## ファイル変更履歴

### 新規作成
- `backend/__tests__/models.test.js` (272行)

### 変更なし
- 既存ファイルへの変更なし

## テストコードの品質

### 良い点
- テーブル駆動テストパターンを使用
- 既存のコードスタイルと統一
- 各操作に対する期待値を明確に定義
- エラーハンドリングを考慮 (モデルが存在しない場合)

### 改善の余地
- データベース接続テストは環境依存のため、モックを検討する可能性あり
- テストデータのクリーンアップ処理は Green Phase で実装予定

## 結論

TDD Red フェーズは成功しました。全20件のテストが期待通りに失敗し、次のGreen フェーズで実装すべき内容が明確になりました。

次のフェーズでは、テストをパスさせるために必要最小限のコードを実装します。
