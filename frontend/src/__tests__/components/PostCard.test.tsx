import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCard } from '../../components/PostCard';
import type { Post } from '../../types/post';

const mockPost: Post = {
  id: 1,
  title: 'テスト記事',
  author: 'テスト著者',
  content: 'これはテスト記事の本文です。',
  createdAt: '2026-02-06T10:00:00Z',
};

const longContentPost: Post = {
  id: 2,
  title: '長い記事',
  author: '著者2',
  content: 'これは非常に長い本文です。'.repeat(10), // 150文字
  createdAt: '2026-02-06T11:00:00Z',
};

describe('PostCard', () => {
  describe('レンダリング', () => {
    it('記事のタイトルが表示される', () => {
      const mockDelete = vi.fn();
      render(<PostCard post={mockPost} onDelete={mockDelete} />);

      expect(screen.getByTestId('post-title')).toHaveTextContent('タイトル: テスト記事');
    });

    it('記事のIDが表示される', () => {
      const mockDelete = vi.fn();
      render(<PostCard post={mockPost} onDelete={mockDelete} />);

      expect(screen.getByTestId('post-id')).toHaveTextContent('ID: 1');
    });

    it('記事の著者が表示される', () => {
      const mockDelete = vi.fn();
      render(<PostCard post={mockPost} onDelete={mockDelete} />);

      expect(screen.getByTestId('post-author')).toHaveTextContent('著者: テスト著者');
    });

    it('記事の作成日時が表示される', () => {
      const mockDelete = vi.fn();
      render(<PostCard post={mockPost} onDelete={mockDelete} />);

      expect(screen.getByTestId('post-created-at')).toHaveTextContent('作成日時: 2026-02-06T10:00:00Z');
    });

    it('記事の本文が表示される', () => {
      const mockDelete = vi.fn();
      render(<PostCard post={mockPost} onDelete={mockDelete} />);

      expect(screen.getByTestId('post-content')).toHaveTextContent('本文: これはテスト記事の本文です。');
    });

    it('削除ボタンが表示される', () => {
      const mockDelete = vi.fn();
      render(<PostCard post={mockPost} onDelete={mockDelete} />);

      expect(screen.getByTestId('post-delete')).toBeInTheDocument();
    });

    it('詳細ボタンが表示される', () => {
      const mockDelete = vi.fn();
      render(<PostCard post={mockPost} onDelete={mockDelete} />);

      expect(screen.getByTestId('post-detail')).toBeInTheDocument();
    });
  });

  describe('本文の省略表示', () => {
    it('50文字以下の本文は全文表示される', () => {
      const mockDelete = vi.fn();
      render(<PostCard post={mockPost} onDelete={mockDelete} />);

      const contentElement = screen.getByTestId('post-content');
      expect(contentElement).toHaveTextContent('本文: これはテスト記事の本文です。');
      expect(contentElement).not.toHaveTextContent('...');
    });

    it('50文字を超える本文は省略表示される', () => {
      const mockDelete = vi.fn();
      render(<PostCard post={longContentPost} onDelete={mockDelete} />);

      const contentElement = screen.getByTestId('post-content');
      expect(contentElement).toHaveTextContent('...');
    });

    it('50文字を超える本文は最初の50文字のみ表示される', () => {
      const mockDelete = vi.fn();
      render(<PostCard post={longContentPost} onDelete={mockDelete} />);

      const contentElement = screen.getByTestId('post-content');
      const expectedText = longContentPost.content.substring(0, 50);
      expect(contentElement).toHaveTextContent(`本文: ${expectedText}...`);
    });
  });

  describe('詳細表示機能', () => {
    it('詳細ボタンをクリックすると本文全体が表示される', async () => {
      const user = userEvent.setup();
      const mockDelete = vi.fn();
      render(<PostCard post={longContentPost} onDelete={mockDelete} />);

      // 初期状態では全文は表示されていない
      expect(screen.queryByTestId('post-full-content')).not.toBeInTheDocument();

      // 詳細ボタンをクリック
      const detailButton = screen.getByTestId('post-detail');
      await user.click(detailButton);

      // 本文全体が表示される
      expect(screen.getByTestId('post-full-content')).toBeInTheDocument();
      expect(screen.getByTestId('post-full-content')).toHaveTextContent(longContentPost.content);
    });

    it('詳細ボタンを2回クリックすると本文全体が非表示になる', async () => {
      const user = userEvent.setup();
      const mockDelete = vi.fn();
      render(<PostCard post={longContentPost} onDelete={mockDelete} />);

      const detailButton = screen.getByTestId('post-detail');

      // 1回目のクリックで表示
      await user.click(detailButton);
      expect(screen.getByTestId('post-full-content')).toBeInTheDocument();

      // 2回目のクリックで非表示
      await user.click(detailButton);
      expect(screen.queryByTestId('post-full-content')).not.toBeInTheDocument();
    });
  });

  describe('削除機能', () => {
    it('削除ボタンをクリックするとonDelete関数が呼ばれる', async () => {
      const user = userEvent.setup();
      const mockDelete = vi.fn();
      render(<PostCard post={mockPost} onDelete={mockDelete} />);

      const deleteButton = screen.getByTestId('post-delete');
      await user.click(deleteButton);

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith(mockPost.id);
    });

    it.each([
      { id: 1, title: '記事1' },
      { id: 2, title: '記事2' },
      { id: 3, title: '記事3' },
    ])('削除ボタンをクリックすると正しいIDでonDeleteが呼ばれる (ID: $id)', async ({ id, title }) => {
      const user = userEvent.setup();
      const mockDelete = vi.fn();
      const post: Post = {
        id,
        title,
        author: '著者',
        content: '本文',
        createdAt: '2026-02-06T10:00:00Z',
      };

      render(<PostCard post={post} onDelete={mockDelete} />);

      const deleteButton = screen.getByTestId('post-delete');
      await user.click(deleteButton);

      expect(mockDelete).toHaveBeenCalledWith(id);
    });
  });
});
