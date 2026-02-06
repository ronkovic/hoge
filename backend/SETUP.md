# バックエンドセットアップ手順

## 前提条件

- Node.js (v18以上)
- PostgreSQL (v12以上)

## データベースセットアップ

1. PostgreSQLを起動

```bash
# Homebrewを使用している場合
brew services start postgresql@18

# または直接起動
postgres -D /opt/homebrew/var/postgresql@18
```

2. データベースとユーザーを作成

```bash
# PostgreSQLに接続
psql postgres

# データベースを作成
CREATE DATABASE todo_db;

# ユーザーを作成（必要に応じて）
CREATE USER postgres WITH PASSWORD 'password';

# 権限を付与
GRANT ALL PRIVILEGES ON DATABASE todo_db TO postgres;
```

3. テーブルを作成

```bash
# schema.sqlを実行してテーブルを作成
psql -U postgres -d todo_db -f backend/schema.sql
```

## 環境変数の設定

`.env`ファイルを作成（注: .envはGitで管理されません）:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
DB_USER=postgres
DB_PASSWORD=password
PORT=3001
```

## 依存関係のインストール

```bash
cd backend
npm install
```

## テストの実行

```bash
npm test
```

## サーバーの起動

```bash
# 開発モード
npm run dev

# プロダクションモード
npm start
```

## 実装内容

### データベース接続 (db.js)

- pg-poolを使用したPostgreSQL接続プール
- 環境変数からの設定読み込み

### モデル実装

#### User (models/User.js)

- `create({ name, email })`: ユーザー作成
- `findAll()`: 全ユーザー取得
- `findById({ id })`: ID検索
- `update({ id, name, email })`: ユーザー更新
- `delete({ id })`: ユーザー削除

#### Post (models/Post.js)

- `create({ user_id, title, content })`: 投稿作成
- `findAll()`: 全投稿取得
- `findById({ id })`: ID検索
- `findByUserId({ user_id })`: ユーザーID検索
- `update({ id, title, content })`: 投稿更新
- `delete({ id })`: 投稿削除

#### Comment (models/Comment.js)

- `create({ post_id, user_id, content })`: コメント作成
- `findAll()`: 全コメント取得
- `findById({ id })`: ID検索
- `findByPostId({ post_id })`: 投稿ID検索
- `findByUserId({ user_id })`: ユーザーID検索
- `update({ id, content })`: コメント更新
- `delete({ id })`: コメント削除

### スキーマ (schema.sql)

- `users`: id, name, email, created_at
- `posts`: id, user_id, title, content, created_at
- `comments`: id, post_id, user_id, content, created_at

外部キー制約とカスケード削除が設定されています。
