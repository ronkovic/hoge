import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostList } from '../../components/PostList';
import type { Post } from '../../types/post';

const mockPosts: Post[] = [
  {
    id: 1,
    title: 'テスト記事1',
    author: '著者1',
    content: 'これはテスト記事1の本文です。',
    createdAt: '2026-02-06T10:00:00Z',
  },
  {
    id: 2,
    title: 'テスト記事2',
    author: '著者2',
    content: 'これはテスト記事2の本文です。',
    createdAt: '2026-02-06T11:00:00Z',
  },
  {
    id: 3,
    title: 'テスト記事3',
    author: '著者3',
    content: 'これはテスト記事3の本文です。',
    createdAt: '2026-02-06T12:00:00Z',
  },
];

describe('PostList', () => {
  describe('レンダリング', () => {
    it('PostListコンポーネントが表示される', () => {
      const mockDelete = vi.fn();
      render(<PostList posts={mockPosts} onDelete={mockDelete} />);

      expect(screen.getByTestId('post-list')).toBeInTheDocument();
    });

    it('複数の記事が表示される', () => {
      const mockDelete = vi.fn();
      render(<PostList posts={mockPosts} onDelete={mockDelete} />);

      const postCards = screen.getAllByTestId('post-card');
      expect(postCards).toHaveLength(3);
    });

    it.each([
      { index: 0, title: 'テスト記事1' },
      { index: 1, title: 'テスト記事2' },
      { index: 2, title: 'テスト記事3' },
    ])('記事$index: $titleが表示される', ({ title }) => {
      const mockDelete = vi.fn();
      render(<PostList posts={mockPosts} onDelete={mockDelete} />);

      expect(screen.getByText(`タイトル: ${title}`)).toBeInTheDocument();
    });
  });

  describe('空の状態', () => {
    it('記事が0件の場合は「記事がありません」が表示される', () => {
      const mockDelete = vi.fn();
      render(<PostList posts={[]} onDelete={mockDelete} />);

      expect(screen.getByTestId('post-list-empty')).toBeInTheDocument();
      expect(screen.getByTestId('post-list-empty')).toHaveTextContent('記事がありません');
    });

    it('記事が0件の場合はPostCardは表示されない', () => {
      const mockDelete = vi.fn();
      render(<PostList posts={[]} onDelete={mockDelete} />);

      expect(screen.queryByTestId('post-card')).not.toBeInTheDocument();
    });
  });

  describe('削除機能', () => {
    it('記事を削除するとonDelete関数が呼ばれる', async () => {
      const user = userEvent.setup();
      const mockDelete = vi.fn();
      render(<PostList posts={mockPosts} onDelete={mockDelete} />);

      const firstDeleteButton = screen.getAllByTestId('post-delete')[0];
      await user.click(firstDeleteButton);

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith(1);
    });

    it('異なる記事の削除ボタンをクリックすると正しいIDでonDeleteが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockDelete = vi.fn();
      render(<PostList posts={mockPosts} onDelete={mockDelete} />);

      const deleteButtons = screen.getAllByTestId('post-delete');

      // 2番目の記事を削除
      await user.click(deleteButtons[1]);
      expect(mockDelete).toHaveBeenCalledWith(2);

      // 3番目の記事を削除
      await user.click(deleteButtons[2]);
      expect(mockDelete).toHaveBeenCalledWith(3);
    });
  });

  describe('記事数のバリエーション', () => {
    it.each([
      { count: 1, posts: [mockPosts[0]] },
      { count: 2, posts: [mockPosts[0], mockPosts[1]] },
      { count: 3, posts: mockPosts },
    ])('記事が$count件の場合、$count個のPostCardが表示される', ({ count, posts }) => {
      const mockDelete = vi.fn();
      render(<PostList posts={posts} onDelete={mockDelete} />);

      const postCards = screen.getAllByTestId('post-card');
      expect(postCards).toHaveLength(count);
    });
  });
});
