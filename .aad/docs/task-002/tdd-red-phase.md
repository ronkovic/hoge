# TDD Red フェーズ - task-002

## タスク情報
- **Task ID**: task-002
- **タイトル**: 共通型定義の実装
- **説明**: shared/types/配下にバックエンドとフロントエンドで共通利用する型定義を実装。User.ts, Post.ts, Comment.ts, ApiResponse.ts を作成。

## 実行日時
2026-02-05

## テスト戦略
TypeScript + Playwrightを使用した型定義のテスト:
- **テストフレームワーク**: Playwright (E2E)
- **テストパターン**: テーブル駆動テスト風のアプローチ（各型定義に対して複数のテストケースを配列で定義）
- **検証方法**: 動的インポートとランタイム型チェック

## 作成したテストケース

### 1. User型のテスト（4テストケース）

| テスト名 | 説明 | 期待結果 |
|---------|------|---------|
| User型をインポートできること | shared/types/User.tsからUser型をインポート | 成功 |
| 有効なUserオブジェクト（全フィールド） | id, username, email, createdAt, updatedAt | 検証OK |
| 有効なUserオブジェクト（必須フィールドのみ） | id, username, email | 検証OK |
| 無効なUserオブジェクト（id欠如） | usernameとemailのみ | 検証NG |

### 2. Post型のテスト（4テストケース）

| テスト名 | 説明 | 期待結果 |
|---------|------|---------|
| Post型をインポートできること | shared/types/Post.tsからPost型をインポート | 成功 |
| 有効なPostオブジェクト（全フィールド） | id, userId, title, content, createdAt, updatedAt | 検証OK |
| 有効なPostオブジェクト（必須フィールドのみ） | id, userId, title, content | 検証OK |
| 無効なPostオブジェクト（userId欠如） | id, title, contentのみ | 検証NG |

### 3. Comment型のテスト（4テストケース）

| テスト名 | 説明 | 期待結果 |
|---------|------|---------|
| Comment型をインポートできること | shared/types/Comment.tsからComment型をインポート | 成功 |
| 有効なCommentオブジェクト（全フィールド） | id, postId, userId, content, createdAt, updatedAt | 検証OK |
| 有効なCommentオブジェクト（必須フィールドのみ） | id, postId, userId, content | 検証OK |
| 無効なCommentオブジェクト（postId欠如） | id, userId, contentのみ | 検証NG |

### 4. ApiResponse型のテスト（5テストケース）

| テスト名 | 説明 | 期待結果 |
|---------|------|---------|
| ApiResponse型をインポートできること | shared/types/ApiResponse.tsからApiResponse型をインポート | 成功 |
| 成功レスポンス（data有り） | success: true, data: {...} | 検証OK |
| 成功レスポンス（data無し） | success: true | 検証OK |
| エラーレスポンス | success: false, error: "..." | 検証OK |
| 無効なApiResponse（success欠如） | data: {...}のみ | 検証NG |

### 5. 型の相互運用性テスト（3テストケース）

| テスト名 | 説明 |
|---------|------|
| UserとPostの関連性を確認 | Post.userIdがUser.idと対応することを確認 |
| PostとCommentの関連性を確認 | Comment.postIdがPost.idと対応することを確認 |
| ApiResponseでUser型を使用 | ApiResponse<User>の形で型を組み合わせて使用 |

## テスト実行結果（Red フェーズ）

```
Running 20 tests using 4 workers

  20 failed
```

### 失敗したテスト（期待通り）

すべてのテストが期待通りに失敗しました。失敗理由は以下のとおり:

#### User型関連（4失敗）
1. ✗ User型をインポートできること
   - エラー: `Cannot find module '/Users/kazuki/workspace/sandbox/worktrees/_20260205_153345-wt-task-002/frontend/shared/types/User'`

2. ✗ 有効なUserオブジェクト（全フィールド）
   - エラー: モジュールが見つからない

3. ✗ 有効なUserオブジェクト（必須フィールドのみ）
   - エラー: モジュールが見つからない

4. ✗ 無効なUserオブジェクト（id欠如）
   - エラー: モジュールが見つからない

#### Post型関連（4失敗）
5. ✗ Post型をインポートできること
   - エラー: `Cannot find module '/Users/kazuki/workspace/sandbox/worktrees/_20260205_153345-wt-task-002/frontend/shared/types/Post'`

6. ✗ 有効なPostオブジェクト（全フィールド）
   - エラー: モジュールが見つからない

7. ✗ 有効なPostオブジェクト（必須フィールドのみ）
   - エラー: モジュールが見つからない

8. ✗ 無効なPostオブジェクト（userId欠如）
   - エラー: モジュールが見つからない

#### Comment型関連（4失敗）
9. ✗ Comment型をインポートできること
   - エラー: `Cannot find module '/Users/kazuki/workspace/sandbox/worktrees/_20260205_153345-wt-task-002/frontend/shared/types/Comment'`

10. ✗ 有効なCommentオブジェクト（全フィールド）
    - エラー: モジュールが見つからない

11. ✗ 有効なCommentオブジェクト（必須フィールドのみ）
    - エラー: モジュールが見つからない

12. ✗ 無効なCommentオブジェクト（postId欠如）
    - エラー: モジュールが見つからない

#### ApiResponse型関連（5失敗）
13. ✗ ApiResponse型をインポートできること
    - エラー: `Cannot find module '/Users/kazuki/workspace/sandbox/worktrees/_20260205_153345-wt-task-002/frontend/shared/types/ApiResponse'`

14. ✗ 成功レスポンス（data有り）
    - エラー: モジュールが見つからない

15. ✗ 成功レスポンス（data無し）
    - エラー: モジュールが見つからない

16. ✗ エラーレスポンス
    - エラー: モジュールが見つからない

17. ✗ 無効なApiResponse（success欠如）
    - エラー: モジュールが見つからない

#### 型の相互運用性テスト（3失敗）
18. ✗ UserとPostの関連性を確認
    - エラー: モジュールが見つからない

19. ✗ PostとCommentの関連性を確認
    - エラー: モジュールが見つからない

20. ✗ ApiResponseでUser型を使用
    - エラー: モジュールが見つからない

## 作成したファイル

### テストファイル
1. `frontend/e2e/types.spec.ts` - 共通型定義のテストスイート (20テストケース)

### ディレクトリ構造
```
shared/
└── types/           # 型定義ファイル用ディレクトリ（空）
```

## 次のステップ（Green フェーズ）

以下の型定義ファイルを実装する必要があります:

### 1. shared/types/User.ts
必須フィールド:
- `id: number`
- `username: string`
- `email: string`

オプションフィールド:
- `createdAt?: string`
- `updatedAt?: string`

### 2. shared/types/Post.ts
必須フィールド:
- `id: number`
- `userId: number`
- `title: string`
- `content: string`

オプションフィールド:
- `createdAt?: string`
- `updatedAt?: string`

### 3. shared/types/Comment.ts
必須フィールド:
- `id: number`
- `postId: number`
- `userId: number`
- `content: string`

オプションフィールド:
- `createdAt?: string`
- `updatedAt?: string`

### 4. shared/types/ApiResponse.ts
成功レスポンス:
- `success: true`
- `data?: T` (ジェネリック型)

エラーレスポンス:
- `success: false`
- `error: string`

## 結論

✅ **TDD Redフェーズは成功**

すべてのテスト（20件）が期待通りに失敗しました。これは、型定義ファイル（User.ts, Post.ts, Comment.ts, ApiResponse.ts）がまだ存在しないためです。

次のフェーズ（Green）で、これらのテストをパスさせる最小限の型定義を実装します。
