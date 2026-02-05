# Task-012: フロントエンドのルーティング設定 - TDD Red フェーズ

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

### 1. 依存関係のインストール

#### React Routerのインストール
```bash
cd frontend
npm install react-router-dom
```

インストール結果:
- react-router-dom: 追加済み
- 合計256パッケージを追加

### 2. E2Eテストの作成

#### frontend/e2e/routing.spec.ts

合計13個のテストケースを作成:

##### 基本ルーティング機能 (4テスト)
1. ログインページ(/)にアクセスできる
2. Todoリストページ(/todos)にアクセスできる
3. Dashboardページ(/dashboard)にアクセスできる
4. 存在しないルート(/invalid)は404ページを表示する

##### ナビゲーションリンク機能 (1テスト)
1. ナビゲーションリンクが正しく動作する
   - Todosリンクをクリックして/todosに遷移
   - Dashboardリンクをクリックして/dashboardに遷移
   - Homeリンクをクリックして/に遷移

##### ProtectedRoute: 認証保護機能 (5テスト)
1. 未認証時はProtectedRouteにアクセスできず、ログインページにリダイレクトされる
2. 認証済みユーザーはProtectedRouteにアクセスできる
3. Todosページも認証が必要で、未認証時はリダイレクトされる
4. ログイン後、元のURLにリダイレクトされる
5. ログアウトボタンをクリックすると、認証が解除されログインページにリダイレクトされる

##### ページコンポーネントの基本構造 (3テスト)
1. ログインページに必要な要素が存在する
   - login-page, login-form, login-username, login-password, login-submit
2. Dashboardページに必要な要素が存在する
   - dashboard-page, dashboard-title, logout-button
3. Todosページに既存のTodo機能が統合されている
   - todos-page, todo-list, todo-input

## テスト実行結果

### Red フェーズ - 失敗確認

```bash
npm run test:e2e -- routing.spec.ts
```

#### 結果サマリー
- **合計**: 13テスト
- **失敗**: 13テスト ✓ (期待通り)
- **成功**: 0テスト
- **実行時間**: 約62秒

#### 失敗理由
すべての失敗は以下の理由による:
- `data-testid`属性を持つDOM要素が見つからない
- タイムアウト (要素が存在しないため)

これは**期待通りの動作**です。実装前なので、テストが失敗するのは正しいTDD Redフェーズです。

### 失敗したテストの詳細

#### UI要素が見つからないエラー（例）
```
Error: expect(locator).toBeVisible() failed
Locator: locator('[data-testid="login-page"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

#### 必要な`data-testid`属性

**ページレベル:**
- `login-page`: ログインページのコンテナ
- `todos-page`: Todosページのコンテナ
- `dashboard-page`: Dashboardページのコンテナ
- `not-found-page`: 404ページのコンテナ

**ナビゲーション:**
- `nav-link-home`: Homeへのリンク
- `nav-link-todos`: Todosへのリンク
- `nav-link-dashboard`: Dashboardへのリンク

**ログインフォーム:**
- `login-form`: ログインフォーム
- `login-username`: ユーザー名入力フィールド
- `login-password`: パスワード入力フィールド
- `login-submit`: ログインボタン

**Dashboard:**
- `dashboard-title`: Dashboardのタイトル
- `logout-button`: ログアウトボタン

**既存Todo要素（統合が必要）:**
- `todo-list`: Todoリストのコンテナ
- `todo-input`: Todo入力フォーム

## 次のステップ (Green フェーズ)

implementerエージェントが以下を実装する必要があります:

### 1. ページコンポーネントの作成
- `src/pages/LoginPage.tsx`: ログインページ
- `src/pages/TodosPage.tsx`: Todoリストページ（既存App.tsxの内容を移行）
- `src/pages/DashboardPage.tsx`: Dashboardページ
- `src/pages/NotFoundPage.tsx`: 404ページ

### 2. ProtectedRouteコンポーネントの実装
- `src/components/ProtectedRoute.tsx`: 認証チェックとリダイレクト

### 3. React Routerの設定
- `src/App.tsx`: React Routerの設定とルート定義
  - `/` - ログインページ（公開）
  - `/todos` - Todosページ（保護）
  - `/dashboard` - Dashboardページ（保護）
  - `*` - 404ページ

### 4. ナビゲーションコンポーネント
- `src/components/Navigation.tsx` または既存ページにナビゲーションリンクを追加

### 5. 認証状態管理
- localStorageを使用した認証トークンの管理
- ログイン機能の実装
- ログアウト機能の実装

### 6. 既存機能の統合
- 既存のTodoコンポーネントをTodosページに統合
- 既存のAPIクライアント（todoApi）をそのまま使用

## TDD Red フェーズ完了

✅ テストが失敗することを確認しました。
✅ 実装コードは一切書いていません。
✅ 次のGreenフェーズでテストをパスさせる実装を行います。

## テスト設計の考慮事項

### 認証フロー
- localStorageの`authToken`キーで認証状態を判定
- 未認証時は`/`（ログインページ）にリダイレクト
- ログイン後は元のURLにリダイレクト

### ルーティング構造
- ルートパス `/` はログインページ（公開）
- `/todos` と `/dashboard` は保護されたルート
- 存在しないルートは404ページを表示

### データの永続化
- 認証トークンはlocalStorageに保存
- ログアウト時はlocalStorageをクリア
