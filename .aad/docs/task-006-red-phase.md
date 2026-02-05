# Task-006: TDD Red Phase - バックエンドユーティリティとミドルウェア

## 実行日時
2026-02-05

## タスク概要
JWT認証ミドルウェア、エラーハンドリングミドルウェア、バリデーションヘルパー、パスワードハッシュ化ユーティリティの実装に向けたテスト作成（TDD Red Phase）

## プロジェクト情報
- **言語**: JavaScript (Node.js)
- **テストフレームワーク**: Jest + Supertest
- **パターン**: テーブル駆動テスト (`test.each`)

## 作成したテストファイル

### 1. JWT認証ミドルウェア
**ファイル**: `backend/__tests__/middleware/auth.test.js`

**テスト内容**:
- ✅ 有効なトークンで認証が成功すること
- ✅ トークンが無い場合、401エラーを返すこと
- ✅ 無効なトークン形式の場合、401エラーを返すこと
- ✅ 期限切れのトークンの場合、401エラーを返すこと
- ✅ Bearer形式のトークンをパースできること
- ✅ ユーザーIDからトークンを生成できること
- ✅ カスタム有効期限でトークンを生成できること
- ✅ リフレッシュトークンから新しいアクセストークンを生成できること

**期待される実装モジュール**:
- `middleware/auth.js`
  - `verifyToken(req, res, next)` - トークン検証ミドルウェア
  - `generateToken(userId, expiresIn)` - トークン生成関数
  - `refreshToken(oldToken)` - トークンリフレッシュ関数

### 2. エラーハンドリングミドルウェア
**ファイル**: `backend/__tests__/middleware/errorHandler.test.js`

**テスト内容**:
- ✅ 一般的なエラーを500でハンドリングすること
- ✅ カスタムステータスコード付きエラーをハンドリングすること
- ✅ バリデーションエラーを400でハンドリングすること
- ✅ 認証エラーを401でハンドリングすること
- ✅ 権限エラーを403でハンドリングすること
- ✅ リソース未検出エラーを404でハンドリングすること
- ✅ 開発環境ではスタックトレースを含むこと
- ✅ 本番環境ではスタックトレースを含まないこと
- ✅ 存在しないルートに対して404エラーを返すこと
- ✅ 非同期関数のエラーを正しくハンドリングすること

**期待される実装モジュール**:
- `middleware/errorHandler.js`
  - `errorHandler(err, req, res, next)` - エラーハンドリングミドルウェア
  - `notFoundHandler(req, res, next)` - 404ハンドラー

### 3. バリデーションヘルパー
**ファイル**: `backend/__tests__/utils/validator.test.js`

**テスト内容**:
- ✅ 有効なメールアドレスを受け入れること
- ✅ 無効なメール形式を拒否すること（9パターン）
- ✅ パスワード長の検証
- ✅ パスワード複雑性の検証（大文字、小文字、数字、特殊文字）
- ✅ 必須フィールドの検証
- ✅ 文字列長の検証（最小長、最大長）
- ✅ 入力値のサニタイズ（HTMLタグ除去、特殊文字エスケープ）

**期待される実装モジュール**:
- `utils/validator.js`
  - `validateEmail(email)` - メール検証
  - `validatePassword(password, options)` - パスワード検証
  - `validateRequired(value, fieldName)` - 必須検証
  - `validateLength(value, options)` - 長さ検証
  - `sanitizeInput(input)` - サニタイズ

### 4. パスワードハッシュ化ユーティリティ
**ファイル**: `backend/__tests__/utils/password.test.js`

**テスト内容**:
- ✅ パスワードをハッシュ化できること
- ✅ 同じパスワードでも毎回異なるハッシュを生成すること（ソルト）
- ✅ 正しいパスワードで検証が成功すること
- ✅ 誤ったパスワードで検証が失敗すること
- ✅ ソルトを生成できること
- ✅ パスワード強度を検証できること（弱・中・強・非常に強）
- ✅ 一般的なパスワードを拒否すること
- ✅ bcryptアルゴリズムを使用すること
- ✅ コスト係数を指定できること
- ✅ エラーハンドリング

**期待される実装モジュール**:
- `utils/password.js`
  - `hashPassword(password, options)` - パスワードハッシュ化
  - `comparePassword(password, hash)` - パスワード比較
  - `generateSalt(length)` - ソルト生成
  - `validatePasswordStrength(password)` - 強度検証

## テスト実行結果

### コマンド
```bash
npm test
```

### 結果
**Status**: ❌ FAILED (期待通り - Red Phase)

### エラー内容
```
FAIL __tests__/middleware/auth.test.js
  ● Test suite failed to run
    Could not locate module ../../middleware/auth.js

FAIL __tests__/middleware/errorHandler.test.js
  ● Test suite failed to run
    Could not locate module ../../middleware/errorHandler.js

FAIL __tests__/utils/validator.test.js
  ● Test suite failed to run
    Could not locate module ../../utils/validator.js

FAIL __tests__/utils/password.test.js
  ● Test suite failed to run
    Could not locate module ../../utils/password.js

Test Suites: 5 failed, 5 total
Tests:       0 total
```

## Red Phaseの確認

✅ **全てのテストが失敗している** - 実装ファイルが存在しないため、期待通りの失敗

### 失敗理由
1. `middleware/auth.js` が存在しない
2. `middleware/errorHandler.js` が存在しない
3. `utils/validator.js` が存在しない
4. `utils/password.js` が存在しない

これは **TDD Red Phase として正しい状態** です。

## 次のステップ (Green Phase)

実装者 (implementer) は以下のファイルを作成して、テストをパスさせる必要があります:

1. `backend/middleware/auth.js` - JWT認証ミドルウェア
2. `backend/middleware/errorHandler.js` - エラーハンドリングミドルウェア
3. `backend/utils/validator.js` - バリデーションヘルパー
4. `backend/utils/password.js` - パスワードハッシュ化ユーティリティ

### 必要な依存関係
実装時に以下のパッケージが必要になる可能性があります:
- `jsonwebtoken` - JWT生成・検証
- `bcrypt` または `bcryptjs` - パスワードハッシュ化
- `validator` - バリデーションヘルパー（オプション）

## テーブル駆動テストパターンの採用

既存のコードベース (`backend/__tests__/api.test.js`) に合わせて、`test.each`を使用したテーブル駆動テストパターンを採用しました。

**例**:
```javascript
const testCases = [
  {
    description: '有効なトークンで認証が成功すること',
    token: 'valid.jwt.token',
    expectedError: null,
    expectedUserId: 123,
    shouldCallNext: true
  },
  // ...
];

test.each(testCases)(
  '$description',
  async ({ token, expectedError, expectedUserId, shouldCallNext }) => {
    // テストロジック
  }
);
```

このパターンにより:
- テストケースの追加が容易
- テストの可読性が向上
- 同じロジックで複数のケースをテスト可能

## メモ

- **サンドボックス制約**: テスト実行時に `EPERM: operation not permitted 0.0.0.0` エラーが発生したが、これはネットワーク権限の制約によるもの。新しく作成したテストファイルは実装ファイルが存在しないため、この段階までエラーが到達していない。
- **テストカバレッジ**: 各モジュールに対して、正常系・異常系・境界値を含む包括的なテストケースを作成済み。
- **実装の自由度**: テストは期待される動作のみを定義しており、実装の詳細は実装者に委ねられている。

## 結論

✅ **TDD Red Phase 完了**

全ての要求機能に対するテストが作成され、期待通り失敗することを確認しました。次のGreen Phaseで、これらのテストをパスさせる最小限の実装を行います。
