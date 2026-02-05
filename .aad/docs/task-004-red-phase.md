# Task-004: TDD Red Phase - バックエンドプロジェクトのTypeScript初期セットアップ

## タスク概要

**Task ID:** task-004
**Task Title:** バックエンドプロジェクトの初期セットアップ
**Task Description:** バックエンドのpackage.json, tsconfig.json, ESLint, Prettierの設定を作成。必要な依存パッケージの定義とディレクトリ構造の作成。

## 実行日時

2026-02-05

## Red Phase 実行内容

### 作成したテストファイル

- `backend/__tests__/config.test.js`

### テスト対象

バックエンドプロジェクトのTypeScript化に必要な設定ファイルと依存関係の検証:

1. **tsconfig.json**
   - ファイルの存在
   - 有効なJSON構造
   - 必須のcompilerOptions
   - ES2020以上のターゲット
   - NodeNextまたはES2020+のモジュールシステム
   - strict モードの有効化
   - includeパターンの定義
   - node_modulesとdistの除外

2. **ESLint設定**
   - 設定ファイルの存在 (eslint.config.js または .eslintrc.js)
   - JavaScriptモジュールとしての有効性
   - TypeScriptパーサーの設定

3. **Prettier設定**
   - 設定ファイルの存在 (.prettierrc, .prettierrc.json, prettier.config.js等)
   - 有効なJSON/JS設定
   - printWidthとtabWidthの設定

4. **package.json TypeScript依存関係**
   - TypeScriptのdevDependency
   - @types/nodeのdevDependency
   - @types/expressのdevDependency
   - ESLint TypeScriptプラグイン
   - PrettierのdevDependency
   - TypeScriptビルドスクリプト (tsc)
   - 型チェックスクリプト
   - lintスクリプト
   - formatスクリプト

5. **ディレクトリ構造**
   - src/ディレクトリの存在
   - .gitignoreにdistディレクトリの記載

## テスト実行結果

### 実行コマンド

```bash
npm test -- __tests__/config.test.js
```

### 結果サマリー

```
Test Suites: 1 failed, 1 total
Tests:       21 failed, 5 passed, 26 total
Time:        0.15 s
```

### 失敗したテスト (21個)

#### tsconfig.json (8個)
- ✕ should exist in the backend directory
- ✕ should have valid JSON structure
- ✕ should have required compiler options
- ✕ should target ES2020 or later
- ✕ should use NodeNext or ES2020+ module system
- ✕ should enable strict mode
- ✕ should have include patterns
- ✕ should exclude node_modules and dist directories

#### ESLint Configuration (1個)
- ✕ should have ESLint configuration file

#### Prettier Configuration (1個)
- ✕ should have Prettier configuration file

#### package.json TypeScript Dependencies (9個)
- ✕ should have TypeScript as devDependency
- ✕ should have @types/node as devDependency
- ✕ should have @types/express as devDependency
- ✕ should have ESLint TypeScript plugins
- ✕ should have Prettier as devDependency
- ✕ should have TypeScript build script
- ✕ should have type-check script
- ✕ should have lint script
- ✕ should have format script

#### Directory Structure (2個)
- ✕ should have src directory for TypeScript source files
- ✕ should have dist directory in .gitignore

### パスしたテスト (5個)

#### ESLint Configuration (2個)
- ✓ should be a valid JavaScript module (条件付き)
- ✓ should configure TypeScript parser (条件付き)

#### Prettier Configuration (2個)
- ✓ should have valid JSON or JS configuration (条件付き)
- ✓ should configure print width and tab width (条件付き)

#### package.json TypeScript Dependencies (1個)
- ✓ should exist

## エラー詳細

### 主要なエラー

1. **tsconfig.json が存在しない**
   ```
   ENOENT: no such file or directory, open '/Users/kazuki/.../backend/tsconfig.json'
   ```

2. **ESLint設定ファイルが存在しない**
   ```
   Expected: true
   Received: false
   ```

3. **Prettier設定ファイルが存在しない**
   ```
   Expected: true
   Received: false
   ```

4. **package.json に必要な依存関係が不足**
   ```
   Expected path: "typescript"
   Received path: []
   Received value: {"jest": "^29.7.0", "nodemon": "^3.0.2", "supertest": "^6.3.3"}
   ```

5. **src/ ディレクトリが存在しない**
   ```
   Expected: true
   Received: false
   ```

6. **.gitignore に dist が含まれていない**
   ```
   Expected substring: "dist"
   Received string: "node_modules/\n.env\ncoverage/\n*.log\n.DS_Store\n"
   ```

## 現在の状態

### 既存のファイル構成

```
backend/
├── __tests__/
│   ├── api.test.js          (既存)
│   └── config.test.js       (NEW - Red Phase)
├── .gitignore               (既存)
├── db.js                    (既存)
├── env.example              (既存)
├── jest.config.js           (既存)
├── package.json             (既存 - JavaScript構成)
├── package-lock.json        (既存)
├── README.md                (既存)
└── server.js                (既存 - JavaScript)
```

### 不足しているファイル/設定

- ✗ tsconfig.json
- ✗ eslint.config.js または .eslintrc.js
- ✗ .prettierrc または prettier.config.js
- ✗ src/ ディレクトリ
- ✗ package.json の TypeScript 関連依存関係
- ✗ package.json の TypeScript ビルド・型チェック・lint・formatスクリプト
- ✗ .gitignore の dist エントリ

## 次のステップ (Green Phase)

Green Phaseでは、以下のファイルを作成/更新してテストをパスさせる必要があります:

1. **tsconfig.json** を作成
   - ES2020+ ターゲット
   - NodeNext または ES2020+ モジュール
   - strict モード有効化
   - src/ を include
   - node_modules, dist を exclude

2. **eslint.config.js** を作成
   - TypeScript パーサー設定
   - TypeScript ESLint プラグイン設定

3. **.prettierrc** を作成
   - printWidth 設定
   - tabWidth 設定

4. **package.json** を更新
   - typescript を devDependencies に追加
   - @types/node, @types/express を devDependencies に追加
   - @typescript-eslint/parser, @typescript-eslint/eslint-plugin を追加
   - prettier を devDependencies に追加
   - build スクリプト (tsc) を追加
   - type-check スクリプトを追加
   - lint スクリプト (eslint) を追加
   - format スクリプト (prettier) を追加

5. **src/ ディレクトリ** を作成

6. **.gitignore** を更新
   - dist/ を追加

## まとめ

Red Phaseは正常に完了しました。26個のテストケースのうち21個が期待通り失敗し、TypeScript化に必要な設定とファイルが不足していることが明確に示されました。

これらの失敗テストは、次のGreen Phaseで実装すべき要件の明確な仕様となります。
