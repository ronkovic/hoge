import { test, expect } from '@playwright/test';
import { readFile, stat } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * フロントエンドプロジェクト初期セットアップの検証テスト
 * Task ID: task-011
 *
 * 検証項目:
 * - package.json の存在と必須フィールド
 * - tsconfig.json の存在と設定
 * - Vite設定の存在
 * - TailwindCSS設定の存在
 * - ESLint設定の存在
 * - Prettier設定の存在
 */

test.describe('フロントエンドプロジェクト初期セットアップ検証', () => {
  const projectRoot = resolve(__dirname, '..');

  test.describe('package.json 検証', () => {
    const testCases = [
      { field: 'name', expected: 'frontend' },
      { field: 'type', expected: 'module' },
      { field: 'scripts.dev', expected: 'vite' },
      { field: 'scripts.build', expected: expect.stringContaining('vite build') },
      { field: 'scripts.lint', expected: 'eslint .' },
      { field: 'scripts.preview', expected: 'vite preview' },
    ];

    test.beforeAll(async () => {
      const packageJsonPath = resolve(projectRoot, 'package.json');
      await readFile(packageJsonPath, 'utf-8'); // ファイルが読めることを確認
    });

    testCases.forEach(({ field, expected }) => {
      test(`${field} フィールドが正しく設定されている`, async () => {
        const packageJsonPath = resolve(projectRoot, 'package.json');
        const content = await readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);

        const fieldParts = field.split('.');
        let value = packageJson;
        for (const part of fieldParts) {
          value = value[part];
        }

        if (typeof expected === 'string') {
          expect(value).toBe(expected);
        } else {
          expect(value).toEqual(expected);
        }
      });
    });

    const requiredDeps = [
      { name: 'react', type: 'dependencies' },
      { name: 'react-dom', type: 'dependencies' },
      { name: 'vite', type: 'devDependencies' },
      { name: '@vitejs/plugin-react', type: 'devDependencies' },
      { name: 'typescript', type: 'devDependencies' },
      { name: 'tailwindcss', type: 'devDependencies' },
      { name: 'eslint', type: 'devDependencies' },
      { name: 'prettier', type: 'devDependencies' },
    ];

    requiredDeps.forEach(({ name, type }) => {
      test(`${name} が ${type} に含まれている`, async () => {
        const packageJsonPath = resolve(projectRoot, 'package.json');
        const content = await readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);

        expect(packageJson[type]).toHaveProperty(name);
        expect(packageJson[type][name]).toBeTruthy();
      });
    });
  });

  test.describe('TypeScript設定検証', () => {
    const configFiles = [
      { name: 'tsconfig.json', description: 'メインTypeScript設定' },
      { name: 'tsconfig.app.json', description: 'アプリケーション用TypeScript設定' },
      { name: 'tsconfig.node.json', description: 'Node.js用TypeScript設定' },
    ];

    configFiles.forEach(({ name, description }) => {
      test(`${name} (${description}) が存在する`, async () => {
        const configPath = resolve(projectRoot, name);
        const content = await readFile(configPath, 'utf-8');
        const config = JSON.parse(content);

        expect(config).toBeTruthy();
      });
    });

    test('tsconfig.json が参照設定を含んでいる', async () => {
      const configPath = resolve(projectRoot, 'tsconfig.json');
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.references).toBeDefined();
      expect(Array.isArray(config.references)).toBe(true);
      expect(config.references.length).toBeGreaterThan(0);
    });
  });

  test.describe('Vite設定検証', () => {
    test('vite.config.ts が存在する', async () => {
      const configPath = resolve(projectRoot, 'vite.config.ts');
      const content = await readFile(configPath, 'utf-8');

      expect(content).toContain('defineConfig');
      expect(content).toContain('react');
    });

    test('Vite設定が react プラグインを含んでいる', async () => {
      const configPath = resolve(projectRoot, 'vite.config.ts');
      const content = await readFile(configPath, 'utf-8');

      expect(content).toContain('@vitejs/plugin-react');
      expect(content).toContain('plugins: [react()]');
    });
  });

  test.describe('TailwindCSS設定検証', () => {
    test('tailwind.config.js が存在する', async () => {
      const configPath = resolve(projectRoot, 'tailwind.config.js');
      const content = await readFile(configPath, 'utf-8');

      expect(content).toContain('content');
      expect(content).toContain('./src/**/*.{js,ts,jsx,tsx}');
    });

    test('postcss.config.js が存在する', async () => {
      const configPath = resolve(projectRoot, 'postcss.config.js');
      await readFile(configPath, 'utf-8'); // ファイルが読めることを確認
    });
  });

  test.describe('ESLint設定検証', () => {
    test('eslint.config.js が存在する', async () => {
      const configPath = resolve(projectRoot, 'eslint.config.js');
      const content = await readFile(configPath, 'utf-8');

      expect(content).toContain('defineConfig');
      expect(content).toContain('typescript-eslint');
    });

    test('ESLint設定が React プラグインを含んでいる', async () => {
      const configPath = resolve(projectRoot, 'eslint.config.js');
      const content = await readFile(configPath, 'utf-8');

      expect(content).toContain('react-hooks');
      expect(content).toContain('react-refresh');
    });
  });

  test.describe('Prettier設定検証', () => {
    const prettierRules = [
      { rule: 'semi', expected: true },
      { rule: 'singleQuote', expected: true },
      { rule: 'tabWidth', expected: 2 },
      { rule: 'trailingComma', expected: 'es5' },
      { rule: 'printWidth', expected: 100 },
      { rule: 'arrowParens', expected: 'always' },
    ];

    test('.prettierrc が存在する', async () => {
      const configPath = resolve(projectRoot, '.prettierrc');
      await readFile(configPath, 'utf-8'); // ファイルが読めることを確認
    });

    prettierRules.forEach(({ rule, expected }) => {
      test(`Prettier設定に ${rule}: ${expected} が含まれている`, async () => {
        const configPath = resolve(projectRoot, '.prettierrc');
        const content = await readFile(configPath, 'utf-8');
        const config = JSON.parse(content);

        expect(config[rule]).toBe(expected);
      });
    });
  });

  test.describe('プロジェクト構造検証', () => {
    const requiredFiles = [
      { path: 'index.html', description: 'エントリーポイントHTML' },
      { path: 'src', description: 'ソースコードディレクトリ' },
      { path: 'public', description: '静的ファイルディレクトリ' },
    ];

    requiredFiles.forEach(({ path: filePath, description }) => {
      test(`${filePath} (${description}) が存在する`, async () => {
        const fullPath = resolve(projectRoot, filePath);
        // ファイルまたはディレクトリが存在することを確認
        const stats = await stat(fullPath);
        expect(stats).toBeTruthy();
      });
    });
  });
});
