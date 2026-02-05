import { test, expect } from '@playwright/test';
import { readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

test.describe('フロントエンドプロジェクトの初期セットアップ', () => {
  test.describe('TailwindCSS設定', () => {
    test('TailwindCSS設定ファイルが存在する', async () => {
      const configCases = [
        'tailwind.config.js',
        'tailwind.config.ts',
      ];

      let exists = false;
      for (const file of configCases) {
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

    test('TailwindCSSの設定内容が正しい', async () => {
      const configCases = [
        'tailwind.config.js',
        'tailwind.config.ts',
      ];

      let configPath: string | null = null;
      for (const file of configCases) {
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

        // 必須設定項目の検証
        expect(content).toContain('content');
        expect(content).toMatch(/["']\.\/src\/\*\*\/\*\.{tsx?,jsx?}/);
        expect(content).toContain('theme');
        expect(content).toContain('plugins');
      }
    });

    test('package.jsonにTailwindCSSの依存関係が含まれている', async () => {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const devDeps = packageJson.devDependencies || {};

      expect(devDeps['tailwindcss']).toBeDefined();
      expect(devDeps['postcss']).toBeDefined();
      expect(devDeps['autoprefixer']).toBeDefined();
    });

    test('PostCSS設定ファイルが存在する', async () => {
      const postcssConfigs = [
        'postcss.config.js',
        'postcss.config.cjs',
        'postcss.config.ts',
      ];

      let exists = false;
      for (const configFile of postcssConfigs) {
        const configPath = join(PROJECT_ROOT, configFile);
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

    test('CSSファイルにTailwindディレクティブが含まれている', async () => {
      const cssPath = join(PROJECT_ROOT, 'src', 'index.css');
      const content = await readFile(cssPath, 'utf-8');

      expect(content).toContain('@tailwind base');
      expect(content).toContain('@tailwind components');
      expect(content).toContain('@tailwind utilities');
    });
  });

  test.describe('Prettier設定', () => {
    const prettierConfigCases = [
      { file: '.prettierrc', description: '.prettierrc' },
      { file: '.prettierrc.json', description: '.prettierrc.json' },
      { file: '.prettierrc.js', description: '.prettierrc.js' },
      { file: 'prettier.config.js', description: 'prettier.config.js' },
    ];

    test('Prettier設定ファイルが存在する', async () => {
      let exists = false;
      for (const { file } of prettierConfigCases) {
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

    test('package.jsonにPrettierの依存関係が含まれている', async () => {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const devDeps = packageJson.devDependencies || {};

      expect(devDeps['prettier']).toBeDefined();
    });

    test('Prettier設定内容が適切', async () => {
      let configPath: string | null = null;
      let configContent: string | null = null;

      for (const { file } of prettierConfigCases) {
        const path = join(PROJECT_ROOT, file);
        try {
          await access(path);
          configPath = path;
          configContent = await readFile(path, 'utf-8');
          break;
        } catch {
          continue;
        }
      }

      expect(configPath).not.toBeNull();
      expect(configContent).not.toBeNull();

      if (configContent) {
        // JSON or JSの場合、基本的な設定項目をチェック
        const hasConfig =
          configContent.includes('semi') ||
          configContent.includes('singleQuote') ||
          configContent.includes('tabWidth') ||
          configContent.includes('trailingComma');

        expect(hasConfig).toBeTruthy();
      }
    });

    test('package.jsonにformat scriptsが含まれている', async () => {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const scripts = packageJson.scripts || {};

      // formatまたはprettierスクリプトの存在を確認
      const hasFormatScript =
        scripts['format'] !== undefined ||
        scripts['prettier'] !== undefined ||
        scripts['format:check'] !== undefined;

      expect(hasFormatScript).toBeTruthy();
    });
  });

  test.describe('既存設定の整合性', () => {
    test('package.jsonが有効なJSON形式である', async () => {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');

      expect(() => JSON.parse(content)).not.toThrow();

      const packageJson = JSON.parse(content);
      expect(packageJson.name).toBeDefined();
      expect(packageJson.version).toBeDefined();
    });

    test('tsconfig.jsonが存在し有効である', async () => {
      const tsconfigPath = join(PROJECT_ROOT, 'tsconfig.json');
      await access(tsconfigPath);

      const content = await readFile(tsconfigPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('Vite設定ファイルが存在する', async () => {
      const viteConfigPath = join(PROJECT_ROOT, 'vite.config.ts');
      await access(viteConfigPath);

      const content = await readFile(viteConfigPath, 'utf-8');
      expect(content).toContain('defineConfig');
      expect(content).toContain('react');
    });

    test('ESLint設定ファイルが存在する', async () => {
      const eslintConfigPath = join(PROJECT_ROOT, 'eslint.config.js');
      await access(eslintConfigPath);
    });
  });
});
