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

## アーキテクチャ

システムアーキテクチャの構成は以下の通りです:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Frontend   │         │   Backend   │         │  Database   │
│   (React)   │◄───────►│ (Express.js)│◄───────►│(PostgreSQL) │
│ Port: 5173  │  HTTP   │ Port: 3001  │   SQL   │ Port: 5432  │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │
      │                       │
      ▼                       ▼
  User Browser          REST API Server
  - Todo UI              - GET /api/todos
  - Form Input           - POST /api/todos
  - State Mgmt           - PUT /api/todos/:id
                         - DELETE /api/todos/:id
```

## クイックスタート

### 前提条件

- Node.js (v18以上推奨)
- PostgreSQL 16
- npm
- Docker & Docker Compose (オプション)

### オプション: Docker Composeで一括起動

Docker Composeを使用すると、全てのサービスを一度に起動できます:

```bash
# プロジェクトルートから実行
docker compose up -d

# または、設定ファイルを明示的に指定
docker compose -f docker/docker-compose.yml up -d

# ログを確認
docker compose logs -f

# 停止
docker compose down
```

詳細は [docker/README.md](./docker/README.md) を参照してください。

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

## CI/CD

このプロジェクトはGitHub Actionsを使用した継続的インテグレーション/デプロイメントをサポートしています:

- **自動テスト**: プルリクエスト時に全テストが自動実行されます
- **コード品質チェック**: ESLintによる静的解析が実行されます
- **ビルド検証**: 本番ビルドが正常に完了することを確認します

設定ファイルは `.github/workflows/` に配置されます。

## デプロイ

### 本番環境へのデプロイ

#### Herokuへのデプロイ例

```bash
# Heroku CLIのインストール
npm install -g heroku

# ログイン
heroku login

# アプリケーション作成
heroku create your-app-name

# PostgreSQLアドオンの追加
heroku addons:create heroku-postgresql:hobby-dev

# 環境変数の設定
heroku config:set NODE_ENV=production

# デプロイ
git push heroku main
```

#### Dockerを使用したデプロイ

```bash
# イメージのビルド
docker build -t todo-app .

# コンテナの起動
docker run -p 3001:3001 --env-file .env todo-app
```

## セキュリティ

### セキュリティベストプラクティス

- **環境変数の管理**: `.env`ファイルは`.gitignore`に含まれており、Gitリポジトリにコミットされません
- **認証情報の保護**: データベースパスワードやAPIキーは必ず環境変数で管理してください
- **依存関係の更新**: 定期的に`npm audit`を実行し、脆弱性をチェックしてください
- **HTTPS通信**: 本番環境では必ずHTTPSを使用してください
- **入力検証**: ユーザー入力は常にサニタイズされています

```bash
# セキュリティ脆弱性のチェック
cd backend && npm audit
cd frontend && npm audit

# 自動修正
npm audit fix
```

## パフォーマンス最適化

### フロントエンド最適化

- **コード分割**: Viteの動的インポートを使用して必要なコードのみを読み込み
- **バンドルサイズ削減**: 本番ビルド時に自動的に最適化されます
- **キャッシング**: ブラウザキャッシュを活用した静的アセットの配信

### バックエンド最適化

- **データベース接続プーリング**: PostgreSQLコネクションプールを使用
- **インデックス最適化**: 頻繁にクエリされるカラムにはインデックスを設定
- **レスポンス圧縮**: Gzip圧縮を有効化してデータ転送量を削減

```bash
# パフォーマンス測定
cd frontend
npm run build
npm run preview

# バンドルサイズ分析
npm run analyze
```

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 関連ドキュメント

- [Backend README](./backend/README.md) - バックエンドの詳細
- [Frontend README](./frontend/README.md) - フロントエンドの詳細
- [Database README](./database/README.md) - データベーススキーマの詳細
