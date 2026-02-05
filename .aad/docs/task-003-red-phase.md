# Task-003: フロントエンドアプリケーションのセットアップ - TDD Red フェーズ

## タスク概要

React + Viteでフロントエンドを構築し、Todoアプリケーションのフル機能を実装する。

### 要件
- Todo一覧表示
- Todo追加フォーム
- Todo完了切り替え
- Todo削除ボタン
- axiosでバックエンドAPIと通信
- ポート5173で起動

## 実施内容

### 1. プロジェクトセットアップ

#### Vite + Reactプロジェクトの初期化
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

#### 依存関係のインストール
```bash
npm install -D @playwright/test
npm install axios
npx playwright install
```

### 2. Playwrightテスト環境のセットアップ

#### playwright.config.ts
- baseURL: http://localhost:5173
- testDir: ./e2e
- webServer設定でVite開発サーバーを自動起動

#### package.jsonにテストスクリプトを追加
```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed"
}
```

### 3. E2Eテストの作成

#### frontend/e2e/todo.spec.ts

合計17個のテストケースを作成:

##### Todo一覧表示機能 (3テスト)
1. 初期状態でTodoリストが表示される
2. バックエンドAPIからTodoを取得して表示する
3. 各TodoにタイトルとステータスとIDが表示される

##### Todo追加フォーム機能 (8テスト)
1. 新規Todo入力フォームが表示される
2-4. 新しいTodoを追加できる (パラメータ化テスト x3)
5. 空のTodoは追加できない
6. Todoを追加した後、バックエンドAPIにPOSTリクエストが送信される

##### Todo完了切り替え機能 (4テスト)
1. Todoの完了ボタンが表示される
2. 未完了のTodoを完了状態に切り替えられる
3. 完了状態のTodoを未完了に戻せる
4. 完了状態を切り替えた時、バックエンドAPIにPUTリクエストが送信される

##### Todo削除機能 (3テスト)
1. Todoの削除ボタンが表示される
2. Todoを削除できる
3. Todoを削除した時、バックエンドAPIにDELETEリクエストが送信される
4. 複数のTodoを個別に削除できる

## テスト実行結果

### Red フェーズ - 失敗確認

```
npm run test:e2e
```

#### 結果サマリー
- **合計**: 17テスト
- **失敗**: 16テスト ✓ (期待通り)
- **成功**: 1テスト
- **実行時間**: 約1.8分

#### 失敗理由
すべての失敗は以下の理由による:
- `data-testid`属性を持つDOM要素が見つからない
- タイムアウト (要素が存在しないため)

これは**期待通りの動作**です。実装前なので、テストが失敗するのは正しいTDD Redフェーズです。

### 失敗したテストの詳細

#### UI要素が見つからないエラー
```
Error: expect(locator).toBeVisible() failed
Locator: locator('[data-testid="todo-list"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

必要な`data-testid`属性:
- `todo-list`: Todoリストのコンテナ
- `todo-item`: 各Todoアイテム
- `todo-title`: Todoのタイトル
- `todo-status`: Todoのステータス
- `todo-id`: TodoのID
- `todo-input`: Todo入力フォーム
- `todo-submit`: Todo送信ボタン
- `todo-toggle`: Todo完了切り替えボタン
- `todo-delete`: Todo削除ボタン

## 次のステップ (Green フェーズ)

implementerエージェントが以下を実装する必要があります:

### 1. Todoコンポーネントの実装
- `src/components/TodoList.tsx`: Todo一覧表示
- `src/components/TodoItem.tsx`: 各Todoアイテム
- `src/components/TodoForm.tsx`: Todo追加フォーム

### 2. API通信の実装
- `src/api/todos.ts`: axios を使用したAPI通信
- GET /api/todos - Todo一覧取得
- POST /api/todos - Todo追加
- PUT /api/todos/:id - Todo更新
- DELETE /api/todos/:id - Todo削除

### 3. 状態管理
- Reactの`useState`または`useReducer`でTodoの状態を管理

### 4. App.tsxの更新
- Todoコンポーネントを統合

### 5. Vite設定
- ポート5173で起動 (デフォルト設定)
- プロキシ設定でバックエンドAPIにアクセス

## TDD Red フェーズ完了

✅ テストが失敗することを確認しました。
✅ 実装コードは一切書いていません。
✅ 次のGreenフェーズでテストをパスさせる実装を行います。
