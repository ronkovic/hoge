import { test, expect } from '@playwright/test';

test.describe('共通コンポーネント - Button', () => {
  test.beforeEach(async ({ page }) => {
    // テスト用のページを開く（実装後のルートを想定）
    await page.goto('/');
  });

  test('デフォルトのボタンが表示される', async ({ page }) => {
    const button = page.getByTestId('button-default');
    await expect(button).toBeVisible();
  });

  test('プライマリボタンが表示される', async ({ page }) => {
    const button = page.getByTestId('button-primary');
    await expect(button).toBeVisible();
  });

  test('セカンダリボタンが表示される', async ({ page }) => {
    const button = page.getByTestId('button-secondary');
    await expect(button).toBeVisible();
  });

  test('危険操作ボタンが表示される', async ({ page }) => {
    const button = page.getByTestId('button-danger');
    await expect(button).toBeVisible();
  });

  test('無効状態のボタンはクリックできない', async ({ page }) => {
    const button = page.getByTestId('button-disabled');
    await expect(button).toBeDisabled();
  });

  test('ボタンをクリックするとイベントが発火する', async ({ page }) => {
    const button = page.getByTestId('button-clickable');
    await button.click();
    // クリック後の状態変化を確認（実装後に追加）
    const result = page.getByTestId('click-result');
    await expect(result).toHaveText('Clicked');
  });
});

test.describe('共通コンポーネント - Input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('テキスト入力フィールドが表示される', async ({ page }) => {
    const input = page.getByTestId('input-text');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'text');
  });

  test('パスワード入力フィールドが表示される', async ({ page }) => {
    const input = page.getByTestId('input-password');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'password');
  });

  test('メール入力フィールドが表示される', async ({ page }) => {
    const input = page.getByTestId('input-email');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'email');
  });

  test('入力値が正しく反映される', async ({ page }) => {
    const input = page.getByTestId('input-text');
    await input.fill('Hello World');
    await expect(input).toHaveValue('Hello World');
  });

  test('エラーメッセージが表示される', async ({ page }) => {
    const error = page.getByTestId('input-error-message');
    await expect(error).toBeVisible();
    await expect(error).toContainText('This field is required');
  });

  test('無効状態の入力フィールドは入力できない', async ({ page }) => {
    const input = page.getByTestId('input-disabled');
    await expect(input).toBeDisabled();
  });

  test('ラベル付き入力フィールドが表示される', async ({ page }) => {
    const label = page.getByText('Username');
    await expect(label).toBeVisible();
    const input = page.getByTestId('input-with-label');
    await expect(input).toBeVisible();
  });
});

test.describe('共通コンポーネント - Card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('デフォルトのカードが表示される', async ({ page }) => {
    const card = page.getByTestId('card-default');
    await expect(card).toBeVisible();
  });

  test('タイトル付きカードが表示される', async ({ page }) => {
    const card = page.getByTestId('card-with-title');
    await expect(card).toBeVisible();
    const title = card.getByText('Card Title');
    await expect(title).toBeVisible();
  });

  test('フッター付きカードが表示される', async ({ page }) => {
    const card = page.getByTestId('card-with-footer');
    await expect(card).toBeVisible();
    const footer = card.getByText('Card footer');
    await expect(footer).toBeVisible();
  });

  test('プライマリバリアントのカードが表示される', async ({ page }) => {
    const card = page.getByTestId('card-primary');
    await expect(card).toBeVisible();
  });

  test('セカンダリバリアントのカードが表示される', async ({ page }) => {
    const card = page.getByTestId('card-secondary');
    await expect(card).toBeVisible();
  });

  test('ホバーエフェクト付きカードが表示される', async ({ page }) => {
    const card = page.getByTestId('card-hoverable');
    await expect(card).toBeVisible();
    // ホバー時のスタイル変化を確認（実装後に追加）
    await card.hover();
  });
});

test.describe('共通コンポーネント - Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ヘッダーが表示される', async ({ page }) => {
    const header = page.getByTestId('header');
    await expect(header).toBeVisible();
  });

  test('ヘッダータイトルが表示される', async ({ page }) => {
    const header = page.getByTestId('header');
    const title = header.getByText('My App');
    await expect(title).toBeVisible();
  });

  test('サブタイトルが表示される', async ({ page }) => {
    const header = page.getByTestId('header');
    const subtitle = header.getByText('Welcome back');
    await expect(subtitle).toBeVisible();
  });

  test('ナビゲーションリンクが表示される', async ({ page }) => {
    const homeLink = page.getByTestId('nav-link-home');
    await expect(homeLink).toBeVisible();

    const aboutLink = page.getByTestId('nav-link-about');
    await expect(aboutLink).toBeVisible();

    const contactLink = page.getByTestId('nav-link-contact');
    await expect(contactLink).toBeVisible();
  });

  test('ユーザー情報が表示される', async ({ page }) => {
    const userMenu = page.getByTestId('user-menu');
    await expect(userMenu).toBeVisible();
    const userName = userMenu.getByText('John Doe');
    await expect(userName).toBeVisible();
  });

  test('ログアウトボタンが表示され、クリックできる', async ({ page }) => {
    const logoutButton = page.getByTestId('logout-button');
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    // ログアウト後の状態を確認（実装後に追加）
  });
});

test.describe('共通コンポーネント - Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('フッターが表示される', async ({ page }) => {
    const footer = page.getByTestId('footer');
    await expect(footer).toBeVisible();
  });

  test('著作権表示が表示される', async ({ page }) => {
    const footer = page.getByTestId('footer');
    const copyright = footer.getByText('© 2026 My App');
    await expect(copyright).toBeVisible();
  });

  test('フッターリンクが表示される', async ({ page }) => {
    const termsLink = page.getByTestId('footer-link-terms');
    await expect(termsLink).toBeVisible();

    const privacyLink = page.getByTestId('footer-link-privacy');
    await expect(privacyLink).toBeVisible();

    const contactLink = page.getByTestId('footer-link-contact');
    await expect(contactLink).toBeVisible();
  });

  test('ソーシャルメディアリンクが表示される', async ({ page }) => {
    const twitterLink = page.getByTestId('social-link-twitter');
    await expect(twitterLink).toBeVisible();
    await expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/app');

    const githubLink = page.getByTestId('social-link-github');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/app');

    const linkedinLink = page.getByTestId('social-link-linkedin');
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/app');
  });

  test('ダークバリアントのフッターが表示される', async ({ page }) => {
    const footer = page.getByTestId('footer-dark');
    await expect(footer).toBeVisible();
  });

  test('ライトバリアントのフッターが表示される', async ({ page }) => {
    const footer = page.getByTestId('footer-light');
    await expect(footer).toBeVisible();
  });
});
