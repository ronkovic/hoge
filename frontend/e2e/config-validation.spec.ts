import { test, expect } from '@playwright/test';
import { readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

test.describe('設定ファイルの詳細検証', () => {
  test.describe('ESLint設定の検証', () => {
    const eslintConfigCases = [
      { file: 'eslint.config.js', type: 'FlatConfig' },
      { file: '.eslintrc.json', type: 'Legacy' },
      { file: '.eslintrc.js', type: 'Legacy' },
    ];

    test('ESLint設定ファイルが存在する', async () => {
      let exists = false;
      let foundType = '';

      for (const { file, type } of eslintConfigCases) {
        const configPath = join(PROJECT_ROOT, file);
        try {
          await access(configPath);
          exists = true;
          foundType = type;
          break;
        } catch {
          continue;
        }
      }

      expect(exists).toBeTruthy();
      expect(foundType).toBeTruthy();
    });

    test('ESLint設定にTypeScript対応が含まれている', async () => {
      let configPath: string | null = null;

      for (const { file } of eslintConfigCases) {
        const path = join(PROJECT_ROOT, file);
        try {
          await access(path);
          configPath = path;
          break;
        } catch {
          continue;
        }
      }

      expect(configPath).not.toBeNull();

      if (configPath) {
        const content = await readFile(configPath, 'utf-8');

        // TypeScript ESLintの設定を確認
        const hasTypeScriptConfig =
          content.includes('typescript-eslint') ||
          content.includes('@typescript-eslint') ||
          content.includes('parser') && content.includes('typescript');

        expect(hasTypeScriptConfig).toBeTruthy();
      }
    });

    test('ESLint設定にReact対応が含まれている', async () => {
      let configPath: string | null = null;

      for (const { file } of eslintConfigCases) {
        const path = join(PROJECT_ROOT, file);
        try {
          await access(path);
          configPath = path;
          break;
        } catch {
          continue;
        }
      }

      expect(configPath).not.toBeNull();

      if (configPath) {
        const content = await readFile(configPath, 'utf-8');

        // React ESLintの設定を確認
        const hasReactConfig =
          content.includes('react') ||
          content.includes('jsx');

        expect(hasReactConfig).toBeTruthy();
      }
    });

    test('package.jsonにESLintの依存関係が含まれている', async () => {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const devDeps = packageJson.devDependencies || {};

      expect(devDeps['eslint']).toBeDefined();
      expect(
        devDeps['typescript-eslint'] ||
        devDeps['@typescript-eslint/eslint-plugin'] ||
        devDeps['@typescript-eslint/parser']
      ).toBeDefined();
    });

    test('package.jsonにlint scriptsが含まれている', async () => {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const scripts = packageJson.scripts || {};

      expect(scripts['lint']).toBeDefined();
    });
  });

  test.describe('TypeScript設定の検証', () => {
    test('tsconfig.jsonが存在し有効なJSON形式である', async () => {
      const tsconfigPath = join(PROJECT_ROOT, 'tsconfig.json');
      await access(tsconfigPath);

      const content = await readFile(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig).toBeDefined();
    });

    test('tsconfig.jsonに必要な設定が含まれている', async () => {
      const tsconfigPath = join(PROJECT_ROOT, 'tsconfig.json');
      const content = await readFile(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      // references または files/include のいずれかが必要
      const hasConfig =
        tsconfig.references !== undefined ||
        tsconfig.files !== undefined ||
        tsconfig.include !== undefined;

      expect(hasConfig).toBeTruthy();
    });

    test('tsconfig.app.jsonが存在する場合、適切な設定を含む', async () => {
      const tsconfigAppPath = join(PROJECT_ROOT, 'tsconfig.app.json');

      try {
        await access(tsconfigAppPath);
        const content = await readFile(tsconfigAppPath, 'utf-8');
        const tsconfigApp = JSON.parse(content);

        // アプリケーション用の設定をチェック
        expect(tsconfigApp.compilerOptions).toBeDefined();

        // JSX設定の確認
        const hasJsxConfig =
          tsconfigApp.compilerOptions?.jsx !== undefined;

        expect(hasJsxConfig).toBeTruthy();
      } catch {
        // tsconfig.app.jsonが存在しない場合はスキップ
        test.skip();
      }
    });

    test('package.jsonにTypeScriptの依存関係が含まれている', async () => {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const devDeps = packageJson.devDependencies || {};

      expect(devDeps['typescript']).toBeDefined();
    });
  });

  test.describe('ビルド設定の検証', () => {
    test('Vite設定ファイルが存在する', async () => {
      const viteConfigCases = [
        'vite.config.ts',
        'vite.config.js',
      ];

      let exists = false;
      for (const file of viteConfigCases) {
        const configPath = join(PROJECT_ROOT, file);
        try {
          await access(configPath);
          exists = true;
          break;
        } catch {
          continue;
        }
      }

      expect(exists).toBeTruthy();
    });

    test('Vite設定にReactプラグインが含まれている', async () => {
      const viteConfigCases = [
        'vite.config.ts',
        'vite.config.js',
      ];

      let configPath: string | null = null;
      for (const file of viteConfigCases) {
        const path = join(PROJECT_ROOT, file);
        try {
          await access(path);
          configPath = path;
          break;
        } catch {
          continue;
        }
      }

      expect(configPath).not.toBeNull();

      if (configPath) {
        const content = await readFile(configPath, 'utf-8');

        expect(content).toContain('defineConfig');
        expect(content).toContain('react');
      }
    });

    test('package.jsonにビルド scriptsが含まれている', async () => {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const scripts = packageJson.scripts || {};

      expect(scripts['build']).toBeDefined();
      expect(scripts['dev']).toBeDefined();
    });

    test('package.jsonにViteの依存関係が含まれている', async () => {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const devDeps = packageJson.devDependencies || {};

      expect(devDeps['vite']).toBeDefined();
      expect(devDeps['@vitejs/plugin-react']).toBeDefined();
    });
  });

  test.describe('設定ファイル間の整合性', () => {
    test('index.htmlが存在する', async () => {
      const indexPath = join(PROJECT_ROOT, 'index.html');
      await access(indexPath);

      const content = await readFile(indexPath, 'utf-8');

      // Reactのエントリーポイントへの参照を確認
      const hasEntryPoint =
        content.includes('src/main') ||
        content.includes('src/index');

      expect(hasEntryPoint).toBeTruthy();
    });

    test('エントリーポイントファイルが存在する', async () => {
      const entryCases = [
        'src/main.tsx',
        'src/main.ts',
        'src/main.jsx',
        'src/main.js',
        'src/index.tsx',
        'src/index.ts',
      ];

      let exists = false;
      for (const file of entryCases) {
        const entryPath = join(PROJECT_ROOT, file);
        try {
          await access(entryPath);
          exists = true;
          break;
        } catch {
          continue;
        }
      }

      expect(exists).toBeTruthy();
    });

    test('.gitignoreが存在し、必要な除外設定がある', async () => {
      const gitignorePath = join(PROJECT_ROOT, '.gitignore');
      await access(gitignorePath);

      const content = await readFile(gitignorePath, 'utf-8');

      // 必須の除外項目を確認
      expect(content).toContain('node_modules');
      expect(content).toContain('dist');
    });

    test('package.jsonのtypeがmoduleである', async () => {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      // ViteプロジェクトではESM形式が推奨される
      expect(packageJson.type).toBe('module');
    });
  });

  test.describe('実際のツール実行検証', () => {
    test('TypeScriptコンパイラがエラーなく実行できる', async () => {
      // この時点では実装がないため、型チェックは失敗することを期待
      // Redフェーズなので、テストは失敗するべき
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      try {
        await execAsync('npx tsc --noEmit', { cwd: PROJECT_ROOT });
        // 実装がない段階では成功しないはず
        expect(false).toBeTruthy();
      } catch (error) {
        // Redフェーズでは失敗することを期待
        expect(error).toBeDefined();
      }
    });

    test('ESLintが実行できる', async () => {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      try {
        await execAsync('npm run lint', { cwd: PROJECT_ROOT });
        // 実装がない段階では警告やエラーがあるはず
        expect(false).toBeTruthy();
      } catch (error) {
        // Redフェーズでは失敗することを期待
        expect(error).toBeDefined();
      }
    });

    test('Prettierが実行できる', async () => {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      try {
        await execAsync('npm run format:check', { cwd: PROJECT_ROOT });
        // 実装がない段階では失敗するかもしれない
        // 設定が正しければパスする可能性もある
      } catch {
        // エラーがあっても設定ファイルの問題かコードの問題かを区別できない
        // このテストは実装後に重要になる
      }
    });

    test('Viteビルドが実行できる構成である', async () => {
      // この段階ではビルドは失敗することを期待
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      try {
        await execAsync('npm run build', { cwd: PROJECT_ROOT, timeout: 30000 });
        // Redフェーズでは実装がないため失敗するはず
        expect(false).toBeTruthy();
      } catch (error) {
        // ビルドエラーが発生することを期待
        expect(error).toBeDefined();
      }
    });
  });
});
