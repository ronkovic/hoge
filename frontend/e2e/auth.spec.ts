import { test, expect } from '@playwright/test';

test.describe('認証機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('LoginForm コンポーネント', () => {
    test('ログインフォームが表示される', async ({ page }) => {
      // ログインフォームへのナビゲーション（実装前のため失敗する）
      const loginLink = page.locator('[data-testid="login-link"]');
      await expect(loginLink).toBeVisible();
      await loginLink.click();

      // ログインフォームの表示確認
      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toBeVisible();
    });

    test('メールアドレス入力フィールドが表示される', async ({ page }) => {
      // ログインページに移動
      const loginLink = page.locator('[data-testid="login-link"]');
      await loginLink.click();

      // メールアドレス入力フィールドの確認
      const emailInput = page.locator('[data-testid="login-email"]');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(emailInput).toHaveAttribute('placeholder', /メールアドレス|email/i);
    });

    test('パスワード入力フィールドが表示される', async ({ page }) => {
      // ログインページに移動
      const loginLink = page.locator('[data-testid="login-link"]');
      await loginLink.click();

      // パスワード入力フィールドの確認
      const passwordInput = page.locator('[data-testid="login-password"]');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(passwordInput).toHaveAttribute('placeholder', /パスワード|password/i);
    });

    test('ログインボタンが表示される', async ({ page }) => {
      // ログインページに移動
      const loginLink = page.locator('[data-testid="login-link"]');
      await loginLink.click();

      // ログインボタンの確認
      const loginButton = page.locator('[data-testid="login-submit"]');
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toHaveText(/ログイン|Login/i);
    });

    test('空のフォーム送信時にバリデーションエラーが表示される', async ({ page }) => {
      // ログインページに移動
      const loginLink = page.locator('[data-testid="login-link"]');
      await loginLink.click();

      // 空のまま送信
      const loginButton = page.locator('[data-testid="login-submit"]');
      await loginButton.click();

      // エラーメッセージの確認
      const errorMessage = page.locator('[data-testid="login-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/必須|required/i);
    });

    test('無効なメールアドレス形式でエラーが表示される', async ({ page }) => {
      // ログインページに移動
      const loginLink = page.locator('[data-testid="login-link"]');
      await loginLink.click();

      // 無効なメールアドレスを入力
      const emailInput = page.locator('[data-testid="login-email"]');
      const passwordInput = page.locator('[data-testid="login-password"]');
      const loginButton = page.locator('[data-testid="login-submit"]');

      await emailInput.fill('invalid-email');
      await passwordInput.fill('password123');
      await loginButton.click();

      // エラーメッセージの確認
      const errorMessage = page.locator('[data-testid="login-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/メールアドレス|email/i);
    });

    test('正しいメールアドレスとパスワードでログインできる', async ({ page }) => {
      // ログインページに移動
      const loginLink = page.locator('[data-testid="login-link"]');
      await loginLink.click();

      // 有効な認証情報を入力
      const emailInput = page.locator('[data-testid="login-email"]');
      const passwordInput = page.locator('[data-testid="login-password"]');
      const loginButton = page.locator('[data-testid="login-submit"]');

      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();

      // ログイン成功後、ダッシュボードに遷移することを確認
      await expect(page).toHaveURL(/dashboard|home/i);

      // ログイン後のユーザー情報が表示されることを確認
      const userInfo = page.locator('[data-testid="user-info"]');
      await expect(userInfo).toBeVisible();
    });

    test('間違った認証情報でログインエラーが表示される', async ({ page }) => {
      // ログインページに移動
      const loginLink = page.locator('[data-testid="login-link"]');
      await loginLink.click();

      // 無効な認証情報を入力
      const emailInput = page.locator('[data-testid="login-email"]');
      const passwordInput = page.locator('[data-testid="login-password"]');
      const loginButton = page.locator('[data-testid="login-submit"]');

      await emailInput.fill('wrong@example.com');
      await passwordInput.fill('wrongpassword');
      await loginButton.click();

      // エラーメッセージの確認
      const errorMessage = page.locator('[data-testid="login-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/失敗|認証エラー|authentication failed/i);
    });

    test('パスワードの表示/非表示切り替えができる', async ({ page }) => {
      // ログインページに移動
      const loginLink = page.locator('[data-testid="login-link"]');
      await loginLink.click();

      // パスワード入力フィールドとトグルボタン
      const passwordInput = page.locator('[data-testid="login-password"]');
      const toggleButton = page.locator('[data-testid="password-toggle"]');

      // 初期状態はパスワードが隠れている
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // トグルボタンをクリック
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // 再度トグルボタンをクリック
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('RegisterForm コンポーネント', () => {
    test('会員登録フォームが表示される', async ({ page }) => {
      // 会員登録フォームへのナビゲーション（実装前のため失敗する）
      const registerLink = page.locator('[data-testid="register-link"]');
      await expect(registerLink).toBeVisible();
      await registerLink.click();

      // 会員登録フォームの表示確認
      const registerForm = page.locator('[data-testid="register-form"]');
      await expect(registerForm).toBeVisible();
    });

    test('ユーザー名入力フィールドが表示される', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // ユーザー名入力フィールドの確認
      const usernameInput = page.locator('[data-testid="register-username"]');
      await expect(usernameInput).toBeVisible();
      await expect(usernameInput).toHaveAttribute('type', 'text');
      await expect(usernameInput).toHaveAttribute('placeholder', /ユーザー名|username/i);
    });

    test('メールアドレス入力フィールドが表示される', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // メールアドレス入力フィールドの確認
      const emailInput = page.locator('[data-testid="register-email"]');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(emailInput).toHaveAttribute('placeholder', /メールアドレス|email/i);
    });

    test('パスワード入力フィールドが表示される', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // パスワード入力フィールドの確認
      const passwordInput = page.locator('[data-testid="register-password"]');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(passwordInput).toHaveAttribute('placeholder', /パスワード|password/i);
    });

    test('パスワード確認入力フィールドが表示される', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // パスワード確認入力フィールドの確認
      const passwordConfirmInput = page.locator('[data-testid="register-password-confirm"]');
      await expect(passwordConfirmInput).toBeVisible();
      await expect(passwordConfirmInput).toHaveAttribute('type', 'password');
      await expect(passwordConfirmInput).toHaveAttribute('placeholder', /パスワード.*確認|confirm password/i);
    });

    test('登録ボタンが表示される', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // 登録ボタンの確認
      const registerButton = page.locator('[data-testid="register-submit"]');
      await expect(registerButton).toBeVisible();
      await expect(registerButton).toHaveText(/登録|register|sign up/i);
    });

    test('空のフォーム送信時にバリデーションエラーが表示される', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // 空のまま送信
      const registerButton = page.locator('[data-testid="register-submit"]');
      await registerButton.click();

      // エラーメッセージの確認
      const errorMessage = page.locator('[data-testid="register-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/必須|required/i);
    });

    test('パスワードが一致しない場合エラーが表示される', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // 一致しないパスワードを入力
      const usernameInput = page.locator('[data-testid="register-username"]');
      const emailInput = page.locator('[data-testid="register-email"]');
      const passwordInput = page.locator('[data-testid="register-password"]');
      const passwordConfirmInput = page.locator('[data-testid="register-password-confirm"]');
      const registerButton = page.locator('[data-testid="register-submit"]');

      await usernameInput.fill('testuser');
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await passwordConfirmInput.fill('password456');
      await registerButton.click();

      // エラーメッセージの確認
      const errorMessage = page.locator('[data-testid="register-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/一致|match/i);
    });

    test('パスワードが短すぎる場合エラーが表示される', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // 短いパスワードを入力
      const usernameInput = page.locator('[data-testid="register-username"]');
      const emailInput = page.locator('[data-testid="register-email"]');
      const passwordInput = page.locator('[data-testid="register-password"]');
      const passwordConfirmInput = page.locator('[data-testid="register-password-confirm"]');
      const registerButton = page.locator('[data-testid="register-submit"]');

      await usernameInput.fill('testuser');
      await emailInput.fill('test@example.com');
      await passwordInput.fill('123');
      await passwordConfirmInput.fill('123');
      await registerButton.click();

      // エラーメッセージの確認
      const errorMessage = page.locator('[data-testid="register-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/文字以上|characters/i);
    });

    test('無効なメールアドレス形式でエラーが表示される', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // 無効なメールアドレスを入力
      const usernameInput = page.locator('[data-testid="register-username"]');
      const emailInput = page.locator('[data-testid="register-email"]');
      const passwordInput = page.locator('[data-testid="register-password"]');
      const passwordConfirmInput = page.locator('[data-testid="register-password-confirm"]');
      const registerButton = page.locator('[data-testid="register-submit"]');

      await usernameInput.fill('testuser');
      await emailInput.fill('invalid-email');
      await passwordInput.fill('password123');
      await passwordConfirmInput.fill('password123');
      await registerButton.click();

      // エラーメッセージの確認
      const errorMessage = page.locator('[data-testid="register-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/メールアドレス|email/i);
    });

    test('正しい情報で会員登録できる', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // 有効な情報を入力
      const usernameInput = page.locator('[data-testid="register-username"]');
      const emailInput = page.locator('[data-testid="register-email"]');
      const passwordInput = page.locator('[data-testid="register-password"]');
      const passwordConfirmInput = page.locator('[data-testid="register-password-confirm"]');
      const registerButton = page.locator('[data-testid="register-submit"]');

      await usernameInput.fill('newuser');
      await emailInput.fill('newuser@example.com');
      await passwordInput.fill('password123');
      await passwordConfirmInput.fill('password123');
      await registerButton.click();

      // 登録成功後、ログインページまたはダッシュボードに遷移することを確認
      await expect(page).toHaveURL(/login|dashboard|home/i);

      // 成功メッセージまたはログイン状態の確認
      const successMessage = page.locator('[data-testid="register-success"]');
      await expect(successMessage).toBeVisible();
    });

    test('既に登録済みのメールアドレスでエラーが表示される', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // 既存のメールアドレスを入力
      const usernameInput = page.locator('[data-testid="register-username"]');
      const emailInput = page.locator('[data-testid="register-email"]');
      const passwordInput = page.locator('[data-testid="register-password"]');
      const passwordConfirmInput = page.locator('[data-testid="register-password-confirm"]');
      const registerButton = page.locator('[data-testid="register-submit"]');

      await usernameInput.fill('existinguser');
      await emailInput.fill('existing@example.com');
      await passwordInput.fill('password123');
      await passwordConfirmInput.fill('password123');
      await registerButton.click();

      // エラーメッセージの確認
      const errorMessage = page.locator('[data-testid="register-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/登録済み|already exists|registered/i);
    });

    test('パスワードの表示/非表示切り替えができる', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // パスワード入力フィールドとトグルボタン
      const passwordInput = page.locator('[data-testid="register-password"]');
      const toggleButton = page.locator('[data-testid="password-toggle"]');

      // 初期状態はパスワードが隠れている
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // トグルボタンをクリック
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // 再度トグルボタンをクリック
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('認証フロー統合', () => {
    test('ログインページから会員登録ページへのリンクが機能する', async ({ page }) => {
      // ログインページに移動
      const loginLink = page.locator('[data-testid="login-link"]');
      await loginLink.click();

      // 会員登録リンクをクリック
      const toRegisterLink = page.locator('[data-testid="to-register-link"]');
      await expect(toRegisterLink).toBeVisible();
      await toRegisterLink.click();

      // 会員登録フォームが表示されることを確認
      const registerForm = page.locator('[data-testid="register-form"]');
      await expect(registerForm).toBeVisible();
    });

    test('会員登録ページからログインページへのリンクが機能する', async ({ page }) => {
      // 会員登録ページに移動
      const registerLink = page.locator('[data-testid="register-link"]');
      await registerLink.click();

      // ログインリンクをクリック
      const toLoginLink = page.locator('[data-testid="to-login-link"]');
      await expect(toLoginLink).toBeVisible();
      await toLoginLink.click();

      // ログインフォームが表示されることを確認
      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toBeVisible();
    });
  });
});
