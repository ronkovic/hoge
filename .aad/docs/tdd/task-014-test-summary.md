# task-014 テストサマリー

## 概要
共通コンポーネント (Button, Input, Card, Header, Footer) のテストケース一覧

## テストパターン
Vitest の `it.each` を使用したテーブル駆動テスト

## Button コンポーネント

| カテゴリ | テストケース数 | 検証項目 |
|---------|--------------|---------|
| レンダリング | 4 | デフォルト, primary, secondary, danger |
| サイズ | 3 | small, medium, large |
| 無効状態 | 2 | disabled: true/false |
| クリック | 2 | 単一クリック, 複数回クリック |
| その他 | 4 | fullWidth, カスタムクラス, data-testid |
| **合計** | **15** | |

## Input コンポーネント

| カテゴリ | テストケース数 | 検証項目 |
|---------|--------------|---------|
| 基本レンダリング | 2 | デフォルト, ラベル付き |
| 入力タイプ | 4 | text, password, email, number |
| 入力値変更 | 2 | 入力値変更, 空文字入力 |
| エラー表示 | 2 | エラーあり/なし |
| 無効状態 | 2 | disabled: true/false |
| その他 | 3 | required, カスタムクラス, data-testid |
| **合計** | **15** | |

## Card コンポーネント

| カテゴリ | テストケース数 | 検証項目 |
|---------|--------------|---------|
| 基本レンダリング | 2 | デフォルト, タイトル付き |
| バリアント | 3 | default, primary, secondary |
| パディング | 4 | small, medium, large, none |
| 影 | 4 | none, small, medium, large |
| フッター | 2 | フッターあり/なし |
| その他 | 3 | hoverable, カスタムクラス, data-testid |
| **合計** | **18** | |

## Header コンポーネント

| カテゴリ | テストケース数 | 検証項目 |
|---------|--------------|---------|
| 基本レンダリング | 2 | デフォルト, サブタイトル付き |
| ナビゲーション | 2 | 単一リンク, 複数リンク |
| ユーザーメニュー | 2 | ユーザー名表示, ログアウトボタン |
| ログアウト | 1 | onClick ハンドラ呼び出し |
| その他 | 3 | fixed, カスタムクラス, data-testid |
| **合計** | **10** | |

## Footer コンポーネント

| カテゴリ | テストケース数 | 検証項目 |
|---------|--------------|---------|
| 基本レンダリング | 2 | デフォルト, 会社名付き |
| フッターリンク | 2 | 単一リンク, 複数リンク |
| ソーシャルリンク | 2 | 単一リンク, 複数リンク |
| バリアント | 2 | dark, light |
| その他 | 3 | fixed, カスタムクラス, data-testid |
| **合計** | **11** | |

## 総合計

| コンポーネント | テストケース数 |
|--------------|--------------|
| Button | 15 |
| Input | 15 |
| Card | 18 |
| Header | 10 |
| Footer | 11 |
| **総計** | **69** |

## テストの特徴

### 1. テーブル駆動テスト
すべてのテストケースで `it.each` を使用し、パラメータ化されたテストを実装。

```typescript
it.each([
  { name: 'ケース1', props: {...}, expected: ... },
  { name: 'ケース2', props: {...}, expected: ... },
])('$name', ({ props, expected }) => {
  // テストロジック
});
```

### 2. カバレッジ項目
- プロパティのバリエーション
- イベントハンドラ
- 条件付きレンダリング
- スタイリング (TailwindCSS クラス)
- アクセシビリティ (role, aria 属性)
- data-testid によるテスト容易性

### 3. Testing Library ベストプラクティス
- `getByRole` を優先的に使用
- `getByText` でコンテンツを検証
- `getByPlaceholderText` でフォーム要素を特定
- `getByTestId` は必要な場合のみ使用
- `userEvent` でユーザー操作をシミュレート

## 実行コマンド

```bash
# 全てのコンポーネントテストを実行
npm test -- --run __tests__/components/

# 特定のコンポーネントのみ
npm test -- --run __tests__/components/Button.test.tsx
npm test -- --run __tests__/components/Input.test.tsx
npm test -- --run __tests__/components/Card.test.tsx
npm test -- --run __tests__/components/Header.test.tsx
npm test -- --run __tests__/components/Footer.test.tsx

# カバレッジ付きで実行
npm test -- --run --coverage __tests__/components/
```

## 期待される結果 (Red Phase)

現在の状態: **全テスト失敗 (69 failed)**

理由: 実装がダミーで、エラーをスローするため

```
Error: Button component not implemented yet
Error: Input component not implemented yet
Error: Card component not implemented yet
Error: Header component not implemented yet
Error: Footer component not implemented yet
```

## 次のステップ (Green Phase)

各コンポーネントを実装し、テストがパスするようにする:

1. Button コンポーネント → 15 tests pass
2. Input コンポーネント → 15 tests pass
3. Card コンポーネント → 18 tests pass
4. Header コンポーネント → 10 tests pass
5. Footer コンポーネント → 11 tests pass

目標: **69 tests pass** ✅
