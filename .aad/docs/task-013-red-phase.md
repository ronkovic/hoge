# Task-013: フロントエンドの状態管理とAPI連携の実装 - TDD Red フェーズ

## タスク概要

Zustandによる状態管理ストアとaxiosを使用したAPIクライアントを実装する。認証状態管理を含む。

### 要件

1. **Zustand状態管理ストア**
   - Todo状態をZustandで管理
   - グローバルな状態管理でコンポーネント間のprops drilling を回避

2. **認証状態管理**
   - ユーザー情報とトークンの管理
   - ログイン/ログアウト機能
   - 認証状態の永続化

3. **axiosベースのAPIクライアント**
   - 認証ヘッダーの自動設定
   - エラーハンドリング
   - リトライ機能
   - タイムアウト設定

## 実施内容

### 1. プロジェクトセットアップ

#### 依存関係の追加 (package.json)

```json
{
  "dependencies": {
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "vitest": "^3.0.0",
    "@vitest/ui": "^3.0.0",
    "@testing-library/react": "^16.1.0",
    "jsdom": "^25.0.1"
  },
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

#### Vite設定の更新 (vite.config.ts)

Vitestのテスト環境を設定:

```typescript
export default defineConfig({
  // ...
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

#### TypeScript設定の更新 (tsconfig.app.json)

Vitestのグローバル型定義を追加:

```json
{
  "compilerOptions": {
    "types": ["vite/client", "vitest/globals"]
  }
}
```

### 2. テストセットアップファイルの作成

#### frontend/src/test/setup.ts

```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

### 3. ユニットテストの作成

#### frontend/src/__tests__/useTodoStore.test.ts

合計6つのテストグループ、181行のテストケースを作成:

##### 初期状態 (2テスト)
1. 初期状態でtodosは空配列である
2. 初期状態でisLoadingはfalseである

##### setTodos (3テスト - it.each)
1. 単一のTodoをセットできる
2. 複数のTodoをセットできる
3. 空配列をセットできる

##### addTodo (2テスト - it.each)
1. Todoを追加できる
2. 複数のTodoを連続して追加できる

##### updateTodo (2テスト - it.each)
1. Todoを更新できる
2. 複数のTodoのうち特定のTodoを更新できる

##### deleteTodo (2テスト - it.each)
1. Todoを削除できる
2. 複数のTodoのうち特定のTodoを削除できる

##### setLoading (2テスト - it.each)
1. ローディング状態をtrueに設定できる
2. ローディング状態をfalseに設定できる

#### frontend/src/__tests__/useAuthStore.test.ts

合計5つのテストグループ、122行のテストケースを作成:

##### 初期状態 (3テスト)
1. 初期状態でuserはnullである
2. 初期状態でtokenはnullである
3. 初期状態でisAuthenticatedはfalseである

##### login (2テスト - it.each)
1. ユーザーとトークンを設定してログインできる
2. 異なるユーザーでログインできる

##### logout (1テスト)
1. ログアウトするとuserとtokenがnullになる

##### updateUser (2テスト - it.each)
1. ユーザー情報を更新できる
2. ユーザー名のみ更新できる

##### setToken (2テスト - it.each)
1. トークンを設定できる
2. 異なるトークンを設定できる

#### frontend/src/__tests__/apiClient.test.ts

合計7つのテストグループ、153行のテストケースを作成:

##### 基本設定 (2テスト)
1. デフォルトのベースURLが設定されている
2. デフォルトのContent-Typeがapplication/jsonである

##### 認証トークンの設定 (3テスト - it.each)
1. トークンをヘッダーに設定できる
2. 異なるトークンをヘッダーに設定できる
3. トークンを削除できる

##### リクエストインターセプター (3テスト)
1. リクエストインターセプターが設定されている
2. トークンがある場合、Authorizationヘッダーが追加される
3. トークンがない場合、Authorizationヘッダーは追加されない

##### レスポンスインターセプター (4テスト - it.each)
1. レスポンスインターセプターが設定されている
2. 401エラーの場合、認証エラーハンドリングが実行される
3. 403エラーの場合、認可エラーハンドリングが実行される
4. 500エラーの場合、サーバーエラーハンドリングが実行される

##### ヘルパーメソッド (3テスト)
1. setAuthTokenで認証トークンを設定できる
2. setAuthTokenでnullトークンを設定するとヘッダーから削除される
3. getAuthTokenで現在の認証トークンを取得できる

##### リトライ機能 (3テスト - it.each)
1. ネットワークエラーの場合、リトライする
2. 500エラーの場合、リトライする
3. 400エラーの場合、リトライしない

##### タイムアウト設定 (1テスト)
1. デフォルトのタイムアウトが設定されている

### 4. 型定義の作成

#### frontend/src/types/auth.ts

認証関連の型定義を作成:

```typescript
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
```

## テスト実行結果

### Red フェーズ - 失敗確認

#### 前提条件

テスト実行には以下のパッケージのインストールが必要です:

```bash
npm install zustand vitest @vitest/ui @testing-library/react jsdom
```

**注意**: サンドボックス環境ではnpmレジストリへのアクセスが制限されているため、package.jsonに依存関係を追加しましたが、実際のインストールは実行されていません。

#### 期待される失敗

テストを実行すると、以下のファイルが存在しないため失敗します:

```bash
npm test
```

#### 失敗理由

すべての失敗は以下の理由による:

1. **useTodoStoreが存在しない**
   - `src/stores/useTodoStore.ts` が未実装
   - インポートエラーが発生

2. **useAuthStoreが存在しない**
   - `src/stores/useAuthStore.ts` が未実装
   - インポートエラーが発生

3. **apiClientが存在しない**
   - `src/api/apiClient.ts` が未実装
   - インポートエラーが発生

これは**期待通りの動作**です。実装前なので、テストが失敗するのは正しいTDD Redフェーズです。

## テストファイルのサマリー

| ファイル | 行数 | テストケース数 |
|---------|-----|--------------|
| useTodoStore.test.ts | 181行 | 13テスト |
| useAuthStore.test.ts | 122行 | 10テスト |
| apiClient.test.ts | 153行 | 16テスト |
| **合計** | **456行** | **39テスト** |

## 必要な実装ファイル

implementerエージェントが以下を実装する必要があります:

### 1. Zustand状態管理ストア

#### src/stores/useTodoStore.ts
- `todos: Todo[]` - Todo配列
- `isLoading: boolean` - ローディング状態
- `setTodos(todos: Todo[]): void` - Todoリストを設定
- `addTodo(todo: Todo): void` - Todoを追加
- `updateTodo(todo: Todo): void` - Todoを更新
- `deleteTodo(id: number): void` - Todoを削除
- `setLoading(loading: boolean): void` - ローディング状態を設定
- `clearTodos(): void` - Todoリストをクリア

#### src/stores/useAuthStore.ts
- `user: User | null` - ユーザー情報
- `token: string | null` - 認証トークン
- `isAuthenticated: boolean` - 認証状態 (computed)
- `login(user: User, token: string): void` - ログイン
- `logout(): void` - ログアウト
- `updateUser(user: User): void` - ユーザー情報更新
- `setToken(token: string): void` - トークン設定

### 2. APIクライアント

#### src/api/apiClient.ts
- axiosインスタンスの作成
- デフォルト設定 (baseURL, headers, timeout)
- リクエストインターセプター (認証ヘッダー追加)
- レスポンスインターセプター (エラーハンドリング)
- ヘルパーメソッド (setAuthToken, getAuthToken)
- リトライ機能 (axios-retryまたは手動実装)

### 3. TypeScript型定義

#### src/types/auth.ts (作成済み)
- User
- AuthState
- LoginCredentials
- LoginResponse

## TDD Red フェーズ完了

✅ テストファイルを作成しました (456行、39テスト)
✅ テストが失敗することを期待しています (実装ファイルが存在しないため)
✅ 実装コードは一切書いていません
✅ 次のGreenフェーズでテストをパスさせる実装を行います

## 次のステップ (Green フェーズ)

implementerエージェントが以下を実装:

1. Zustandストアの実装 (useTodoStore, useAuthStore)
2. APIクライアントの実装 (apiClient)
3. 既存のApp.tsxをZustandストアを使用するように更新
4. 既存のtodoApiをapiClientを使用するように更新
5. テストを実行してすべてパスすることを確認
