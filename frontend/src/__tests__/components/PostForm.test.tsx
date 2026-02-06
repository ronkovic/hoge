import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostForm } from '../../components/PostForm';

describe('PostForm', () => {
  describe('レンダリング', () => {
    it('タイトル入力欄が表示される', () => {
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      expect(screen.getByTestId('post-title-input')).toBeInTheDocument();
    });

    it('著者入力欄が表示される', () => {
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      expect(screen.getByTestId('post-author-input')).toBeInTheDocument();
    });

    it('本文入力欄が表示される', () => {
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      expect(screen.getByTestId('post-content-input')).toBeInTheDocument();
    });

    it('投稿ボタンが表示される', () => {
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      expect(screen.getByTestId('post-submit')).toBeInTheDocument();
    });
  });

  describe('入力機能', () => {
    it('タイトルを入力できる', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('post-title-input') as HTMLInputElement;
      await user.type(titleInput, 'テストタイトル');

      expect(titleInput.value).toBe('テストタイトル');
    });

    it('著者名を入力できる', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const authorInput = screen.getByTestId('post-author-input') as HTMLInputElement;
      await user.type(authorInput, 'テスト著者');

      expect(authorInput.value).toBe('テスト著者');
    });

    it('本文を入力できる', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const contentInput = screen.getByTestId('post-content-input') as HTMLTextAreaElement;
      await user.type(contentInput, 'テスト本文');

      expect(contentInput.value).toBe('テスト本文');
    });
  });

  describe('投稿機能', () => {
    it('全項目入力して投稿ボタンをクリックするとonSubmitが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('post-title-input');
      const authorInput = screen.getByTestId('post-author-input');
      const contentInput = screen.getByTestId('post-content-input');
      const submitButton = screen.getByTestId('post-submit');

      await user.type(titleInput, 'テストタイトル');
      await user.type(authorInput, 'テスト著者');
      await user.type(contentInput, 'テスト本文');
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith('テストタイトル', 'テスト著者', 'テスト本文');
    });

    it.each([
      { title: '記事1', author: '著者1', content: '本文1' },
      { title: '記事2', author: '著者2', content: '本文2' },
      { title: '記事3', author: '著者3', content: '本文3' },
    ])('投稿: $title', async ({ title, author, content }) => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('post-title-input');
      const authorInput = screen.getByTestId('post-author-input');
      const contentInput = screen.getByTestId('post-content-input');
      const submitButton = screen.getByTestId('post-submit');

      await user.type(titleInput, title);
      await user.type(authorInput, author);
      await user.type(contentInput, content);
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledWith(title, author, content);
    });

    it('投稿後、フォームがクリアされる', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('post-title-input') as HTMLInputElement;
      const authorInput = screen.getByTestId('post-author-input') as HTMLInputElement;
      const contentInput = screen.getByTestId('post-content-input') as HTMLTextAreaElement;
      const submitButton = screen.getByTestId('post-submit');

      await user.type(titleInput, 'テストタイトル');
      await user.type(authorInput, 'テスト著者');
      await user.type(contentInput, 'テスト本文');
      await user.click(submitButton);

      expect(titleInput.value).toBe('');
      expect(authorInput.value).toBe('');
      expect(contentInput.value).toBe('');
    });
  });

  describe('バリデーション', () => {
    it('タイトルが空の場合は投稿できない', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const authorInput = screen.getByTestId('post-author-input');
      const contentInput = screen.getByTestId('post-content-input');
      const submitButton = screen.getByTestId('post-submit');

      await user.type(authorInput, 'テスト著者');
      await user.type(contentInput, 'テスト本文');
      await user.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('著者名が空の場合は投稿できない', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('post-title-input');
      const contentInput = screen.getByTestId('post-content-input');
      const submitButton = screen.getByTestId('post-submit');

      await user.type(titleInput, 'テストタイトル');
      await user.type(contentInput, 'テスト本文');
      await user.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('本文が空の場合は投稿できない', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('post-title-input');
      const authorInput = screen.getByTestId('post-author-input');
      const submitButton = screen.getByTestId('post-submit');

      await user.type(titleInput, 'テストタイトル');
      await user.type(authorInput, 'テスト著者');
      await user.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('全項目が空の場合は投稿できない', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const submitButton = screen.getByTestId('post-submit');
      await user.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('タイトルが空白のみの場合は投稿できない', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('post-title-input');
      const authorInput = screen.getByTestId('post-author-input');
      const contentInput = screen.getByTestId('post-content-input');
      const submitButton = screen.getByTestId('post-submit');

      await user.type(titleInput, '   ');
      await user.type(authorInput, 'テスト著者');
      await user.type(contentInput, 'テスト本文');
      await user.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('著者名が空白のみの場合は投稿できない', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('post-title-input');
      const authorInput = screen.getByTestId('post-author-input');
      const contentInput = screen.getByTestId('post-content-input');
      const submitButton = screen.getByTestId('post-submit');

      await user.type(titleInput, 'テストタイトル');
      await user.type(authorInput, '   ');
      await user.type(contentInput, 'テスト本文');
      await user.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('本文が空白のみの場合は投稿できない', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(<PostForm onSubmit={mockSubmit} />);

      const titleInput = screen.getByTestId('post-title-input');
      const authorInput = screen.getByTestId('post-author-input');
      const contentInput = screen.getByTestId('post-content-input');
      const submitButton = screen.getByTestId('post-submit');

      await user.type(titleInput, 'テストタイトル');
      await user.type(authorInput, 'テスト著者');
      await user.type(contentInput, '   ');
      await user.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });
});
