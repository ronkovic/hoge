# Task 009: コメントAPIエンドポイントの実装 - TDD Red Phase

## タスク概要

- **Task ID**: task-009
- **Task Title**: コメントAPIエンドポイントの実装
- **Task Description**: コメント関連のエンドポイント（一覧、投稿、削除）を実装。コントローラー、ルート、サービス層を含む。
- **Phase**: Red (テスト作成・失敗確認)
- **Date**: 2026-02-05

## テストファイル

- **Location**: `backend/__tests__/comments.test.js`
- **Test Framework**: Jest + Supertest
- **Test Pattern**: テーブル駆動テスト (test.each)

## テスト項目

### 1. Comments API Endpoints (基本機能)

| メソッド | エンドポイント | 説明 | 期待ステータス |
|---------|--------------|------|--------------|
| GET | /comments | すべてのコメントを取得 | 200 |
| GET | /comments/1 | 特定のコメントを取得 | 200 |
| POST | /comments | 新しいコメントを作成 | 201 |
| DELETE | /comments/1 | コメントを削除 | 200 |

### 2. Comments API - バリデーション

| テスト内容 | 期待ステータス | 期待エラーメッセージ |
|----------|--------------|-------------------|
| contentが空の場合 | 400 | Content is required |
| authorが空の場合 | 400 | Author is required |
| contentが500文字を超える場合 | 400 | Content must be less than 500 characters |

### 3. Comments API - エラーハンドリング

| テスト内容 | 期待ステータス | 期待エラーメッセージ |
|----------|--------------|-------------------|
| 存在しないコメントを取得 | 404 | Comment not found |
| 存在しないコメントを削除 | 404 | Comment not found |
| 無効なIDでコメントを取得 | 400 | Invalid comment ID |
| 無効なIDでコメントを削除 | 400 | Invalid comment ID |

### 4. Comments API - データ整合性

- 作成されたコメントが`createdAt`タイムスタンプを持つこと
- コメント一覧が作成日時の降順でソートされていること
- 削除されたコメントは一覧に表示されないこと

## テスト実行結果

```
Test Suites: 1 failed, 1 total
Tests:       14 failed, 14 total
Time:        0.312 s
```

### 失敗したテスト (全14件)

1. ✕ GET /comments - すべてのコメントを取得できること (Expected: 200, Received: 404)
2. ✕ GET /comments/1 - 特定のコメントを取得できること (Expected: 200, Received: 404)
3. ✕ POST /comments - 新しいコメントを作成できること (Expected: 201, Received: 404)
4. ✕ DELETE /comments/1 - コメントを削除できること (Expected: 200, Received: 404)
5. ✕ POST /comments - contentが空の場合、400を返すこと (Expected: 400, Received: 404)
6. ✕ POST /comments - authorが空の場合、400を返すこと (Expected: 400, Received: 404)
7. ✕ POST /comments - contentが500文字を超える場合、400を返すこと (Expected: 400, Received: 404)
8. ✕ GET /comments/999 - 存在しないコメントを取得しようとした場合、404を返すこと
9. ✕ DELETE /comments/999 - 存在しないコメントを削除しようとした場合、404を返すこと
10. ✕ GET /comments/invalid - 無効なIDでコメントを取得しようとした場合、400を返すこと (Expected: 400, Received: 404)
11. ✕ DELETE /comments/invalid - 無効なIDでコメントを削除しようとした場合、400を返すこと (Expected: 400, Received: 404)
12. ✕ 作成されたコメントがcreatedAtタイムスタンプを持つこと (Expected: 201, Received: 404)
13. ✕ コメント一覧が作成日時の降順でソートされていること (Expected: 200, Received: 404)
14. ✕ 削除されたコメントは一覧に表示されないこと

## 失敗理由

全てのテストで404エラーが返される理由:

- `/comments` エンドポイントが未実装
- コメント関連のルート定義が存在しない
- コメント用のコントローラーが存在しない
- コメント用のサービス層が存在しない

## 次のステップ (Green Phase)

1. コメント用のルート定義を`server.js`に追加
2. コメント用のin-memoryストレージを実装
3. 各エンドポイントの実装:
   - `GET /comments` - 一覧取得
   - `GET /comments/:id` - 個別取得
   - `POST /comments` - 新規作成
   - `DELETE /comments/:id` - 削除
4. バリデーション実装:
   - content必須チェック
   - author必須チェック
   - content文字数制限 (500文字)
   - ID形式チェック
5. エラーハンドリング実装
6. テストを再実行して全てパスすることを確認

## TDD Red Phase 完了

- ✅ 失敗するテストを作成完了
- ✅ テスト実行で全14件が失敗することを確認
- ✅ 実装コードは未作成（Redフェーズの要件を満たす）

次のフェーズ: **Green Phase** (実装フェーズ) - Implementerエージェントに引き継ぎ
