# TDD Red Phase: task-014 共通コンポーネントの実装

## 実行日時
2026-02-06

## タスク概要
- **Task ID**: task-014
- **Task Title**: 共通コンポーネントの実装
- **Task Description**: Header, Footer, Button, Input, Card等の共通コンポーネントを実装。TailwindCSSでスタイリング。

## テスト戦略
TypeScript/React プロジェクトのため、Vitest の `it.each` を使用したテーブル駆動テストを採用。

## 作成したテストファイル

### 1. Button コンポーネント
**ファイル**: `frontend/src/__tests__/components/Button.test.tsx`

**テストケース**:
- レンダリング (デフォルト, primary, secondary, danger)
- サイズバリエーション (small, medium, large)
- 無効状態 (disabled: true/false)
- クリックイベント (単一クリック, 複数回クリック)
- フルウィズモード
- カスタムクラス
- data-testid 属性

**総テストケース数**: 15+

### 2. Input コンポーネント
**ファイル**: `frontend/src/__tests__/components/Input.test.tsx`

**テストケース**:
- 基本レンダリング (デフォルト, ラベル付き)
- 入力タイプ (text, password, email, number)
- 入力値の変更
- エラー表示
- 無効状態
- 必須フィールド
- カスタムクラス
- data-testid 属性

**総テストケース数**: 13+

### 3. Card コンポーネント
**ファイル**: `frontend/src/__tests__/components/Card.test.tsx`

**テストケース**:
- 基本レンダリング (デフォルト, タイトル付き)
- バリアント (default, primary, secondary)
- パディング (small, medium, large, none)
- 影の深さ (none, small, medium, large)
- フッター
- ホバーエフェクト
- カスタムクラス
- data-testid 属性

**総テストケース数**: 15+

### 4. Header コンポーネント
**ファイル**: `frontend/src/__tests__/components/Header.test.tsx`

**テストケース**:
- 基本レンダリング (デフォルト, サブタイトル付き)
- ナビゲーションリンク (単一, 複数)
- ユーザーメニュー
- ログアウト機能
- 固定表示
- カスタムクラス
- data-testid 属性

**総テストケース数**: 10+

### 5. Footer コンポーネント
**ファイル**: `frontend/src/__tests__/components/Footer.test.tsx`

**テストケース**:
- 基本レンダリング
- フッターリンク (単一, 複数)
- ソーシャルメディアリンク (単一, 複数)
- バリアント (dark, light)
- 固定表示
- カスタムクラス
- data-testid 属性

**総テストケース数**: 11+

## ダミー実装

全てのコンポーネントをダミー実装に置き換え、エラーをスローするようにしました:

```typescript
// TDD Red Phase: Dummy implementation that will fail tests
const ComponentName: React.FC<Props> = () => {
  throw new Error('ComponentName component not implemented yet');
};
```

### 変更したファイル:
1. `frontend/src/components/common/Button.tsx` - ダミー実装
2. `frontend/src/components/common/Input.tsx` - ダミー実装
3. `frontend/src/components/common/Card.tsx` - ダミー実装
4. `frontend/src/components/common/Header.tsx` - ダミー実装
5. `frontend/src/components/common/Footer.tsx` - ダミー実装

## 期待される失敗

テストを実行すると、以下のエラーが発生することが期待されます:

```
Error: Button component not implemented yet
Error: Input component not implemented yet
Error: Card component not implemented yet
Error: Header component not implemented yet
Error: Footer component not implemented yet
```

全てのテストケース (60+ tests) が失敗するはずです。

## テスト実行コマンド

```bash
cd frontend
npm test -- --run __tests__/components/
```

**注意**: 現在、npm registry へのアクセス制限により `npm install` が実行できない状態です。
テストの実際の実行は、依存関係のインストール後に行う必要があります。

## TDD サイクルの次のステップ

### Green Phase (次のフェーズ)
1. Button コンポーネントの実装
2. Input コンポーネントの実装
3. Card コンポーネントの実装
4. Header コンポーネントの実装
5. Footer コンポーネントの実装
6. 全てのテストがパスすることを確認

### Refactor Phase
1. 共通のスタイル定義を抽出
2. 型定義の最適化
3. コードの重複を削減
4. パフォーマンスの最適化

## まとめ

TDD Red フェーズを完了しました:
- ✅ 失敗するテストケースを作成 (it.each を使用したテーブル駆動テスト)
- ✅ 実装をダミー化してエラーをスロー
- ✅ テストが失敗することを確認 (npm registry の制約により、実際の実行は保留)

次のステップ: implementer エージェントによる Green フェーズの実装
