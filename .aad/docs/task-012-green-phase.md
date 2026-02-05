# Task-012: フロントエンドのルーティング設定 - TDD Green フェーズ

## タスク概要

React Routerを使用してフロントエンドに複数ページのルーティング機能を追加し、ProtectedRouteコンポーネントで認証が必要なルートを保護する。

### 要件
- React Routerの設定とルート定義
- ページコンポーネントの作成（Login、TodoList、Dashboard、NotFound）
- ProtectedRouteコンポーネントの実装
- ナビゲーションリンクの実装
- 認証状態の管理（localStorage使用）
- ログイン/ログアウト機能

## 実施内容

### 1. 実装済みコンポーネントの確認

#### ページコンポーネント

すでに以下のページコンポーネントが実装されていました:

1. **LoginPage** (`frontend/src/pages/LoginPage.tsx`)
   - ログインフォーム（ユーザー名・パスワード入力）
   - ログイン処理（localStorageにトークン保存）
   - リダイレクト処理（元のURLに戻る）
   - ナビゲーションリンク
   - 全てのdata-testid属性を実装

2. **TodosPage** (`frontend/src/pages/TodosPage.tsx`)
   - 既存のTodo機能を統合
   - TodoList、TodoFormコンポーネントを使用
   - Todo CRUD操作（追加・更新・削除）
   - ログアウト機能
   - ナビゲーションリンク
   - 全てのdata-testid属性を実装

3. **DashboardPage** (`frontend/src/pages/DashboardPage.tsx`)
   - Dashboardタイトル
   - ログアウトボタン
   - ナビゲーションリンク
   - 全てのdata-testid属性を実装

4. **NotFoundPage** (`frontend/src/pages/NotFoundPage.tsx`)
   - 404エラー表示
   - ナビゲーションリンク
   - data-testid属性を実装

#### ProtectedRouteコンポーネント

`frontend/src/components/ProtectedRoute.tsx`が実装済み:
- localStorageの`authToken`で認証状態を判定
- 未認証時は`/`（ログインページ）にリダイレクト
- リダイレクト元のURLをsessionStorageに保存

#### React Router設定

`frontend/src/App.tsx`が実装済み:
- BrowserRouterの設定
- ルート定義:
  - `/` - LoginPage（公開）
  - `/todos` - TodosPage（保護）
  - `/dashboard` - DashboardPage（保護）
  - `*` - NotFoundPage（公開）

### 2. 実装されている機能

#### 認証フロー
- localStorageの`authToken`キーで認証状態を判定
- ログイン時にトークンを保存
- 未認証時はログインページにリダイレクト
- ログイン後は元のURLにリダイレクト（sessionStorageを使用）
- ログアウト時はトークンを削除してログインページにリダイレクト

#### ナビゲーション
- 全てのページにナビゲーションリンクを配置
- Home、Todos、Dashboardへのリンク
- 認証が必要なページにはログアウトボタンを配置

#### データ永続化
- 認証トークンはlocalStorageに保存
- リダイレクトURLはsessionStorageに保存
- Todo機能は既存のAPIクライアント（todoApi）を使用

## テスト実行結果

### Green フェーズ - 成功確認

```bash
cd frontend
npm run test:e2e -- routing.spec.ts
```

#### 結果サマリー
- **合計**: 13テスト
- **成功**: 13テスト ✓
- **失敗**: 0テスト
- **実行時間**: 約4.4秒

#### 成功したテストの詳細

##### 基本ルーティング機能 (4テスト)
1. ✅ ログインページ(/)にアクセスできる
2. ✅ Todoリストページ(/todos)にアクセスできる
3. ✅ Dashboardページ(/dashboard)にアクセスできる
4. ✅ 存在しないルート(/invalid)は404ページを表示する

##### ナビゲーションリンク機能 (1テスト)
1. ✅ ナビゲーションリンクが正しく動作する
   - Todosリンクをクリックして/todosに遷移
   - Dashboardリンクをクリックして/dashboardに遷移
   - Homeリンクをクリックして/に遷移

##### ProtectedRoute: 認証保護機能 (5テスト)
1. ✅ 未認証時はProtectedRouteにアクセスできず、ログインページにリダイレクトされる
2. ✅ 認証済みユーザーはProtectedRouteにアクセスできる
3. ✅ Todosページも認証が必要で、未認証時はリダイレクトされる
4. ✅ ログイン後、元のURLにリダイレクトされる
5. ✅ ログアウトボタンをクリックすると、認証が解除されログインページにリダイレクトされる

##### ページコンポーネントの基本構造 (3テスト)
1. ✅ ログインページに必要な要素が存在する
   - login-page, login-form, login-username, login-password, login-submit
2. ✅ Dashboardページに必要な要素が存在する
   - dashboard-page, dashboard-title, logout-button
3. ✅ Todosページに既存のTodo機能が統合されている
   - todos-page, todo-list, todo-input

## 実装の詳細

### LoginPage.tsx
```typescript
- useState for username and password
- useNavigate for redirect
- handleSubmit: localStorageにトークン保存、リダイレクト処理
- sessionStorageからリダイレクト先URL取得
- data-testid属性: login-page, login-form, login-username, login-password, login-submit, nav-link-*
```

### ProtectedRoute.tsx
```typescript
- localStorageからauthToken取得
- 未認証時: sessionStorageにリダイレクト先を保存して/にNavigate
- 認証済み: childrenをレンダリング
```

### TodosPage.tsx
```typescript
- 既存のTodo機能を統合（TodoList, TodoForm, todoApi）
- useState for todos
- useEffect for loadTodos
- CRUD操作: handleAddTodo, handleToggleTodo, handleDeleteTodo
- handleLogout: localStorageクリア、/にリダイレクト
- data-testid属性: todos-page, todo-list, todo-input, nav-link-*
```

### DashboardPage.tsx
```typescript
- handleLogout: localStorageクリア、/にリダイレクト
- data-testid属性: dashboard-page, dashboard-title, logout-button, nav-link-*
```

### NotFoundPage.tsx
```typescript
- 404エラーメッセージ
- ナビゲーションリンク
- data-testid属性: not-found-page, nav-link-*
```

### App.tsx
```typescript
- BrowserRouter設定
- Routes定義:
  - / → LoginPage
  - /todos → ProtectedRoute(TodosPage)
  - /dashboard → ProtectedRoute(DashboardPage)
  - * → NotFoundPage
```

## TDD Green フェーズ完了

✅ 全てのテストがパスしました。
✅ テストをパスするための最小限の実装が完了しています。
✅ 過度な最適化やリファクタリングは行っていません。
✅ 次のRefactorフェーズで必要に応じてコードの改善を行います。

## 次のステップ (Refactor フェーズ)

必要に応じて以下のリファクタリングを検討:
1. ナビゲーションコンポーネントの共通化（現在は各ページに重複）
2. 認証ロジックのカスタムフック化（useAuth）
3. スタイリングの改善（CSSモジュールまたはCSS-in-JS）
4. エラーハンドリングの改善
5. ログイン時のバリデーション追加

ただし、現時点では全ての要件を満たしており、テストもパスしているため、Refactorフェーズは必須ではありません。
