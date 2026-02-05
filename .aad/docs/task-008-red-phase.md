# Task-008: 記事APIエンドポイントの実装 - Red Phase

## 実行日時
2026-02-05

## タスク概要
記事関連のエンドポイント(一覧、詳細、作成、更新、削除、ユーザー別一覧)を実装する。
コントローラー、ルート、サービス層を含む。

## 実装仕様

### 必要なエンドポイント
1. `GET /api/articles` - 記事一覧取得
2. `GET /api/articles/:id` - 記事詳細取得
3. `POST /api/articles` - 記事作成
4. `PUT /api/articles/:id` - 記事更新
5. `DELETE /api/articles/:id` - 記事削除
6. `GET /api/articles/user/:userId` - ユーザー別記事一覧

### データモデル
```
articles テーブル(想定):
- id (serial primary key)
- user_id (integer, foreign key to users)
- title (varchar(200) not null)
- content (text not null)
- published (boolean default false)
- created_at (timestamp default now())
- updated_at (timestamp default now())
```

## Red Phase の実行内容

### 1. テストファイルの作成
**ファイル**: `backend/__tests__/articles.test.js`

既存のTodo APIテストのパターンを参考に、テーブル駆動テスト(`test.each()`)を使用して記事APIのテストを作成しました。

### 2. テストケースの網羅

#### 2.1 基本的なCRUD操作(5件)
- GET /api/articles - すべての記事を取得
- GET /api/articles/:id - 特定の記事を取得
- POST /api/articles - 新しい記事を作成
- PUT /api/articles/:id - 記事を更新
- DELETE /api/articles/:id - 記事を削除

#### 2.2 ユーザー別記事一覧(2件)
- GET /api/articles/user/:userId (ユーザーID 1)
- GET /api/articles/user/:userId (ユーザーID 2)

#### 2.3 エラーハンドリング(6件)
- 存在しない記事を取得 → 404
- 存在しない記事を更新 → 404
- 存在しない記事を削除 → 404
- タイトルなしで作成 → 400
- 本文なしで作成 → 400
- user_idなしで作成 → 400

#### 2.4 バリデーション(3件)
- タイトルが200文字を超える → 400
- 本文が空文字 → 400
- publishedがboolean以外 → 400

#### 2.5 データ整合性(2件)
- 作成時にcreated_atとupdated_atが設定される
- 更新時にupdated_atが更新される

**合計**: 18件のテストケース

### 3. テスト実行結果

```bash
npm test -- articles.test.js
```

**結果**:
```
Test Suites: 1 failed, 1 total
Tests:       18 failed, 18 total
Time:        0.448 s
```

### 4. 失敗の詳細

すべてのテストが期待通り失敗しました。主な失敗理由:

1. **404エラー** (大部分のテスト)
   - `/api/articles` エンドポイントが存在しない
   - すべてのHTTPメソッド(GET, POST, PUT, DELETE)で404を返す

2. **期待されるレスポンス構造の欠如**
   - `message` プロパティが存在しない
   - 記事データのキー(id, user_id, title, content, etc.)が存在しない

### 5. 実装が必要な項目

次のGreen Phaseでは、以下を実装する必要があります:

#### 5.1 データベース関連
- `articles` テーブルのスキーマ定義(database/schema.sql)
- 必要に応じて `users` テーブルのスキーマ定義

#### 5.2 バックエンド実装
- 記事エンドポイントの実装(server.js または別ファイル)
- バリデーションロジック
  - 必須フィールドのチェック(title, content, user_id)
  - タイトルの最大長チェック(200文字)
  - publishedフィールドの型チェック
- エラーハンドリング
  - 404エラー(存在しない記事)
  - 400エラー(不正なリクエスト)
- タイムスタンプ管理
  - created_atの設定
  - updated_atの更新

#### 5.3 実装パターン
既存のTodo APIと同様のパターンを使用:
- In-memoryストレージまたはデータベース接続
- Express.jsのルーティング
- JSONレスポンス

## 次のステップ

Red Phaseが正常に完了しました。すべてのテストが期待通り失敗しています。

次のGreen Phaseでは:
1. テストをパスさせるための最小限の実装を行う
2. すべてのテストが成功することを確認する
3. 必要に応じてリファクタリングを行う

## テストファイルの場所
- `backend/__tests__/articles.test.js`: 記事APIのテストスイート(18テストケース)

## 注意事項
- 実装コードは一切作成していません(Red Phaseの原則に従う)
- テストのみを作成し、すべて失敗することを確認しました
- テーブル駆動テスト(`test.each()`)を使用して、テストの重複を最小化しました
