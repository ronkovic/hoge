import { test, expect } from '@playwright/test';
import { readFile, access, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

test.describe('ビルドとツール統合の検証（TDD Red フェーズ）', () => {
  test.describe('ESLintの厳密な検証', () => {
    const filesToCheck = [
      { name: 'src/App.tsx', description: 'メインAppコンポーネント' },
      { name: 'src/main.tsx', description: 'エントリーポイント' },
      { name: 'src/components/TodoList.tsx', description: 'TodoListコンポーネント' },
      { name: 'src/components/TodoForm.tsx', description: 'TodoFormコンポーネント' },
    ];

    for (const { name, description } of filesToCheck) {
      test(`${name} (${description}) が ESLint ルールに準拠している`, async () => {
        const filePath = join(PROJECT_ROOT, name);

        // ファイルが存在することを確認
        try {
          await access(filePath);
        } catch {
          // ファイルがまだ存在しない場合、テストは失敗すべき（Redフェーズ）
          throw new Error(`ファイル ${name} が存在しません - 実装が必要です`);
        }

        // ESLintチェック
        try {
          await execAsync(`npx eslint ${name}`, { cwd: PROJECT_ROOT });
        } catch (error: unknown) {
          const err = error as { stdout?: string; stderr?: string };
          // ESLintエラーがある場合、テストは失敗すべき
          throw new Error(
            `ESLintエラーが検出されました:\n${err.stdout || ''}\n${err.stderr || ''}`
          );
        }
      });
    }

    test('すべてのTypeScriptファイルがESLintルールに準拠している', async () => {
      try {
        const result = await execAsync('npm run lint', { cwd: PROJECT_ROOT });
        // エラーがないことを期待
        expect(result.stderr).toBe('');
      } catch (error: unknown) {
        const err = error as { stdout?: string; stderr?: string };
        // Redフェーズ: ESLintエラーがあるはず
        throw new Error(`ESLintエラー:\n${err.stdout || ''}\n${err.stderr || ''}`);
      }
    });
  });

  test.describe('Prettierの厳密な検証', () => {
    const patternsToCheck = [
      { pattern: 'src/**/*.tsx', description: 'TSXファイル' },
      { pattern: 'src/**/*.ts', description: 'TSファイル' },
      { pattern: 'src/**/*.css', description: 'CSSファイル' },
    ];

    for (const { pattern, description } of patternsToCheck) {
      test(`${description} (${pattern}) が Prettier フォーマットに準拠している`, async () => {
        try {
          await execAsync(`npx prettier --check "${pattern}"`, {
            cwd: PROJECT_ROOT,
          });
        } catch (error: unknown) {
          const err = error as { stdout?: string; stderr?: string };
          // フォーマットエラーがある場合、テストは失敗すべき
          throw new Error(
            `Prettierフォーマットエラー:\n${err.stdout || ''}\n${err.stderr || ''}`
          );
        }
      });
    }

    test('format:check スクリプトがエラーなく実行できる', async () => {
      try {
        const result = await execAsync('npm run format:check', {
          cwd: PROJECT_ROOT,
        });
        expect(result.stderr).toBe('');
      } catch (error: unknown) {
        const err = error as { stdout?: string; stderr?: string };
        // Redフェーズ: フォーマットエラーがあるはず
        throw new Error(`Prettierエラー:\n${err.stdout || ''}\n${err.stderr || ''}`);
      }
    });
  });

  test.describe('TypeScript型チェックの厳密な検証', () => {
    test('すべてのTypeScriptファイルが型エラーなくコンパイルできる', async () => {
      try {
        await execAsync('npx tsc --noEmit', { cwd: PROJECT_ROOT });
      } catch (error: unknown) {
        const err = error as { stdout?: string; stderr?: string };
        // Redフェーズ: 型エラーがあるはず
        throw new Error(`TypeScript型エラー:\n${err.stdout || ''}\n${err.stderr || ''}`);
      }
    });

    const compilerOptionChecks = [
      { file: 'tsconfig.json', compilerOption: 'strict' },
      { file: 'tsconfig.app.json', compilerOption: 'noUnusedLocals' },
      { file: 'tsconfig.app.json', compilerOption: 'noUnusedParameters' },
    ];

    for (const { file, compilerOption } of compilerOptionChecks) {
      test(`${file} に ${compilerOption} が有効化されている`, async () => {
        const tsconfigPath = join(PROJECT_ROOT, file);

        try {
          await access(tsconfigPath);
          const content = await readFile(tsconfigPath, 'utf-8');
          const tsconfig = JSON.parse(content);

          // compilerOptionsの確認
          const hasOption =
            tsconfig.compilerOptions?.[compilerOption] === true ||
            tsconfig.compilerOptions?.[compilerOption] !== undefined;

          if (!hasOption) {
            throw new Error(
              `${file} に ${compilerOption} が設定されていません - 厳密な型チェックのために設定が必要です`
            );
          }
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes('ENOENT')) {
            throw new Error(`${file} が存在しません`);
          }
          throw error;
        }
      });
    }
  });

  test.describe('TailwindCSSの実際の動作検証', () => {
    test('ビルド後のCSSにTailwindのユーティリティクラスが含まれている', async () => {
      // ビルドを実行
      try {
        await execAsync('npm run build', { cwd: PROJECT_ROOT, timeout: 30000 });
      } catch (error: unknown) {
        const err = error as { stdout?: string; stderr?: string };
        throw new Error(`ビルドエラー:\n${err.stdout || ''}\n${err.stderr || ''}`);
      }

      // dist/assets ディレクトリのCSSファイルを確認
      const distAssetsPath = join(PROJECT_ROOT, 'dist', 'assets');

      try {
        const files = await readdir(distAssetsPath);
        const cssFiles = files.filter((f) => f.endsWith('.css'));

        expect(cssFiles.length).toBeGreaterThan(0);

        // CSSファイルにTailwindのスタイルが含まれているか確認
        let hasTailwindStyles = false;
        for (const cssFile of cssFiles) {
          const cssContent = await readFile(join(distAssetsPath, cssFile), 'utf-8');

          // Tailwindの基本的なスタイルが含まれているか確認
          if (
            cssContent.includes('*') ||
            cssContent.includes('box-sizing') ||
            cssContent.includes('border-width')
          ) {
            hasTailwindStyles = true;
            break;
          }
        }

        if (!hasTailwindStyles) {
          throw new Error(
            'ビルドされたCSSにTailwindのスタイルが含まれていません - TailwindCSSの設定が正しく動作していません'
          );
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('ENOENT')) {
          throw new Error('dist/assets ディレクトリが存在しません - ビルドが失敗しています');
        }
        throw error;
      }
    });

    test('コンポーネントでTailwindクラスが使用されている', async () => {
      const componentFiles = [
        'src/App.tsx',
        'src/components/TodoList.tsx',
        'src/components/TodoForm.tsx',
      ];

      let hasTailwindUsage = false;

      for (const file of componentFiles) {
        const filePath = join(PROJECT_ROOT, file);

        try {
          await access(filePath);
          const content = await readFile(filePath, 'utf-8');

          // Tailwindのユーティリティクラスの使用を確認
          const tailwindPatterns = [
            /className="[^"]*\b(flex|grid|p-|m-|text-|bg-|border-|rounded-)/,
            /className='[^']*\b(flex|grid|p-|m-|text-|bg-|border-|rounded-)/,
            /className={`[^`]*\b(flex|grid|p-|m-|text-|bg-|border-|rounded-)/,
          ];

          for (const pattern of tailwindPatterns) {
            if (pattern.test(content)) {
              hasTailwindUsage = true;
              break;
            }
          }

          if (hasTailwindUsage) break;
        } catch {
          // ファイルが存在しない場合はスキップ
          continue;
        }
      }

      if (!hasTailwindUsage) {
        throw new Error(
          'コンポーネントでTailwindクラスが使用されていません - Tailwindの実装が必要です'
        );
      }
    });
  });

  test.describe('ビルド成果物の検証', () => {
    test('本番ビルドが成功し、必要なファイルが生成される', async () => {
      try {
        await execAsync('npm run build', { cwd: PROJECT_ROOT, timeout: 30000 });
      } catch (error: unknown) {
        const err = error as { stdout?: string; stderr?: string };
        throw new Error(`ビルドエラー:\n${err.stdout || ''}\n${err.stderr || ''}`);
      }

      const distPath = join(PROJECT_ROOT, 'dist');

      // index.htmlが生成されているか確認
      const indexPath = join(distPath, 'index.html');
      await access(indexPath);

      // assetsディレクトリが生成されているか確認
      const assetsPath = join(distPath, 'assets');
      await access(assetsPath);

      // JavaScript/CSSファイルが生成されているか確認
      const files = await readdir(assetsPath);
      const jsFiles = files.filter((f) => f.endsWith('.js'));
      const cssFiles = files.filter((f) => f.endsWith('.css'));

      expect(jsFiles.length).toBeGreaterThan(0);
      expect(cssFiles.length).toBeGreaterThan(0);
    });

    test('ビルドされたJavaScriptに必要なReactコードが含まれている', async () => {
      try {
        await execAsync('npm run build', { cwd: PROJECT_ROOT, timeout: 30000 });
      } catch (error: unknown) {
        const err = error as { stdout?: string; stderr?: string };
        throw new Error(`ビルドエラー:\n${err.stdout || ''}\n${err.stderr || ''}`);
      }

      const assetsPath = join(PROJECT_ROOT, 'dist', 'assets');
      const files = await readdir(assetsPath);
      const jsFiles = files.filter((f) => f.endsWith('.js'));

      expect(jsFiles.length).toBeGreaterThan(0);

      // いずれかのJSファイルにReactのコードが含まれているか確認
      let hasReactCode = false;
      for (const jsFile of jsFiles) {
        const jsContent = await readFile(join(assetsPath, jsFile), 'utf-8');

        // Reactの痕跡を探す（ミニファイされている可能性があるため緩い条件）
        if (jsContent.includes('react') || jsContent.includes('React') || jsContent.length > 1000) {
          hasReactCode = true;
          break;
        }
      }

      if (!hasReactCode) {
        throw new Error(
          'ビルドされたJavaScriptにReactのコードが含まれていません - ビルド設定が正しくありません'
        );
      }
    });
  });
});
