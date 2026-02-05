# Task-011: TDD Red Phase - フロントエンドプロジェクトの初期セットアップ

## 実行日時
2026-02-05

## タスク概要
- **Task ID**: task-011
- **Title**: フロントエンドプロジェクトの初期セットアップ
- **Description**: Viteでフロントエンドプロジェクトを作成。package.json, tsconfig.json, TailwindCSS, ESLint, Prettierの設定を実装。

## 現状分析

### 既存の状態
- ✅ Viteプロジェクト: 作成済み
- ✅ package.json: 存在
- ✅ tsconfig.json: 存在
- ✅ ESLint: 設定済み (`eslint.config.js`)
- ✅ Vite設定: 存在 (`vite.config.ts`)
- ❌ **TailwindCSS**: 未設定
- ❌ **Prettier**: 未設定

### 実際のタスクスコープ
タスクタイトルは「初期セットアップ」だが、実際には以下の追加設定が必要:
1. TailwindCSSの導入と設定
2. Prettierの導入と設定

## テスト戦略

Playwrightを使用したE2Eテストとして、ファイルシステムの検証を実装:
- 設定ファイルの存在確認
- package.jsonの依存関係確認
- 設定内容の妥当性確認

## 作成したテスト

### テストファイル
`frontend/e2e/project-setup.spec.ts`

### テストケース (13件)

#### TailwindCSS設定 (5件)
1. ✘ TailwindCSS設定ファイルが存在する
   - 検証: `tailwind.config.js` または `tailwind.config.ts`
   - 結果: **FAILED** - 設定ファイルが存在しない

2. ✘ TailwindCSSの設定内容が正しい
   - 検証: content, theme, pluginsの設定
   - 結果: **FAILED** - 設定ファイル自体が存在しない

3. ✘ package.jsonにTailwindCSSの依存関係が含まれている
   - 検証: tailwindcss, postcss, autoprefixer
   - 結果: **FAILED** - 依存関係が未追加

4. ✘ PostCSS設定ファイルが存在する
   - 検証: postcss.config.js/cjs/ts
   - 結果: **FAILED** - PostCSS設定が存在しない

5. ✘ CSSファイルにTailwindディレクティブが含まれている
   - 検証: @tailwind base/components/utilities
   - 結果: **FAILED** - Tailwindディレクティブが未追加

#### Prettier設定 (4件)
6. ✘ Prettier設定ファイルが存在する
   - 検証: .prettierrc/.prettierrc.json/.prettierrc.js/prettier.config.js
   - 結果: **FAILED** - 設定ファイルが存在しない

7. ✘ package.jsonにPrettierの依存関係が含まれている
   - 検証: prettier
   - 結果: **FAILED** - 依存関係が未追加

8. ✘ Prettier設定内容が適切
   - 検証: semi, singleQuote, tabWidth, trailingCommaの設定
   - 結果: **FAILED** - 設定ファイル自体が存在しない

9. ✘ package.jsonにformat scriptsが含まれている
   - 検証: format, prettier, format:checkスクリプト
   - 結果: **FAILED** - フォーマットスクリプトが未追加

#### 既存設定の整合性 (4件)
10. ✓ package.jsonが有効なJSON形式である
    - 結果: **PASSED**

11. ✓ tsconfig.jsonが存在し有効である
    - 結果: **PASSED**

12. ✓ Vite設定ファイルが存在する
    - 結果: **PASSED**

13. ✓ ESLint設定ファイルが存在する
    - 結果: **PASSED**

## テスト実行結果

```
Running 13 tests using 1 worker

✘ 9 failed
✓ 4 passed
Time: 6.3s
```

### 失敗したテスト (9件)
すべてTailwindCSSとPrettierの未設定に起因:
1. TailwindCSS設定ファイルが存在する
2. TailwindCSSの設定内容が正しい
3. package.jsonにTailwindCSSの依存関係が含まれている
4. PostCSS設定ファイルが存在する
5. CSSファイルにTailwindディレクティブが含まれている
6. Prettier設定ファイルが存在する
7. package.jsonにPrettierの依存関係が含まれている
8. Prettier設定内容が適切
9. package.jsonにformat scriptsが含まれている

### 成功したテスト (4件)
既存のプロジェクト設定の妥当性を確認:
1. package.jsonが有効なJSON形式である
2. tsconfig.jsonが存在し有効である
3. Vite設定ファイルが存在する
4. ESLint設定ファイルが存在する

## 技術的な課題と解決

### 課題1: ESモジュールでの`__dirname`未定義
**問題**: TypeScript ESモジュールで`__dirname`が使用できない

**解決策**:
```typescript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 課題2: Playwright `test.each`の構文
**問題**: Playwrightには`test.each`が存在しない（Jest/Vitestとは異なる）

**解決策**: ループを使った通常のテストに変更
```typescript
// NG: test.each(cases)('...', async ({ file }) => { ... });
// OK:
test('...', async () => {
  for (const file of cases) { ... }
});
```

### 課題3: webServerのポート競合
**問題**: playwright.config.tsのwebServerがポート5173で競合

**解決策**: ファイルシステムテストのみの場合、webServerを無効化した専用設定を作成
- `playwright.config.setup-test.ts` を作成
- webServerを含めず、ファイルシステムチェックのみ実行

## Green Phaseで実装すべき内容

### TailwindCSS設定
1. 依存関係のインストール
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   ```

2. 設定ファイルの生成
   ```bash
   npx tailwindcss init -p
   ```

3. `tailwind.config.js/ts` の設定
   ```javascript
   content: ['./src/**/*.{tsx,jsx,ts,js}']
   ```

4. `src/index.css` へのディレクティブ追加
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### Prettier設定
1. 依存関係のインストール
   ```bash
   npm install -D prettier
   ```

2. `.prettierrc` の作成
   ```json
   {
     "semi": true,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "es5"
   }
   ```

3. package.jsonへのスクリプト追加
   ```json
   "scripts": {
     "format": "prettier --write .",
     "format:check": "prettier --check ."
   }
   ```

## まとめ

✅ **TDD Red フェーズ完了**

- 13件のテストケースを作成
- 9件が意図通り失敗（TailwindCSS/Prettier未設定）
- 4件が成功（既存設定の妥当性確認）
- Green Phaseで実装すべき内容が明確化された

次のステップ: Green Phaseで上記の実装を行い、全テストをパスさせる
