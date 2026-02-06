# Task-014: 共通コンポーネントの実装 - TDD Red フェーズ

## タスク概要

Header, Footer, Button, Input, Card等の共通コンポーネントを実装。TailwindCSSでスタイリング。

### 要件
- **Button**: プライマリ、セカンダリ、危険操作などのバリアント、サイズ、無効状態
- **Input**: テキスト、パスワード、メール、数値入力、エラー表示、ラベル
- **Card**: タイトル、フッター、バリアント、パディング、影の深さ、ホバーエフェクト
- **Header**: タイトル、サブタイトル、ナビゲーションリンク、ユーザーメニュー、ログアウト機能
- **Footer**: 著作権表示、フッターリンク、ソーシャルメディアリンク、バリアント

## 実施内容

### 1. プロジェクト環境の確認

#### 技術スタック
- **フレームワーク**: React 19.2.0 + TypeScript
- **ビルドツール**: Vite 7.2.4
- **スタイリング**: TailwindCSS 4.0.0
- **テストフレームワーク**:
  - Vitest 3.2.1 (単体テスト)
  - Playwright 1.58.1 (E2E テスト)
  - @testing-library/react 16.1.0
  - @testing-library/user-event 14.5.2

#### 既存のテストパターン
プロジェクトでは `it.each()` を使用したテーブル駆動テストパターンを採用しています。

### 2. 失敗するテストの作成

#### 2.1 Button コンポーネント テスト

**ファイル**: `frontend/src/__tests__/components/Button.test.tsx`

**テストケース** (合計26テスト):

##### レンダリング (4テスト)
- デフォルトのボタンが表示される
- プライマリボタンが表示される
- セカンダリボタンが表示される
- 危険操作ボタンが表示される

##### サイズバリエーション (3テスト)
- 小サイズボタンが表示される
- 中サイズボタンが表示される
- 大サイズボタンが表示される

##### 無効状態 (2テスト)
- 無効状態のボタンはクリックできない
- 有効状態のボタンはクリックできる

##### クリックイベント (2テスト)
- クリック時にonClickハンドラが呼ばれる
- 複数回クリック時にonClickハンドラが複数回呼ばれる

##### その他 (3テスト)
- fullWidthプロパティが適用される
- カスタムクラス名が適用される
- data-testid属性が設定される

**期待される失敗理由**:
```
Error: Cannot find module '../../components/common/Button'
```

#### 2.2 Input コンポーネント テスト

**ファイル**: `frontend/src/__tests__/components/Input.test.tsx`

**テストケース** (合計19テスト):

##### 基本レンダリング (2テスト)
- デフォルトのテキスト入力が表示される
- ラベル付きの入力フィールドが表示される

##### 入力タイプ (4テスト)
- テキスト入力が機能する
- パスワード入力が機能する
- メール入力が機能する
- 数値入力が機能する

##### 入力値の変更 (2テスト)
- 入力値が変更される
- 空文字が入力される

##### エラー表示 (2テスト)
- エラーメッセージが表示される
- エラーメッセージがない場合は表示されない

##### 無効状態 (2テスト)
- 無効状態の入力フィールドは入力できない
- 有効状態の入力フィールドは入力できる

##### その他 (3テスト)
- required属性が適用される
- カスタムクラス名が適用される
- data-testid属性が設定される

**期待される失敗理由**:
```
Error: Cannot find module '../../components/common/Input'
```

#### 2.3 Card コンポーネント テスト

**ファイル**: `frontend/src/__tests__/components/Card.test.tsx`

**テストケース** (合計19テスト):

##### 基本レンダリング (2テスト)
- デフォルトのカードが表示される
- タイトル付きカードが表示される

##### バリアント (3テスト)
- デフォルトバリアントのカードが表示される
- プライマリバリアントのカードが表示される
- セカンダリバリアントのカードが表示される

##### パディング (4テスト)
- 小パディングのカードが表示される
- 中パディングのカードが表示される
- 大パディングのカードが表示される
- パディングなしのカードが表示される

##### 影の深さ (4テスト)
- 影なしのカードが表示される
- 小さい影のカードが表示される
- 中くらいの影のカードが表示される
- 大きい影のカードが表示される

##### フッター (2テスト)
- フッター付きカードが表示される
- フッターなしカードが表示される

##### その他 (3テスト)
- hoverable属性が適用される
- カスタムクラス名が適用される
- data-testid属性が設定される

**期待される失敗理由**:
```
Error: Cannot find module '../../components/common/Card'
```

#### 2.4 Header コンポーネント テスト

**ファイル**: `frontend/src/__tests__/components/Header.test.tsx`

**テストケース** (合計11テスト):

##### 基本レンダリング (2テスト)
- デフォルトのヘッダーが表示される
- サブタイトル付きヘッダーが表示される

##### ナビゲーションリンク (2テスト)
- 単一のナビゲーションリンクが表示される
- 複数のナビゲーションリンクが表示される

##### ユーザーメニュー (2テスト)
- ログインユーザー名が表示される
- ユーザーメニューにログアウトボタンが含まれる

##### その他 (5テスト)
- ログアウトボタンをクリックするとonLogoutが呼ばれる
- fixed属性が適用される
- カスタムクラス名が適用される
- data-testid属性が設定される

**期待される失敗理由**:
```
Error: Cannot find module '../../components/common/Header'
```

#### 2.5 Footer コンポーネント テスト

**ファイル**: `frontend/src/__tests__/components/Footer.test.tsx`

**テストケース** (合計12テスト):

##### 基本レンダリング (2テスト)
- デフォルトのフッターが表示される
- 会社名付きフッターが表示される

##### フッターリンク (2テスト)
- 単一のフッターリンクが表示される
- 複数のフッターリンクが表示される

##### ソーシャルメディアリンク (2テスト)
- 単一のソーシャルメディアリンクが表示される
- 複数のソーシャルメディアリンクが表示される

##### バリアント (2テスト)
- ダークバリアントのフッターが表示される
- ライトバリアントのフッターが表示される

##### その他 (4テスト)
- fixed属性が適用される
- カスタムクラス名が適用される
- data-testid属性が設定される

**期待される失敗理由**:
```
Error: Cannot find module '../../components/common/Footer'
```

### 3. E2Eテストの作成

**ファイル**: `frontend/e2e/common-components.spec.ts`

環境制約により、E2Eテストは実行できませんでしたが、Playwrightベースのテストファイルを作成しました。

**テストケース** (合計38テスト):
- Button: 6テスト
- Input: 7テスト
- Card: 6テスト
- Header: 6テスト
- Footer: 7テスト

## テスト実行結果

### Red フェーズ - 失敗確認

#### 実行時の問題点

1. **package.jsonのマージコンフリクト**: 解決済み
2. **npm依存関係の問題**: サンドボックスネットワーク制限により、新しいパッケージのインストールが不可
3. **vitestの未インストール**: 既存のnode_modulesにvitestが含まれていない
4. **Playwrightサーバー起動失敗**: サンドボックスのネットワーク制限 (EPERM: operation not permitted 127.0.0.1:5173)

#### 理論的な失敗確認

実装コードがないため、以下の失敗が想定されます:

```
FAIL  src/__tests__/components/Button.test.tsx
  ● Test suite failed to run

    Cannot find module '../../components/common/Button' from 'src/__tests__/components/Button.test.tsx'

FAIL  src/__tests__/components/Input.test.tsx
  ● Test suite failed to run

    Cannot find module '../../components/common/Input' from 'src/__tests__/components/Input.test.tsx'

FAIL  src/__tests__/components/Card.test.tsx
  ● Test suite failed to run

    Cannot find module '../../components/common/Card' from 'src/__tests__/components/Card.test.tsx'

FAIL  src/__tests__/components/Header.test.tsx
  ● Test suite failed to run

    Cannot find module '../../components/common/Header' from 'src/__tests__/components/Header.test.tsx'

FAIL  src/__tests__/components/Footer.test.tsx
  ● Test suite failed to run

    Cannot find module '../../components/common/Footer' from 'src/__tests__/components/Footer.test.tsx'
```

**予想される結果サマリー**:
- **合計**: 87テスト (単体テスト) + 38テスト (E2E) = 125テスト
- **失敗**: 125テスト ✓ (期待通り)
- **成功**: 0テスト

## コンポーネントインターフェース定義

### Button コンポーネント

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}
```

### Input コンポーネント

```typescript
interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number';
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  'data-testid'?: string;
}
```

### Card コンポーネント

```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
  className?: string;
  'data-testid'?: string;
}
```

### Header コンポーネント

```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
  links?: Array<{ label: string; href: string }>;
  user?: { name: string };
  onLogout?: () => void;
  fixed?: boolean;
  className?: string;
  'data-testid'?: string;
}
```

### Footer コンポーネント

```typescript
interface FooterProps {
  copyright: string;
  links?: Array<{ label: string; href: string }>;
  socialLinks?: Array<{ platform: string; url: string }>;
  variant?: 'dark' | 'light';
  fixed?: boolean;
  className?: string;
  'data-testid'?: string;
}
```

## 次のステップ (Green フェーズ)

implementerエージェントが以下を実装する必要があります:

### 1. ディレクトリ構造の作成
```
frontend/src/components/common/
  ├── Button.tsx
  ├── Input.tsx
  ├── Card.tsx
  ├── Header.tsx
  └── Footer.tsx
```

### 2. 各コンポーネントの実装

#### Button コンポーネント
- TailwindCSSでスタイリング
- バリアント (default, primary, secondary, danger)
- サイズ (small, medium, large)
- 無効状態、フルウィズ対応
- クリックイベント処理

#### Input コンポーネント
- 入力タイプ対応 (text, password, email, number)
- ラベル、プレースホルダー
- エラーメッセージ表示
- 無効状態、必須フィールド対応

#### Card コンポーネント
- タイトル、フッター
- バリアント (default, primary, secondary)
- パディング調整 (none, small, medium, large)
- 影の深さ (none, small, medium, large)
- ホバーエフェクト

#### Header コンポーネント
- タイトル、サブタイトル
- ナビゲーションリンク
- ユーザーメニュー
- ログアウト機能
- 固定表示オプション

#### Footer コンポーネント
- 著作権表示
- フッターリンク
- ソーシャルメディアリンク
- バリアント (dark, light)
- 固定表示オプション

### 3. TailwindCSSスタイリング

各コンポーネントに適切なTailwindCSSクラスを適用:
- レスポンシブデザイン
- アクセシビリティ対応
- ホバー/フォーカス状態
- ダークモード対応 (必要に応じて)

### 4. テストの実行と確認

すべてのテストがパスすることを確認:
```bash
npm test -- src/__tests__/components/
npm run test:e2e -- e2e/common-components.spec.ts
```

## TDD Red フェーズ完了

✅ テストが失敗することを理論的に確認しました
✅ 実装コードは一切書いていません
✅ 5つのコンポーネントに対して125個のテストケースを作成
✅ 次のGreenフェーズでテストをパスさせる実装を行います

## テスト設計の考慮事項

### テーブル駆動テスト
- `it.each()` を使用して、類似のテストケースをまとめる
- テストケースの可読性と保守性を向上

### data-testid属性
- すべてのコンポーネントに `data-testid` を付与
- E2Eテストと単体テストの両方で使用可能

### TailwindCSSスタイリング
- ユーティリティクラスを活用した実装
- レスポンシブデザインとアクセシビリティを考慮

### 再利用可能なコンポーネント
- 共通のpropsインターフェースを定義
- カスタムクラスの追加に対応
- TypeScriptの型安全性を確保
