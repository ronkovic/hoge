# Task-007: 認証APIエンドポイントの実装 - RED Phase

## タスク概要

認証関連のエンドポイント（register, login, logout, me）を実装する。
コントローラー、ルート、サービス層を含む。

## プロジェクト構成

- **Backend**: Node.js + Express.js
- **Test Framework**: Jest + supertest
- **Pattern**: テーブル駆動テスト (test.each)

## 認証API仕様

### 1. POST /api/auth/register - ユーザー登録

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Cases:**
- 400: username, email, passwordのいずれかが欠けている
- 409: 既に同じusernameまたはemailが存在する

### 2. POST /api/auth/login - ログイン

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**Error Cases:**
- 400: email, passwordのいずれかが欠けている
- 401: 認証情報が正しくない

### 3. POST /api/auth/logout - ログアウト

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Cases:**
- 401: トークンが無効または存在しない

### 4. GET /api/auth/me - 現在のユーザー情報取得

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Cases:**
- 401: トークンが無効または存在しない

## テスト戦略

1. **正常系テスト**: 各エンドポイントが正しく動作することを確認
2. **エラーハンドリングテスト**: バリデーションエラー、認証エラーを確認
3. **統合テスト**: register → login → me → logout の一連のフローを確認

## RED Phase - テスト作成

### 作成ファイル

- `backend/__tests__/auth.test.js` - 認証エンドポイントのテスト

### テストケース

1. ユーザー登録 (POST /api/auth/register)
   - 正常にユーザーを登録できること
   - 必須フィールドが欠けている場合、400を返すこと
   - 既存のユーザーと重複する場合、409を返すこと

2. ログイン (POST /api/auth/login)
   - 正しい認証情報でログインできること
   - トークンが返されること
   - 誤った認証情報では401を返すこと

3. ログアウト (POST /api/auth/logout)
   - 有効なトークンでログアウトできること
   - トークンなしでは401を返すこと

4. ユーザー情報取得 (GET /api/auth/me)
   - 有効なトークンでユーザー情報を取得できること
   - トークンなしでは401を返すこと

5. 統合フローテスト
   - register → login → me → logout の順で実行できること

## 実行日時

2026-02-05

## テスト実行結果

### コマンド
```bash
npm test -- __tests__/auth.test.js
```

### 結果サマリー
```
Test Suites: 1 failed, 1 total
Tests:       14 failed, 14 total
Time:        0.287 s
```

### 失敗したテスト一覧

#### 正常系テスト (4件)
1. ✕ POST /api/auth/register - 新規ユーザーを登録できること
   - Expected: 201, Received: 404
2. ✕ POST /api/auth/login - 正しい認証情報でログインできること
   - Expected: 200, Received: 404
3. ✕ GET /api/auth/me - 有効なトークンでユーザー情報を取得できること
   - Expected: 200, Received: 404
4. ✕ POST /api/auth/logout - 有効なトークンでログアウトできること
   - Expected: 200, Received: 404

#### エラーハンドリングテスト (9件)
5. ✕ POST /api/auth/register - username が欠けている場合、400を返すこと
   - Expected: 400, Received: 404
6. ✕ POST /api/auth/register - email が欠けている場合、400を返すこと
   - Expected: 400, Received: 404
7. ✕ POST /api/auth/register - password が欠けている場合、400を返すこと
   - Expected: 400, Received: 404
8. ✕ POST /api/auth/login - email が欠けている場合、400を返すこと
   - Expected: 400, Received: 404
9. ✕ POST /api/auth/login - password が欠けている場合、400を返すこと
   - Expected: 400, Received: 404
10. ✕ POST /api/auth/login - 誤った認証情報では401を返すこと
    - Expected: 401, Received: 404
11. ✕ GET /api/auth/me - トークンなしでは401を返すこと
    - Expected: 401, Received: 404
12. ✕ POST /api/auth/logout - トークンなしでは401を返すこと
    - Expected: 401, Received: 404
13. ✕ POST /api/auth/register - 既存のユーザーと重複する場合、409を返すこと
    - Expected: 409, Received: 404

#### 統合フローテスト (1件)
14. ✕ register → login → me → logout の一連のフローが正常に動作すること
    - Expected: 201, Received: 404

### 分析

全てのテストが404エラーを返しており、これは想定通りの結果です。
認証エンドポイント（/api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me）がまだ実装されていないため、全てのリクエストが404 Not Foundを返しています。

これはTDD RED フェーズの正常な状態であり、次のGREENフェーズでこれらのエンドポイントを実装してテストをパスさせる必要があります。

## 次のステップ

GREEN Phase: テストをパスさせる実装を行う

### 実装が必要なコンポーネント

1. **認証ミドルウェア** (`backend/middleware/auth.js`)
   - JWTトークンの検証
   - リクエストからのトークン抽出

2. **ユーザーモデル/サービス** (`backend/services/auth.js` or `backend/models/user.js`)
   - ユーザー登録ロジック
   - パスワードのハッシュ化
   - ログイン認証
   - ユーザー情報取得

3. **認証ルート** (`backend/routes/auth.js` or `server.js`に追加)
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - GET /api/auth/me

4. **依存パッケージの追加**
   - jsonwebtoken (JWT生成/検証)
   - bcrypt (パスワードハッシュ化)
