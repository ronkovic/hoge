# シンプルなTodoアプリのセットアップ

## 概要

基本的なTodoアプリケーションのフロントエンド、バックエンド、データベースのセットアップを行う。

## 要件

### 1. データベースセットアップ

- PostgreSQL 16を使用
- データベース名: `todo_db`
- テーブル: `todos`
  - id (serial primary key)
  - title (varchar(200) not null)
  - completed (boolean default false)
  - created_at (timestamp default now())

### 2. バックエンドセットアップ

- Node.js + Express.js を使用
- ポート: 3001
- 必要なエンドポイント:
  - `GET /api/todos` - Todo一覧取得
  - `POST /api/todos` - Todo作成
  - `PUT /api/todos/:id` - Todo更新
  - `DELETE /api/todos/:id` - Todo削除
- データベース接続には`pg`パッケージを使用
- 環境変数は`.env`ファイルで管理

### 3. フロントエンドセットアップ

- React + Vite を使用
- ポート: 5173
- 必要な機能:
  - Todo一覧表示
  - Todoの追加フォーム
  - Todoの完了/未完了切り替え
  - Todoの削除ボタン
- axiosでバックエンドAPIと通信

## 成果物

- `backend/` ディレクトリ配下にバックエンドコード
- `frontend/` ディレクトリ配下にフロントエンドコード
- `database/` ディレクトリ配下にDBスキーマ定義（SQL）
- 各ディレクトリにREADME.mdを配置
