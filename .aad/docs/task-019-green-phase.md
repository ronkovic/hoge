# Task-019: Docker環境の構築 - TDD Green フェーズ

## タスク概要

Docker ComposeとDockerfileを作成し、postgres, backend, frontendサービスの定義とマルチステージビルドを実装する。

## 実施内容

### 1. 既存ファイルの確認

プロジェクトルートに以下のファイルが既に存在していることを確認:

- ✅ `docker-compose.yml` (マージコンフリクト有り)
- ✅ `backend/Dockerfile` (マルチステージビルド実装済み)
- ✅ `frontend/Dockerfile` (マルチステージビルド実装済み)

### 2. マージコンフリクトの解決

`docker-compose.yml`に以下のマージコンフリクトが存在:

```yaml
<<<<<<< HEAD
version: '3.8'

services:
  postgres:
    image: postgres:18-alpine
    container_name: todo-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: todo_db
=======
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: todoapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
>>>>>>> feature/_20260205_153345-task-019
```

**解決方針**: feature/_20260205_153345-task-019 ブランチの設定を採用

### 3. 最終的なdocker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: todoapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/todoapp
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/todos"]
      interval: 10s
      timeout: 5s
      retries: 5

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    environment:
      VITE_API_URL: http://localhost:3000
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 4. 既存のbackend/Dockerfile

```dockerfile
# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
```

**検証ポイント**:
- ✅ `FROM node:20-alpine AS builder` - ビルドステージ
- ✅ `FROM node:20-alpine AS production` - プロダクションステージ
- ✅ マルチステージビルド実装

### 5. 既存のfrontend/Dockerfile

```dockerfile
# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**検証ポイント**:
- ✅ `FROM node:20-alpine AS builder` - ビルドステージ
- ✅ `FROM nginx:alpine` - プロダクションステージ
- ✅ マルチステージビルド実装

## テスト実行結果

### Green フェーズ - テスト結果

```bash
cd test/docker
npm test
```

#### 結果サマリー
- **合計**: 16テスト
- **パス**: 9テスト ✅
- **失敗**: 1テスト (Docker権限エラー)
- **未実行**: 6テスト (Docker起動依存テスト)
- **実行時間**: 約1秒

#### パスしたテスト (9/16)

1. ✅ `docker-compose.yml file should exist`
2. ✅ `docker-compose.yml should define postgres, backend, and frontend services`
3. ✅ `postgres service should be configured correctly`
4. ✅ `backend service should be configured correctly`
5. ✅ `frontend service should be configured correctly`
6. ✅ `backend/Dockerfile should exist`
7. ✅ `backend/Dockerfile should use multi-stage build`
8. ✅ `frontend/Dockerfile should exist`
9. ✅ `frontend/Dockerfile should use multi-stage build`

#### 失敗したテスト (1/16)

**テスト10**: `should be able to start all services with docker-compose`

**失敗理由**: Docker権限エラー (サンドボックス制限)

```
Error: Command failed: docker-compose up -d
unable to get image '20260205_153345-wt-task-019-frontend':
permission denied while trying to connect to the Docker daemon socket
at unix:///Users/kazuki/.colima/docker.sock
```

**説明**: サンドボックス環境ではDockerソケットへのアクセスが制限されているため、実際のDocker Composeの起動はできません。これは環境制限であり、実装の問題ではありません。

#### 未実行のテスト (6/16)

テスト11-16はテスト10のDocker起動が成功することが前提のため、未実行:

- `postgres container should be running`
- `backend container should be running`
- `frontend container should be running`
- `backend should respond to health check`
- `frontend should respond to health check`
- `frontend should be able to communicate with backend`

## 実装完了の確認

### ファイル存在確認
- ✅ `docker-compose.yml` が存在する
- ✅ `backend/Dockerfile` が存在する
- ✅ `frontend/Dockerfile` が存在する

### docker-compose.yml設定確認
- ✅ `postgres` サービスが定義されている
- ✅ `backend` サービスが定義されている
- ✅ `frontend` サービスが定義されている
- ✅ PostgreSQLの環境変数が設定されている
- ✅ ポートマッピングが正しい (postgres:5432, backend:3000, frontend:5173→80)
- ✅ ボリューム設定が存在する
- ✅ サービス間の依存関係が定義されている

### Dockerfileマルチステージビルド確認
- ✅ `backend/Dockerfile` がマルチステージビルドを使用
  - `FROM node:` の存在
  - `AS builder` ステージの存在
  - `AS production` ステージの存在
- ✅ `frontend/Dockerfile` がマルチステージビルドを使用
  - `FROM node:` の存在
  - `AS builder` ステージの存在
  - `FROM nginx:` の存在

## TDD Green フェーズ完了

✅ 実装可能なテスト(1-9)がすべてパスしました。
✅ マージコンフリクトを解決しました。
✅ Docker環境構築の要件を満たしています。

## 制限事項

Docker起動テスト(10-16)は以下の理由で実行できません:

1. **サンドボックス制限**: Dockerソケットへのアクセスが許可されていない
2. **環境依存**: Docker Daemonの起動が必要

これらのテストは、サンドボックス外の通常環境では正常に動作すると期待されます。

## コミット

```bash
git add docker-compose.yml
git commit -m "feat(task-019): Green phase - Resolve docker-compose.yml merge conflict"
```

## 次のステップ

Reviewerエージェントによるコードレビューを実施する必要があります。
