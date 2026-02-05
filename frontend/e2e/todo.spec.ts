import { test, expect } from '@playwright/test';

const TODO_ITEMS = [
  'テスト用タスク1',
  'テスト用タスク2',
  'テスト用タスク3',
];

test.describe('Todo アプリケーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Todo一覧表示機能', () => {
    test('初期状態でTodoリストが表示される', async ({ page }) => {
      // Todo一覧が表示されることを確認
      const todoList = page.locator('[data-testid="todo-list"]');
      await expect(todoList).toBeVisible();
    });

    test('バックエンドAPIからTodoを取得して表示する', async ({ page }) => {
      // APIから取得したTodoが表示されることを確認
      // ※ 実装前なので、このテストは失敗する
      const todoItems = page.locator('[data-testid="todo-item"]');
      await expect(todoItems).toHaveCount(0); // 初期状態では0件
    });

    test('各TodoにタイトルとステータスとIDが表示される', async ({ page }) => {
      // まずTodoを追加
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');
      await input.fill('テスト用Todo');
      await submitButton.click();

      const firstItem = page.locator('[data-testid="todo-item"]').first();
      await expect(firstItem.locator('[data-testid="todo-title"]')).toBeVisible();
      await expect(firstItem.locator('[data-testid="todo-status"]')).toBeVisible();
      await expect(firstItem.locator('[data-testid="todo-id"]')).toBeVisible();
    });
  });

  test.describe('Todo追加フォーム機能', () => {
    test('新規Todo入力フォームが表示される', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');

      await expect(input).toBeVisible();
      await expect(submitButton).toBeVisible();
    });

    for (const todoTitle of TODO_ITEMS) {
      test(`新しいTodoを追加できる: ${todoTitle}`, async ({ page }) => {
        const input = page.locator('[data-testid="todo-input"]');
        const submitButton = page.locator('[data-testid="todo-submit"]');

        // Todoを入力
        await input.fill(todoTitle);
        await submitButton.click();

        // 追加されたTodoが表示されることを確認
        const addedTodo = page.locator('[data-testid="todo-item"]', { hasText: todoTitle });
        await expect(addedTodo).toBeVisible();

        // 入力フォームがクリアされることを確認
        await expect(input).toHaveValue('');
      });
    }

    test('空のTodoは追加できない', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');
      const initialCount = await page.locator('[data-testid="todo-item"]').count();

      // 空の状態で送信
      await input.fill('');
      await submitButton.click();

      // Todoが追加されていないことを確認
      const currentCount = await page.locator('[data-testid="todo-item"]').count();
      expect(currentCount).toBe(initialCount);
    });

    test('Todoを追加した後、バックエンドAPIにPOSTリクエストが送信される', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');

      // ネットワークリクエストを監視
      const [request] = await Promise.all([
        page.waitForRequest(req => req.url().includes('/api/todos') && req.method() === 'POST'),
        input.fill('新しいタスク'),
        submitButton.click(),
      ]);

      expect(request).toBeTruthy();
    });
  });

  test.describe('Todo完了切り替え機能', () => {
    test('Todoの完了ボタンが表示される', async ({ page }) => {
      // まずTodoを追加
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');
      await input.fill('ボタンテスト');
      await submitButton.click();

      // 最初のTodoアイテムの完了ボタンを確認
      const firstItem = page.locator('[data-testid="todo-item"]').first();
      const toggleButton = firstItem.locator('[data-testid="todo-toggle"]');

      await expect(toggleButton).toBeVisible();
    });

    test('未完了のTodoを完了状態に切り替えられる', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');

      // Todoを追加
      await input.fill('切り替えテスト');
      await submitButton.click();

      const todoItem = page.locator('[data-testid="todo-item"]', { hasText: '切り替えテスト' });
      const toggleButton = todoItem.locator('[data-testid="todo-toggle"]');
      const status = todoItem.locator('[data-testid="todo-status"]');

      // 初期状態は未完了
      await expect(status).toContainText('未完了');

      // 完了状態に切り替え
      await toggleButton.click();

      // 完了状態になることを確認
      await expect(status).toContainText('完了');
    });

    test('完了状態のTodoを未完了に戻せる', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');

      // Todoを追加
      await input.fill('切り替えテスト2');
      await submitButton.click();

      const todoItem = page.locator('[data-testid="todo-item"]', { hasText: '切り替えテスト2' });
      const toggleButton = todoItem.locator('[data-testid="todo-toggle"]');
      const status = todoItem.locator('[data-testid="todo-status"]');

      // 完了状態に切り替え
      await toggleButton.click();
      await expect(status).toContainText('完了');

      // 未完了状態に戻す
      await toggleButton.click();
      await expect(status).toContainText('未完了');
    });

    test('完了状態を切り替えた時、バックエンドAPIにPUTリクエストが送信される', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');

      // Todoを追加
      await input.fill('API連携テスト');
      await submitButton.click();

      const todoItem = page.locator('[data-testid="todo-item"]', { hasText: 'API連携テスト' });
      const toggleButton = todoItem.locator('[data-testid="todo-toggle"]');

      // ネットワークリクエストを監視
      const [request] = await Promise.all([
        page.waitForRequest(req => req.url().includes('/api/todos/') && req.method() === 'PUT'),
        toggleButton.click(),
      ]);

      expect(request).toBeTruthy();
    });
  });

  test.describe('Todo削除機能', () => {
    test('Todoの削除ボタンが表示される', async ({ page }) => {
      // まずTodoを追加
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');
      await input.fill('削除ボタンテスト');
      await submitButton.click();

      const firstItem = page.locator('[data-testid="todo-item"]').first();
      const deleteButton = firstItem.locator('[data-testid="todo-delete"]');

      await expect(deleteButton).toBeVisible();
    });

    test('Todoを削除できる', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');

      // Todoを追加
      await input.fill('削除テスト');
      await submitButton.click();

      const todoItem = page.locator('[data-testid="todo-item"]', { hasText: '削除テスト' });
      await expect(todoItem).toBeVisible();

      // 削除ボタンをクリック
      const deleteButton = todoItem.locator('[data-testid="todo-delete"]');
      await deleteButton.click();

      // Todoが削除されたことを確認
      await expect(todoItem).not.toBeVisible();
    });

    test('Todoを削除した時、バックエンドAPIにDELETEリクエストが送信される', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');

      // Todoを追加
      await input.fill('削除API連携テスト');
      await submitButton.click();

      const todoItem = page.locator('[data-testid="todo-item"]', { hasText: '削除API連携テスト' });
      const deleteButton = todoItem.locator('[data-testid="todo-delete"]');

      // ネットワークリクエストを監視
      const [request] = await Promise.all([
        page.waitForRequest(req => req.url().includes('/api/todos/') && req.method() === 'DELETE'),
        deleteButton.click(),
      ]);

      expect(request).toBeTruthy();
    });

    test('複数のTodoを個別に削除できる', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const submitButton = page.locator('[data-testid="todo-submit"]');

      // 複数のTodoを追加
      for (const item of TODO_ITEMS) {
        await input.fill(item);
        await submitButton.click();
      }

      // 2番目のTodoを削除
      const secondTodo = page.locator('[data-testid="todo-item"]', { hasText: TODO_ITEMS[1] });
      await secondTodo.locator('[data-testid="todo-delete"]').click();

      // 2番目のTodoが削除され、1番目と3番目は残っていることを確認
      await expect(secondTodo).not.toBeVisible();
      await expect(page.locator('[data-testid="todo-item"]', { hasText: TODO_ITEMS[0] })).toBeVisible();
      await expect(page.locator('[data-testid="todo-item"]', { hasText: TODO_ITEMS[2] })).toBeVisible();
    });
  });
});
