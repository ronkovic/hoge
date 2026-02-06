import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../../components/common/Header';

describe('Header', () => {
  describe('基本レンダリング', () => {
    it.each([
      {
        name: 'デフォルトのヘッダーが表示される',
        props: { title: 'My App' },
        expectedTitle: 'My App',
      },
      {
        name: 'サブタイトル付きヘッダーが表示される',
        props: {
          title: 'My App',
          subtitle: 'Welcome back',
        },
        expectedTitle: 'My App',
        expectedSubtitle: 'Welcome back',
      },
    ])('$name', ({ props, expectedTitle, expectedSubtitle }) => {
      render(<Header {...props} />);

      expect(screen.getByText(expectedTitle)).toBeInTheDocument();

      if (expectedSubtitle) {
        expect(screen.getByText(expectedSubtitle)).toBeInTheDocument();
      }
    });
  });

  describe('ナビゲーションリンク', () => {
    it.each([
      {
        name: '単一のナビゲーションリンクが表示される',
        links: [{ label: 'Home', href: '/' }],
      },
      {
        name: '複数のナビゲーションリンクが表示される',
        links: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ])('$name', ({ links }) => {
      render(<Header title="App" links={links} />);

      links.forEach((link) => {
        expect(screen.getByText(link.label)).toBeInTheDocument();
      });
    });
  });

  describe('ユーザーメニュー', () => {
    it.each([
      {
        name: 'ログインユーザー名が表示される',
        props: {
          title: 'App',
          user: { name: 'John Doe' },
        },
        expectedUserName: 'John Doe',
      },
      {
        name: 'ユーザーメニューにログアウトボタンが含まれる',
        props: {
          title: 'App',
          user: { name: 'Jane Doe' },
          onLogout: vi.fn(),
        },
        expectedUserName: 'Jane Doe',
        hasLogout: true,
      },
    ])('$name', ({ props, expectedUserName, hasLogout }) => {
      render(<Header {...props} />);

      expect(screen.getByText(expectedUserName)).toBeInTheDocument();

      if (hasLogout) {
        expect(screen.getByRole('button', { name: /logout|ログアウト/i })).toBeInTheDocument();
      }
    });
  });

  describe('ログアウト機能', () => {
    it('ログアウトボタンをクリックするとonLogoutが呼ばれる', async () => {
      const handleLogout = vi.fn();
      const user = userEvent.setup();

      render(<Header title="App" user={{ name: 'Test User' }} onLogout={handleLogout} />);

      const logoutButton = screen.getByRole('button', { name: /logout|ログアウト/i });
      await user.click(logoutButton);

      expect(handleLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('固定表示', () => {
    it('fixed属性が適用される', () => {
      render(<Header title="App" fixed data-testid="header" />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムクラス名が適用される', () => {
      render(<Header title="App" className="custom-header" data-testid="header" />);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('data-testid', () => {
    it('data-testid属性が設定される', () => {
      render(<Header title="App" data-testid="test-header" />);
      expect(screen.getByTestId('test-header')).toBeInTheDocument();
    });
  });
});
