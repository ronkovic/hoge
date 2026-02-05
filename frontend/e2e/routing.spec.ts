import { test, expect } from '@playwright/test';

test.describe('React Router設定とページルーティング', () => {
  // 基本ルーティングのテスト
  test('ログインページ(/)にアクセスできる', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('Todoリストページ(/todos)にアクセスできる', async ({ page }) => {
    await page.goto('/todos');
    await expect(page.locator('[data-testid="todos-page"]')).toBeVisible();
  });

  test('Dashboardページ(/dashboard)にアクセスできる', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
  });

  test('存在しないルート(/invalid)は404ページを表示する', async ({ page }) => {
    await page.goto('/invalid');
    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
  });

  // ナビゲーションリンクのテスト
  test('ナビゲーションリンクが正しく動作する', async ({ page }) => {
    await page.goto('/');

    // Todosリンクをクリック
    await page.click('[data-testid="nav-link-todos"]');
    await expect(page).toHaveURL(/.*\/todos/);

    // Dashboardリンクをクリック
    await page.click('[data-testid="nav-link-dashboard"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Homeリンクをクリック
    await page.click('[data-testid="nav-link-home"]');
    await expect(page).toHaveURL('/');
  });

  // ProtectedRouteコンポーネントのテスト
  test.describe('ProtectedRoute: 認証保護', () => {
    test('未認証時はProtectedRouteにアクセスできず、ログインページにリダイレクトされる', async ({ page }) => {
      // localStorageをクリアして未認証状態にする
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());

      // 保護されたルートにアクセス
      await page.goto('/dashboard');

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL('/');
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test('認証済みユーザーはProtectedRouteにアクセスできる', async ({ page }) => {
      // 認証トークンをlocalStorageに設定
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('authToken', 'test-token-12345');
      });

      // 保護されたルートにアクセス
      await page.goto('/dashboard');

      // Dashboardページが表示されることを確認
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    });

    test('Todosページも認証が必要で、未認証時はリダイレクトされる', async ({ page }) => {
      // localStorageをクリアして未認証状態にする
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());

      // 保護されたルートにアクセス
      await page.goto('/todos');

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL('/');
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    });

    test('ログイン後、元のURLにリダイレクトされる', async ({ page }) => {
      // 未認証状態で保護されたルートにアクセス
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.goto('/dashboard');

      // ログインページにリダイレクトされる
      await expect(page).toHaveURL('/');

      // ログインフォームに入力してログイン
      await page.fill('[data-testid="login-username"]', 'testuser');
      await page.fill('[data-testid="login-password"]', 'password123');
      await page.click('[data-testid="login-submit"]');

      // 元のURL(/dashboard)にリダイレクトされることを確認
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    });

    test('ログアウトボタンをクリックすると、認証が解除されログインページにリダイレクトされる', async ({ page }) => {
      // 認証状態でDashboardページにアクセス
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('authToken', 'test-token-12345');
      });
      await page.goto('/dashboard');

      // ログアウトボタンをクリック
      await page.click('[data-testid="logout-button"]');

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL('/');
      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();

      // 再度保護されたルートにアクセスしようとするとリダイレクトされる
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/');
    });
  });

  // ページコンポーネントの基本構造テスト
  test.describe('ページコンポーネントの基本構造', () => {
    test('ログインページに必要な要素が存在する', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-username"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-password"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
    });

    test('Dashboardページに必要な要素が存在する', async ({ page }) => {
      // 認証状態でアクセス
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('authToken', 'test-token-12345');
      });
      await page.goto('/dashboard');

      await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
    });

    test('Todosページに既存のTodo機能が統合されている', async ({ page }) => {
      // 認証状態でアクセス
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('authToken', 'test-token-12345');
      });
      await page.goto('/todos');

      await expect(page.locator('[data-testid="todos-page"]')).toBeVisible();
      // 既存のTodoコンポーネントが表示されていることを確認
      await expect(page.locator('[data-testid="todo-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="todo-input"]')).toBeVisible();
    });
  });
});
