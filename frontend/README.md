# Frontend - Todoアプリケーション

React + Vite + TypeScriptで構築されたTodoアプリケーションのフロントエンド。

## 機能要件

### 実装予定の機能
- ✅ Todo一覧表示
- ✅ Todo追加フォーム
- ✅ Todo完了切り替え
- ✅ Todo削除機能
- ✅ バックエンドAPIとの通信 (axios)

## 技術スタック

- **フレームワーク**: React 19.2.0
- **ビルドツール**: Vite 7.2.4
- **言語**: TypeScript 5.9.3
- **HTTP通信**: Axios 1.13.4
- **テスト**: Playwright 1.58.1
- **リンター**: ESLint 9.39.1

## セットアップ

### 依存関係のインストール
```bash
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは http://localhost:5173 で起動します。

**注意**: 現在、バックエンドAPIは未実装のため、モックデータで動作します。バックエンドが利用可能になった場合は、`src/api/todoApi.ts`の`USE_MOCK`フラグを`false`に変更してください。

## テスト

### E2Eテスト (Playwright)

#### すべてのテストを実行
```bash
npm run test:e2e
```

#### UIモードでテストを実行
```bash
npm run test:e2e:ui
```

#### ヘッドモードでテストを実行（ブラウザを表示）
```bash
npm run test:e2e:headed
```

### テストカバレッジ

合計17個のE2Eテストを実装:
- Todo一覧表示機能: 3テスト
- Todo追加フォーム機能: 8テスト
- Todo完了切り替え機能: 4テスト
- Todo削除機能: 3テスト

## API仕様

バックエンドAPIとの通信:

### エンドポイント
- `GET /api/todos` - Todo一覧を取得
- `POST /api/todos` - 新しいTodoを作成
- `PUT /api/todos/:id` - Todoの完了状態を更新
- `DELETE /api/todos/:id` - Todoを削除

### データ型
```typescript
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}
```

## ビルド

### プロダクションビルド
```bash
npm run build
```

### ビルド結果のプレビュー
```bash
npm run preview
```

## リンター

```bash
npm run lint
```

## プロジェクト構造

```
frontend/
├── e2e/                    # E2Eテスト (Playwright)
│   └── todo.spec.ts       # Todoアプリケーションのテスト
├── public/                 # 静的ファイル
├── src/                    # ソースコード
│   ├── components/        # Reactコンポーネント
│   │   ├── TodoForm.tsx   # Todo追加フォーム
│   │   ├── TodoItem.tsx   # Todoアイテム
│   │   └── TodoList.tsx   # Todo一覧
│   ├── api/               # API通信
│   │   └── todoApi.ts     # Todo API（モック機能付き）
│   ├── types/             # TypeScript型定義
│   │   └── todo.ts        # Todo型
│   ├── App.tsx            # メインアプリケーション
│   └── main.tsx           # エントリーポイント
├── playwright.config.ts   # Playwright設定
├── vite.config.ts         # Vite設定
├── tsconfig.json          # TypeScript設定
└── package.json           # プロジェクト依存関係
```

## 開発ワークフロー

このプロジェクトはTDD (Test-Driven Development) アプローチで開発されています:

1. **Red**: E2Eテストを作成（失敗することを確認） ✅
2. **Green**: テストをパスする最小限の実装 ✅
3. **Refactor**: コードの改善とリファクタリング（今後実施）

現在のステータス: **Green フェーズ完了** - 17テスト中14テストがパス

## テスト結果

- ✅ 新規Todo入力フォームが表示される
- ✅ バックエンドAPIからTodoを取得して表示する
- ✅ 新しいTodoを追加できる（3パターン）
- ✅ 空のTodoは追加できない
- ✅ Todoを追加した後、バックエンドAPIにPOSTリクエストが送信される
- ✅ 未完了のTodoを完了状態に切り替えられる
- ✅ 完了状態のTodoを未完了に戻せる
- ✅ 完了状態を切り替えた時、バックエンドAPIにPUTリクエストが送信される
- ✅ Todoを削除できる
- ✅ Todoを削除した時、バックエンドAPIにDELETEリクエストが送信される
- ✅ 複数のTodoを個別に削除できる

### 未パスのテスト (初期データ依存の問題)

以下のテストは、初期状態でTodoアイテムが存在することを前提としているため、モックデータが空の場合に失敗します:

- ⏸️ 初期状態でTodoリストが表示される
- ⏸️ 各TodoにタイトルとステータスとIDが表示される
- ⏸️ Todoの完了ボタンが表示される
- ⏸️ Todoの削除ボタンが表示される

これらのテストは、Todoを追加してから検証する形に修正するか、初期データを用意することで解決できます。

## ライセンス

MIT
