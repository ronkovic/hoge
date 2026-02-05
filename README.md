<<<<<<< HEAD
# AAD Prototype

プロジェクト初期構造
=======
# Todo アプリケーション

Node.js、React、PostgreSQLで構築されたフルスタックTodoアプリケーション。

## プロジェクト構成

このプロジェクトは3つの主要コンポーネントで構成されています:

- **Backend**: Express.jsで構築されたREST API (ポート: 3001)
- **Frontend**: React + Viteで構築されたSPA (ポート: 5173)
- **Database**: PostgreSQL 16データベース

```
.
├── backend/          # Node.js + Express.js API サーバー
├── frontend/         # React + Vite フロントエンド
├── database/         # PostgreSQL スキーマ定義
└── test/            # 統合テスト
```

## クイックスタート

### 前提条件

- Node.js (v18以上推奨)
- PostgreSQL 16
- npm

### 1. データベースのセットアップ

```bash
# PostgreSQLにログイン
psql -U postgres

# データベース作成
CREATE DATABASE todo_db;

# スキーマの適用
psql -U postgres -d todo_db -f database/schema.sql
```

詳細は [database/README.md](./database/README.md) を参照してください。

### 2. バックエンドのセットアップ

```bash
cd backend

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp env.example .env
# .envファイルを編集してデータベース接続情報を設定

# サーバーの起動
npm start
```

バックエンドは http://localhost:3001 で起動します。

詳細は [backend/README.md](./backend/README.md) を参照してください。

### 3. フロントエンドのセットアップ

```bash
cd frontend

# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

フロントエンドは http://localhost:5173 で起動します。

詳細は [frontend/README.md](./frontend/README.md) を参照してください。

## API仕様

バックエンドは以下のREST APIエンドポイントを提供します:

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET     | /api/todos   | 全てのTodoを取得 |
| POST    | /api/todos   | 新しいTodoを作成 |
| PUT     | /api/todos/:id | Todoを更新 |
| DELETE  | /api/todos/:id | Todoを削除 |

### データ型

```typescript
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}
```

## 機能

- ✅ Todo一覧表示
- ✅ Todo追加
- ✅ Todo完了/未完了切り替え
- ✅ Todo削除
- ✅ PostgreSQLによる永続化
- ✅ RESTful API
- ✅ E2Eテスト (Playwright)

## テスト

### バックエンドテスト

```bash
cd backend
npm test
```

### フロントエンドE2Eテスト

```bash
cd frontend
npm run test:e2e
```

フロントエンドには合計17個のE2Eテストが実装されています。

### 統合テスト

```bash
# プロジェクトルートから実行
go test ./test/...
```

## 開発ワークフロー

このプロジェクトはTDD (Test-Driven Development) アプローチで開発されています:

1. **Red**: テストを作成（失敗することを確認）
2. **Green**: テストをパスする最小限の実装
3. **Refactor**: コードの改善とリファクタリング

## 技術スタック

### バックエンド
- Node.js
- Express.js
- PostgreSQL (pg)
- dotenv
- Jest (テスト)

### フロントエンド
- React 19.2.0
- Vite 7.2.4
- TypeScript 5.9.3
- Axios 1.13.4
- Playwright 1.58.1 (E2Eテスト)
- ESLint 9.39.1

### データベース
- PostgreSQL 16

## トラブルシューティング

### バックエンドがデータベースに接続できない

`.env`ファイルのデータベース接続情報を確認してください:

```bash
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=todo_db
DB_PORT=5432
```

### フロントエンドがAPIに接続できない

1. バックエンドが起動していることを確認
2. `frontend/src/api/todoApi.ts`の`API_BASE_URL`を確認

### ポートが既に使用されている

- バックエンド: `backend/server.js`の`PORT`変数を変更
- フロントエンド: `frontend/vite.config.ts`のポート設定を変更

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 関連ドキュメント

- [Backend README](./backend/README.md) - バックエンドの詳細
- [Frontend README](./frontend/README.md) - フロントエンドの詳細
- [Database README](./database/README.md) - データベーススキーマの詳細
>>>>>>> feature/_20260205_153345-task-020
