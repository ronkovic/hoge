# Task-019: Docker環境の構築 - TDD Red フェーズ

## タスク概要

Docker ComposeとDockerfileを作成し、postgres, backend, frontendサービスの定義とマルチステージビルドを実装する。

### 要件
- `docker-compose.yml`の作成
  - PostgreSQLサービスの定義
  - Backendサービスの定義（ポート3000）
  - Frontendサービスの定義（ポート5173）
- `backend/Dockerfile`の作成（マルチステージビルド）
- `frontend/Dockerfile`の作成（マルチステージビルド）
- 各サービスが正しく起動し、通信できること

## 実施内容

### 1. テスト環境のセットアップ

#### テストディレクトリの作成
```bash
mkdir -p test/docker/specs
cd test/docker
```

#### package.jsonの作成
```json
{
  "name": "docker-integration-tests",
  "version": "1.0.0",
  "description": "Integration tests for Docker Compose environment",
  "type": "module",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui"
  },
  "dependencies": {
    "yaml": "^2.3.4"
  },
  "devDependencies": {
    "@playwright/test": "^1.58.1",
    "@types/node": "^24.10.1"
  }
}
```

#### playwright.config.tsの作成
- testDir: ./specs
- workers: 1（シリアル実行）
- timeout: 60秒

#### 依存関係のインストール
```bash
npm install --legacy-peer-deps
npx playwright install
```

### 2. 統合テストの作成

#### test/docker/specs/docker-compose.spec.ts

合計16個のテストケースを作成:

##### ファイル存在確認テスト (3テスト)
1. `docker-compose.yml`ファイルが存在する
2. `backend/Dockerfile`が存在する
3. `frontend/Dockerfile`が存在する

##### docker-compose.yml設定確認テスト (5テスト)
1. `postgres`, `backend`, `frontend`サービスが定義されている
2. PostgreSQLサービスの設定確認
   - PostgreSQL公式イメージの使用
   - 環境変数（POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD）
   - ポートマッピング（5432）
   - ボリューム設定
3. Backendサービスの設定確認
   - ビルド設定（context: ./backend, dockerfile: Dockerfile）
   - ポートマッピング（3000）
   - 環境変数の設定
   - PostgreSQLへの依存関係
4. Frontendサービスの設定確認
   - ビルド設定（context: ./frontend, dockerfile: Dockerfile）
   - ポートマッピング（5173）
   - Backendへの依存関係

##### Dockerfileマルチステージビルド確認テスト (2テスト)
1. `backend/Dockerfile`がマルチステージビルドを使用
   - `FROM node:` の存在
   - `AS builder` ステージの存在
   - `AS production` ステージの存在
2. `frontend/Dockerfile`がマルチステージビルドを使用
   - `FROM node:` の存在（ビルドステージ）
   - `AS builder` ステージの存在
   - `FROM nginx:` の存在（プロダクションステージ）

##### Docker Compose起動テスト (6テスト)
1. `docker-compose up -d`で全サービスが起動できる
2. PostgreSQLコンテナが起動している
3. Backendコンテナが起動している
4. Frontendコンテナが起動している
5. Backendがヘルスチェックをパス（GET /api/todos）
6. Frontendがヘルスチェックをパス（http://localhost:5173）
7. FrontendからBackendへの通信が成功する

## テスト実行結果

### Red フェーズ - 失敗確認

```bash
npm run test --prefix test/docker
```

#### 結果サマリー
- **合計**: 16テスト
- **失敗**: 1テスト ✓ (期待通り)
- **未実行**: 15テスト ✓ (依存関係により実行されず)
- **実行時間**: 約3秒

#### 失敗理由
最初のテストケースで失敗:

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

  24 |     const fileExists = fs.existsSync(dockerComposePath);
  25 |
> 26 |     expect(fileExists).toBe(true);
     |                        ^
  27 |   });
  28 |
  29 |   // テストケース2: docker-compose.ymlに必要なサービスが定義されている
    at test/docker/specs/docker-compose.spec.ts:26:24
```

**失敗したテスト**:
- `docker-compose.yml file should exist`

**理由**: `docker-compose.yml`ファイルが存在しないため

これは**期待通りの動作**です。実装前なので、テストが失敗するのは正しいTDD Redフェーズです。

### 失敗したテストの詳細

#### ファイルが存在しないエラー
- `docker-compose.yml`: 存在しない ❌
- `backend/Dockerfile`: 存在しない（テスト未実行）
- `frontend/Dockerfile`: 存在しない（テスト未実行）

テストはシリアルモード（`test.describe.configure({ mode: 'serial' })`）で実行されるため、最初のテストが失敗した時点で残りの15テストは実行されませんでした。

## 次のステップ (Green フェーズ)

implementerエージェントが以下を実装する必要があります:

### 1. docker-compose.ymlの作成

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: tododb
      POSTGRES_USER: todouser
      POSTGRES_PASSWORD: todopass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://todouser:todopass@postgres:5432/tododb
      NODE_ENV: production
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2. backend/Dockerfileの作成（マルチステージビルド）

```dockerfile
# ビルドステージ
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# プロダクションステージ
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/*.js ./

EXPOSE 3000

CMD ["node", "server.js"]
```

### 3. frontend/Dockerfileの作成（マルチステージビルド）

```dockerfile
# ビルドステージ
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# プロダクションステージ
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Nginxの設定（APIプロキシ）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 4. frontend/nginx.confの作成

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## TDD Red フェーズ完了

✅ テストが失敗することを確認しました。
✅ 実装コードは一切書いていません。
✅ 次のGreenフェーズでテストをパスさせる実装を行います。

## テスト実行方法

```bash
# テストディレクトリに移動
cd test/docker

# テストを実行
npm test

# ヘッドレスモードでテストを実行
npm run test:headed

# UIモードでテストを実行
npm run test:ui
```

## 注意事項

- Docker Composeのクリーンアップは`test.afterAll`フックで自動的に実行されます
- テストは実際にDockerコンテナを起動するため、Docker Desktopが起動している必要があります
- テストの実行には数分かかる場合があります（イメージのダウンロード、ビルド、起動時間）
- ポート3000, 5173, 5432が既に使用されている場合、テストは失敗します
