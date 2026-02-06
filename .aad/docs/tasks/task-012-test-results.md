# Task-012: フロントエンドのルーティング設定 - テスト結果

## テスト実施日時
2026-02-05

## TDD Red Phase - テスト結果

### 実施内容
1. 既存テストの確認
2. テストセットアップの修正
   - `@testing-library/jest-dom`のインストール
   - `frontend/src/test/setup.ts`への`jest-dom`インポート追加
3. テスト実行

### テスト実行結果

#### 成功したテスト
- `src/__tests__/App.test.tsx`: **10/10 テスト成功** ✅
  - ルーティング設定 (4テスト)
  - ProtectedRouteによる認証チェック (4テスト)
  - リダイレクト後の元のパス保存 (2テスト)

- `src/__tests__/ProtectedRoute.test.tsx`: **6/8 テスト成功**
  - 認証チェック: 未認証時のリダイレクト (2テスト) ✅
  - リダイレクト後の元のパス保存 (2テスト) ✅
  - 認証済みユーザーの場合 (2テスト) ✅

#### 失敗したテスト (Red Phase - 期待される失敗)
- `src/__tests__/ProtectedRoute.test.tsx`: **2/8 テスト失敗** ❌
  1. `authTokenがlocalStorageに存在する場合、子要素が表示される`
  2. `authTokenがlocalStorageに存在する場合（別のトークン）、子要素が表示される`

### 失敗の詳細

#### エラーメッセージ
```
TestingLibraryElementError: Unable to find an element with the text: 保護されたコンテンツ.

Rendered:
<body>
  <div>
    <div>
      ログインページ
    </div>
  </div>
</body>
```

#### 失敗の原因
- 認証トークンがlocalStorageに存在する場合、保護されたコンテンツが表示されるべき
- しかし、実際にはログインページが表示されている
- ProtectedRouteコンポーネントまたはルーティング設定に問題がある可能性

### テストケースの網羅性

#### ルーティング設定
- ✅ ルートパス(`/`)でLoginPageが表示される
- ✅ `/todos`パスでTodosPageが表示される（認証済み）
- ✅ `/dashboard`パスでDashboardPageが表示される（認証済み）
- ✅ 存在しないパスでNotFoundPageが表示される

#### 認証チェック
- ✅ 未認証時に`/todos`にアクセスするとLoginPageにリダイレクト
- ✅ 未認証時に`/dashboard`にアクセスするとLoginPageにリダイレクト
- ✅ 認証済みの場合は`/todos`にアクセス可能
- ✅ 認証済みの場合は`/dashboard`にアクセス可能

#### リダイレクト保存
- ✅ 未認証時に保護されたルートにアクセスすると、sessionStorageに元のパスが保存される
- ✅ 認証済みの場合は、sessionStorageにリダイレクト先が保存されない

### 次のステップ(Green Phase)
1. ProtectedRouteコンポーネントの実装修正
2. テストが全てパスすることを確認
3. 必要に応じてリファクタリング(Blue Phase)

### 警告
以下の警告が出ているが、機能的な問題ではない:
```
An update to TodosPage inside a test was not wrapped in act(...).
```
これは非同期状態更新に関する警告で、優先度は低い(LOW)。機能的な問題が解決してから対応を検討。

## 結論
- TDD Redフェーズとして適切に失敗するテストを確認 ✅
- 18テスト中16テストが成功、2テストが期待通り失敗
- テストの網羅性は十分
- 次はGreen Phaseとして実装を修正する準備が整った
