import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../../components/common/Footer';

describe('Footer', () => {
  describe('基本レンダリング', () => {
    it.each([
      {
        name: 'デフォルトのフッターが表示される',
        props: { copyright: '© 2026 My App' },
        expectedCopyright: '© 2026 My App',
      },
      {
        name: '会社名付きフッターが表示される',
        props: {
          copyright: '© 2026 Company Name',
        },
        expectedCopyright: '© 2026 Company Name',
      },
    ])('$name', ({ props, expectedCopyright }) => {
      render(<Footer {...props} />);
      expect(screen.getByText(expectedCopyright)).toBeInTheDocument();
    });
  });

  describe('フッターリンク', () => {
    it.each([
      {
        name: '単一のフッターリンクが表示される',
        links: [{ label: 'Privacy Policy', href: '/privacy' }],
      },
      {
        name: '複数のフッターリンクが表示される',
        links: [
          { label: 'Terms', href: '/terms' },
          { label: 'Privacy', href: '/privacy' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ])('$name', ({ links }) => {
      render(<Footer copyright="© 2026" links={links} />);

      links.forEach((link) => {
        expect(screen.getByText(link.label)).toBeInTheDocument();
      });
    });
  });

  describe('ソーシャルメディアリンク', () => {
    it.each([
      {
        name: '単一のソーシャルメディアリンクが表示される',
        socialLinks: [{ platform: 'twitter', url: 'https://twitter.com/app' }],
      },
      {
        name: '複数のソーシャルメディアリンクが表示される',
        socialLinks: [
          { platform: 'twitter', url: 'https://twitter.com/app' },
          { platform: 'github', url: 'https://github.com/app' },
          { platform: 'linkedin', url: 'https://linkedin.com/company/app' },
        ],
      },
    ])('$name', ({ socialLinks }) => {
      render(<Footer copyright="© 2026" socialLinks={socialLinks} />);

      socialLinks.forEach((link) => {
        const element = screen.getByTestId(`social-link-${link.platform}`);
        expect(element).toBeInTheDocument();
        expect(element).toHaveAttribute('href', link.url);
      });
    });
  });

  describe('バリアント', () => {
    it.each([
      {
        name: 'ダークバリアントのフッターが表示される',
        variant: 'dark',
      },
      {
        name: 'ライトバリアントのフッターが表示される',
        variant: 'light',
      },
    ])('$name', ({ variant }) => {
      render(
        <Footer copyright="© 2026" variant={variant} data-testid="footer" />
      );
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('固定表示', () => {
    it('fixed属性が適用される', () => {
      render(<Footer copyright="© 2026" fixed data-testid="footer" />);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムクラス名が適用される', () => {
      render(
        <Footer
          copyright="© 2026"
          className="custom-footer"
          data-testid="footer"
        />
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('data-testid', () => {
    it('data-testid属性が設定される', () => {
      render(<Footer copyright="© 2026" data-testid="test-footer" />);
      expect(screen.getByTestId('test-footer')).toBeInTheDocument();
    });
  });
});
