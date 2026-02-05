# Task-008: 記事APIエンドポイントの実装 - RED Phase 検証結果

## 実行日時
2026-02-05 17:00

## タスク概要
記事関連のエンドポイント(一覧、詳細、作成、更新、削除、ユーザー別一覧)のTDD Red Phaseを実行する。

## 検証結果

### ❌ RED Phase の原則違反を検出

TDD Red Phaseでは以下の条件を満たす必要があります:
1. ✅ テストコードが存在する
2. ❌ **実装コードが存在してはいけない**
3. ❌ **全てのテストが失敗しなければならない**

### 現在の状況

#### テストファイル
- **場所**: `backend/__tests__/articles.test.js`
- **テストケース数**: 18件
- **状態**: ✅ 存在する

#### 実装コード
- **場所**: `backend/server.js` (line 187-284)
- **状態**: ❌ **既に完全に実装されている**

以下のエンドポイントが実装済み:
- ✅ GET /api/articles (line 188-190)
- ✅ GET /api/articles/:id (line 193-202)
- ✅ POST /api/articles (line 205-242)
- ✅ PUT /api/articles/:id (line 245-264)
- ✅ DELETE /api/articles/:id (line 267-277)
- ✅ GET /api/articles/user/:userId (line 280-284)

#### テスト実行結果

```bash
npm test -- articles.test.js
```

**結果**:
```
Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        0.423 s
```

### テストケースの詳細

#### ✅ 基本的なCRUD操作 (5件)
- ✓ GET /api/articles - すべての記事を取得できること
- ✓ GET /api/articles/1 - 特定の記事を取得できること
- ✓ POST /api/articles - 新しい記事を作成できること
- ✓ PUT /api/articles/1 - 記事を更新できること
- ✓ DELETE /api/articles/1 - 記事を削除できること

#### ✅ ユーザー別記事一覧 (2件)
- ✓ GET /api/articles/user/:userId - ユーザーID 1 の記事一覧を取得できること
- ✓ GET /api/articles/user/:userId - ユーザーID 2 の記事一覧を取得できること

#### ✅ エラーハンドリング (6件)
- ✓ GET /api/articles/999 - 存在しない記事を取得しようとした場合、404を返すこと
- ✓ PUT /api/articles/999 - 存在しない記事を更新しようとした場合、404を返すこと
- ✓ DELETE /api/articles/999 - 存在しない記事を削除しようとした場合、404を返すこと
- ✓ POST /api/articles - タイトルなしで作成しようとした場合、400を返すこと
- ✓ POST /api/articles - 本文なしで作成しようとした場合、400を返すこと
- ✓ POST /api/articles - user_idなしで作成しようとした場合、400を返すこと

#### ✅ バリデーション (3件)
- ✓ POST /api/articles - タイトルが200文字を超える場合、400を返すこと
- ✓ POST /api/articles - 本文が空文字の場合、400を返すこと
- ✓ POST /api/articles - publishedがboolean以外の場合、適切に処理されること

#### ✅ データ整合性 (2件)
- ✓ 作成された記事のcreated_atとupdated_atが設定されていること
- ✓ 記事を更新した際にupdated_atが更新されること

## 結論

### ❌ RED Phase は既に完了していない

このタスクは既に**GREEN Phase (実装フェーズ)まで完了している**状態です。

#### 理由:
1. **実装コードが存在する**: `server.js`に全てのエンドポイントが実装されている
2. **全てのテストがパスする**: 18/18テストが成功している
3. **TDD Red Phaseの定義に反する**: Red Phaseでは実装コードは存在せず、全てのテストが失敗する必要がある

## 推奨アクション

### オプション1: タスクを完了とマークする
現在の状態は、実際にはGreen Phaseまで完了している状態です。記事APIは正しく動作しており、全てのテストがパスしています。

### オプション2: Red Phaseを再実行する
TDDの原則に厳密に従う場合:
1. `server.js`から記事API実装を削除する
2. テストを実行して全て失敗することを確認する (Red Phase)
3. 実装を追加してテストをパスさせる (Green Phase)
4. 必要に応じてリファクタリングする (Refactor Phase)

## ファイル構成

```
backend/
├── __tests__/
│   └── articles.test.js       # ✅ テストファイル (18テストケース)
├── server.js                   # ❌ 実装済み (line 187-284)
└── package.json
```

## 注意事項

- このドキュメントは、Task-008のRed Phase検証結果を記録したものです
- 既存の`task-008-red-phase.md`には「テストが失敗した」と記録されていますが、現在の実装では全てのテストがパスしています
- この矛盾は、Red Phase後にGreen Phase (実装)が既に完了していることを示しています

## 技術的詳細

### データモデル
記事APIは以下のデータ構造を使用しています:

```javascript
{
  id: number,              // 記事ID
  user_id: number,         // ユーザーID
  title: string,           // タイトル (最大200文字)
  content: string,         // 本文 (必須)
  published: boolean,      // 公開フラグ (デフォルト: false)
  created_at: string,      // 作成日時 (ISO 8601形式)
  updated_at: string       // 更新日時 (ISO 8601形式)
}
```

### バリデーションルール
- `user_id`: 必須
- `title`: 必須、最大200文字
- `content`: 必須、空文字不可
- `published`: オプション、boolean型

### エラーハンドリング
- 400: バリデーションエラー
- 404: リソースが見つからない
- 200/201: 成功
