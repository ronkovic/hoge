import { test, expect } from '@playwright/test';

const POST_ITEMS = [
  {
    title: 'テスト記事1',
    author: '著者1',
    content: 'これはテスト記事1の本文です。',
  },
  {
    title: 'テスト記事2',
    author: '著者2',
    content: 'これはテスト記事2の本文です。',
  },
  {
    title: 'テスト記事3',
    author: '著者3',
    content: 'これはテスト記事3の本文です。',
  },
];

test.describe('Post アプリケーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Post一覧表示機能', () => {
    test('初期状態でPostリストが表示される', async ({ page }) => {
      // Post一覧が表示されることを確認
      const postList = page.locator('[data-testid="post-list"]');
      await expect(postList).toBeVisible();
    });

    test('バックエンドAPIからPostを取得して表示する', async ({ page }) => {
      // APIから取得したPostが表示されることを確認
      // ※ 実装前なので、このテストは失敗する
      const postItems = page.locator('[data-testid="post-card"]');
      await expect(postItems).toHaveCount(0); // 初期状態では0件
    });

    test('各PostにタイトルとIDと著者と作成日時と本文が表示される', async ({ page }) => {
      // まずPostを追加
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');

      await titleInput.fill('テスト記事');
      await authorInput.fill('テスト著者');
      await contentInput.fill('テスト本文です。');
      await submitButton.click();

      const firstItem = page.locator('[data-testid="post-card"]').first();
      await expect(firstItem.locator('[data-testid="post-id"]')).toBeVisible();
      await expect(firstItem.locator('[data-testid="post-title"]')).toBeVisible();
      await expect(firstItem.locator('[data-testid="post-author"]')).toBeVisible();
      await expect(firstItem.locator('[data-testid="post-created-at"]')).toBeVisible();
      await expect(firstItem.locator('[data-testid="post-content"]')).toBeVisible();
    });

    test('記事が0件の場合は「記事がありません」と表示される', async ({ page }) => {
      // 初期状態で記事がない場合のメッセージを確認
      const emptyMessage = page.locator('[data-testid="post-list-empty"]');
      await expect(emptyMessage).toBeVisible();
      await expect(emptyMessage).toContainText('記事がありません');
    });
  });

  test.describe('Post投稿フォーム機能', () => {
    test('新規Post入力フォームが表示される', async ({ page }) => {
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');

      await expect(titleInput).toBeVisible();
      await expect(authorInput).toBeVisible();
      await expect(contentInput).toBeVisible();
      await expect(submitButton).toBeVisible();
    });

    for (const postItem of POST_ITEMS) {
      test(`新しいPostを投稿できる: ${postItem.title}`, async ({ page }) => {
        const titleInput = page.locator('[data-testid="post-title-input"]');
        const authorInput = page.locator('[data-testid="post-author-input"]');
        const contentInput = page.locator('[data-testid="post-content-input"]');
        const submitButton = page.locator('[data-testid="post-submit"]');

        // Postを入力
        await titleInput.fill(postItem.title);
        await authorInput.fill(postItem.author);
        await contentInput.fill(postItem.content);
        await submitButton.click();

        // 投稿されたPostが表示されることを確認
        const addedPost = page.locator('[data-testid="post-card"]', { hasText: postItem.title });
        await expect(addedPost).toBeVisible();

        // 入力フォームがクリアされることを確認
        await expect(titleInput).toHaveValue('');
        await expect(authorInput).toHaveValue('');
        await expect(contentInput).toHaveValue('');
      });
    }

    test('タイトルが空の場合は投稿できない', async ({ page }) => {
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');
      const initialCount = await page.locator('[data-testid="post-card"]').count();

      // タイトルを空にして送信
      await titleInput.fill('');
      await authorInput.fill('著者名');
      await contentInput.fill('本文');
      await submitButton.click();

      // Postが追加されていないことを確認
      const currentCount = await page.locator('[data-testid="post-card"]').count();
      expect(currentCount).toBe(initialCount);
    });

    test('著者名が空の場合は投稿できない', async ({ page }) => {
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');
      const initialCount = await page.locator('[data-testid="post-card"]').count();

      // 著者名を空にして送信
      await titleInput.fill('タイトル');
      await authorInput.fill('');
      await contentInput.fill('本文');
      await submitButton.click();

      // Postが追加されていないことを確認
      const currentCount = await page.locator('[data-testid="post-card"]').count();
      expect(currentCount).toBe(initialCount);
    });

    test('本文が空の場合は投稿できない', async ({ page }) => {
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');
      const initialCount = await page.locator('[data-testid="post-card"]').count();

      // 本文を空にして送信
      await titleInput.fill('タイトル');
      await authorInput.fill('著者名');
      await contentInput.fill('');
      await submitButton.click();

      // Postが追加されていないことを確認
      const currentCount = await page.locator('[data-testid="post-card"]').count();
      expect(currentCount).toBe(initialCount);
    });

    test('全項目が空の場合は投稿できない', async ({ page }) => {
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');
      const initialCount = await page.locator('[data-testid="post-card"]').count();

      // 全て空の状態で送信
      await titleInput.fill('');
      await authorInput.fill('');
      await contentInput.fill('');
      await submitButton.click();

      // Postが追加されていないことを確認
      const currentCount = await page.locator('[data-testid="post-card"]').count();
      expect(currentCount).toBe(initialCount);
    });

    test('Postを投稿した後、バックエンドAPIにPOSTリクエストが送信される', async ({ page }) => {
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');

      // ネットワークリクエストを監視
      const [request] = await Promise.all([
        page.waitForRequest(req => req.url().includes('/api/posts') && req.method() === 'POST'),
        titleInput.fill('新しい記事'),
        authorInput.fill('新しい著者'),
        contentInput.fill('新しい本文'),
        submitButton.click(),
      ]);

      expect(request).toBeTruthy();
    });
  });

  test.describe('Post削除機能', () => {
    test('Postの削除ボタンが表示される', async ({ page }) => {
      // まずPostを投稿
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');

      await titleInput.fill('削除ボタンテスト');
      await authorInput.fill('テスト著者');
      await contentInput.fill('テスト本文');
      await submitButton.click();

      const firstItem = page.locator('[data-testid="post-card"]').first();
      const deleteButton = firstItem.locator('[data-testid="post-delete"]');

      await expect(deleteButton).toBeVisible();
    });

    test('Postを削除できる', async ({ page }) => {
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');

      // Postを投稿
      await titleInput.fill('削除テスト');
      await authorInput.fill('削除著者');
      await contentInput.fill('削除本文');
      await submitButton.click();

      const postCard = page.locator('[data-testid="post-card"]', { hasText: '削除テスト' });
      await expect(postCard).toBeVisible();

      // 削除ボタンをクリック
      const deleteButton = postCard.locator('[data-testid="post-delete"]');
      await deleteButton.click();

      // Postが削除されたことを確認
      await expect(postCard).not.toBeVisible();
    });

    test('Postを削除した時、バックエンドAPIにDELETEリクエストが送信される', async ({ page }) => {
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');

      // Postを投稿
      await titleInput.fill('削除API連携テスト');
      await authorInput.fill('削除API著者');
      await contentInput.fill('削除API本文');
      await submitButton.click();

      const postCard = page.locator('[data-testid="post-card"]', { hasText: '削除API連携テスト' });
      const deleteButton = postCard.locator('[data-testid="post-delete"]');

      // ネットワークリクエストを監視
      const [request] = await Promise.all([
        page.waitForRequest(req => req.url().includes('/api/posts/') && req.method() === 'DELETE'),
        deleteButton.click(),
      ]);

      expect(request).toBeTruthy();
    });

    test('複数のPostを個別に削除できる', async ({ page }) => {
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');

      // 複数のPostを投稿
      for (const item of POST_ITEMS) {
        await titleInput.fill(item.title);
        await authorInput.fill(item.author);
        await contentInput.fill(item.content);
        await submitButton.click();
      }

      // 2番目のPostを削除
      const secondPost = page.locator('[data-testid="post-card"]', { hasText: POST_ITEMS[1].title });
      await secondPost.locator('[data-testid="post-delete"]').click();

      // 2番目のPostが削除され、1番目と3番目は残っていることを確認
      await expect(secondPost).not.toBeVisible();
      await expect(page.locator('[data-testid="post-card"]', { hasText: POST_ITEMS[0].title })).toBeVisible();
      await expect(page.locator('[data-testid="post-card"]', { hasText: POST_ITEMS[2].title })).toBeVisible();
    });
  });

  test.describe('Post詳細表示機能', () => {
    test('Postの詳細ボタンが表示される', async ({ page }) => {
      // まずPostを投稿
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');

      await titleInput.fill('詳細ボタンテスト');
      await authorInput.fill('テスト著者');
      await contentInput.fill('テスト本文');
      await submitButton.click();

      const firstItem = page.locator('[data-testid="post-card"]').first();
      const detailButton = firstItem.locator('[data-testid="post-detail"]');

      await expect(detailButton).toBeVisible();
    });

    test('詳細ボタンをクリックすると本文全体が表示される', async ({ page }) => {
      const titleInput = page.locator('[data-testid="post-title-input"]');
      const authorInput = page.locator('[data-testid="post-author-input"]');
      const contentInput = page.locator('[data-testid="post-content-input"]');
      const submitButton = page.locator('[data-testid="post-submit"]');

      const longContent = 'これは非常に長い本文です。'.repeat(20);

      await titleInput.fill('詳細表示テスト');
      await authorInput.fill('詳細著者');
      await contentInput.fill(longContent);
      await submitButton.click();

      const postCard = page.locator('[data-testid="post-card"]', { hasText: '詳細表示テスト' });
      const detailButton = postCard.locator('[data-testid="post-detail"]');

      // 詳細ボタンをクリック
      await detailButton.click();

      // 本文全体が表示されることを確認（アラートやモーダルなどで実装される想定）
      // ※ 実装方法によってテスト内容が変わる可能性がある
      const fullContent = postCard.locator('[data-testid="post-full-content"]');
      await expect(fullContent).toBeVisible();
      await expect(fullContent).toContainText(longContent);
    });
  });
});
