import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * Docker Compose環境の統合テスト
 *
 * このテストは以下を検証します:
 * 1. docker-compose.ymlファイルが存在する
 * 2. postgres, backend, frontendサービスが定義されている
 * 3. Docker Composeで全サービスが起動できる
 * 4. 各サービスがヘルスチェックをパスする
 * 5. フロントエンドとバックエンドが通信できる
 */

test.describe('Docker Compose Environment', () => {
  test.describe.configure({ mode: 'serial' });

  // テストケース1: docker-compose.ymlファイルの存在確認
  test('docker-compose.yml file should exist', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const dockerComposePath = path.resolve(process.cwd(), '../../docker-compose.yml');
    const fileExists = fs.existsSync(dockerComposePath);

    expect(fileExists).toBe(true);
  });

  // テストケース2: docker-compose.ymlに必要なサービスが定義されている
  test('docker-compose.yml should define postgres, backend, and frontend services', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const yaml = await import('yaml');

    const dockerComposePath = path.resolve(process.cwd(), '../../docker-compose.yml');
    const content = fs.readFileSync(dockerComposePath, 'utf-8');
    const config = yaml.parse(content);

    expect(config.services).toBeDefined();
    expect(config.services.postgres).toBeDefined();
    expect(config.services.backend).toBeDefined();
    expect(config.services.frontend).toBeDefined();
  });

  // テストケース3: PostgreSQLサービスの設定確認
  test('postgres service should be configured correctly', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const yaml = await import('yaml');

    const dockerComposePath = path.resolve(process.cwd(), '../../docker-compose.yml');
    const content = fs.readFileSync(dockerComposePath, 'utf-8');
    const config = yaml.parse(content);

    const postgres = config.services.postgres;

    // PostgreSQL公式イメージを使用
    expect(postgres.image).toContain('postgres');

    // 環境変数の設定
    expect(postgres.environment).toBeDefined();
    expect(postgres.environment.POSTGRES_DB).toBeDefined();
    expect(postgres.environment.POSTGRES_USER).toBeDefined();
    expect(postgres.environment.POSTGRES_PASSWORD).toBeDefined();

    // ポートマッピング
    expect(postgres.ports).toBeDefined();
    expect(postgres.ports.some((p: string) => p.includes('5432'))).toBe(true);

    // ボリューム設定
    expect(postgres.volumes).toBeDefined();
  });

  // テストケース4: Backendサービスの設定確認
  test('backend service should be configured correctly', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const yaml = await import('yaml');

    const dockerComposePath = path.resolve(process.cwd(), '../../docker-compose.yml');
    const content = fs.readFileSync(dockerComposePath, 'utf-8');
    const config = yaml.parse(content);

    const backend = config.services.backend;

    // ビルド設定
    expect(backend.build).toBeDefined();
    expect(backend.build.context).toBe('./backend');
    expect(backend.build.dockerfile).toBe('Dockerfile');

    // ポートマッピング (3000番ポート)
    expect(backend.ports).toBeDefined();
    expect(backend.ports.some((p: string) => p.includes('3000'))).toBe(true);

    // 環境変数の設定
    expect(backend.environment).toBeDefined();

    // PostgreSQLへの依存関係
    expect(backend.depends_on).toBeDefined();
    expect(backend.depends_on).toContain('postgres');
  });

  // テストケース5: Frontendサービスの設定確認
  test('frontend service should be configured correctly', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const yaml = await import('yaml');

    const dockerComposePath = path.resolve(process.cwd(), '../../docker-compose.yml');
    const content = fs.readFileSync(dockerComposePath, 'utf-8');
    const config = yaml.parse(content);

    const frontend = config.services.frontend;

    // ビルド設定
    expect(frontend.build).toBeDefined();
    expect(frontend.build.context).toBe('./frontend');
    expect(frontend.build.dockerfile).toBe('Dockerfile');

    // ポートマッピング (5173番ポート)
    expect(frontend.ports).toBeDefined();
    expect(frontend.ports.some((p: string) => p.includes('5173'))).toBe(true);

    // Backendへの依存関係
    expect(frontend.depends_on).toBeDefined();
    expect(frontend.depends_on).toContain('backend');
  });

  // テストケース6: Backend Dockerfileの存在確認
  test('backend/Dockerfile should exist', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const dockerfilePath = path.resolve(process.cwd(), '../../backend/Dockerfile');
    const fileExists = fs.existsSync(dockerfilePath);

    expect(fileExists).toBe(true);
  });

  // テストケース7: Backend Dockerfileのマルチステージビルド確認
  test('backend/Dockerfile should use multi-stage build', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const dockerfilePath = path.resolve(process.cwd(), '../../backend/Dockerfile');
    const content = fs.readFileSync(dockerfilePath, 'utf-8');

    // ビルドステージとプロダクションステージの存在確認
    expect(content).toContain('FROM node:');
    expect(content).toContain('AS builder');
    expect(content).toContain('AS production');
  });

  // テストケース8: Frontend Dockerfileの存在確認
  test('frontend/Dockerfile should exist', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const dockerfilePath = path.resolve(process.cwd(), '../../frontend/Dockerfile');
    const fileExists = fs.existsSync(dockerfilePath);

    expect(fileExists).toBe(true);
  });

  // テストケース9: Frontend Dockerfileのマルチステージビルド確認
  test('frontend/Dockerfile should use multi-stage build', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const dockerfilePath = path.resolve(process.cwd(), '../../frontend/Dockerfile');
    const content = fs.readFileSync(dockerfilePath, 'utf-8');

    // ビルドステージとプロダクションステージの存在確認
    expect(content).toContain('FROM node:');
    expect(content).toContain('AS builder');
    expect(content).toContain('FROM nginx:');
  });

  // テストケース10: Docker Composeでサービスが起動できる
  test('should be able to start all services with docker-compose', async () => {
    const path = await import('path');
    const rootDir = path.resolve(process.cwd(), '../..');

    try {
      // Docker Composeでサービスを起動
      execSync('docker-compose up -d', {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 120000,
      });

      // 起動成功を期待
      expect(true).toBe(true);
    } catch (error: any) {
      // エラーメッセージを表示
      console.error('Docker Compose起動エラー:', error.message);
      throw error;
    }
  }, 120000);

  // テストケース11: PostgreSQLコンテナが起動している
  test('postgres container should be running', async () => {
    const path = await import('path');
    const rootDir = path.resolve(process.cwd(), '../..');

    try {
      const output = execSync('docker-compose ps postgres', {
        cwd: rootDir,
        encoding: 'utf-8',
      });

      expect(output).toContain('postgres');
      expect(output).toContain('Up') || expect(output).toContain('running');
    } catch (error: any) {
      console.error('PostgreSQLコンテナステータス確認エラー:', error.message);
      throw error;
    }
  });

  // テストケース12: Backendコンテナが起動している
  test('backend container should be running', async () => {
    const path = await import('path');
    const rootDir = path.resolve(process.cwd(), '../..');

    try {
      const output = execSync('docker-compose ps backend', {
        cwd: rootDir,
        encoding: 'utf-8',
      });

      expect(output).toContain('backend');
      expect(output).toContain('Up') || expect(output).toContain('running');
    } catch (error: any) {
      console.error('Backendコンテナステータス確認エラー:', error.message);
      throw error;
    }
  });

  // テストケース13: Frontendコンテナが起動している
  test('frontend container should be running', async () => {
    const path = await import('path');
    const rootDir = path.resolve(process.cwd(), '../..');

    try {
      const output = execSync('docker-compose ps frontend', {
        cwd: rootDir,
        encoding: 'utf-8',
      });

      expect(output).toContain('frontend');
      expect(output).toContain('Up') || expect(output).toContain('running');
    } catch (error: any) {
      console.error('Frontendコンテナステータス確認エラー:', error.message);
      throw error;
    }
  });

  // テストケース14: Backendがヘルスチェックをパスする
  test('backend should respond to health check', async ({ request }) => {
    // サービス起動を待つ
    await new Promise(resolve => setTimeout(resolve, 10000));

    try {
      const response = await request.get('http://localhost:3000/api/todos');
      expect(response.status()).toBe(200);
    } catch (error: any) {
      console.error('Backendヘルスチェックエラー:', error.message);
      throw error;
    }
  });

  // テストケース15: Frontendがヘルスチェックをパスする
  test('frontend should respond to health check', async ({ page }) => {
    // サービス起動を待つ
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // ページタイトルが存在することを確認
      const title = await page.title();
      expect(title).toBeTruthy();
    } catch (error: any) {
      console.error('Frontendヘルスチェックエラー:', error.message);
      throw error;
    }
  });

  // テストケース16: FrontendからBackendへの通信が成功する
  test('frontend should be able to communicate with backend', async ({ page }) => {
    try {
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // APIリクエストが成功することを確認
      const response = await page.evaluate(async () => {
        const res = await fetch('http://localhost:3000/api/todos');
        return res.status;
      });

      expect(response).toBe(200);
    } catch (error: any) {
      console.error('Frontend-Backend通信エラー:', error.message);
      throw error;
    }
  });

  // テスト終了後のクリーンアップ
  test.afterAll(async () => {
    const path = await import('path');
    const rootDir = path.resolve(process.cwd(), '../..');

    try {
      // Docker Composeでサービスを停止
      execSync('docker-compose down -v', {
        cwd: rootDir,
        stdio: 'inherit',
        timeout: 60000,
      });
    } catch (error: any) {
      console.error('Docker Composeクリーンアップエラー:', error.message);
    }
  });
});
