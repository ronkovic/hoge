import { defineConfig } from '@playwright/test';

/**
 * セットアップ検証専用のPlaywright設定
 * webServerなしでファイルシステムベースのテストのみ実行
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: [
    '**/config-validation.spec.ts',
    '**/project-setup.spec.ts',
    '**/build-integration.spec.ts',
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  // webServerなし - ファイルシステム検証のみ
});
