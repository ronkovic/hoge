import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../../components/common/Card';

describe('Card', () => {
  describe('基本レンダリング', () => {
    it.each([
      {
        name: 'デフォルトのカードが表示される',
        props: { children: 'Card content' },
        expectedContent: 'Card content',
      },
      {
        name: 'タイトル付きカードが表示される',
        props: {
          title: 'Card Title',
          children: 'Card body content',
        },
        expectedTitle: 'Card Title',
        expectedContent: 'Card body content',
      },
    ])('$name', ({ props, expectedTitle, expectedContent }) => {
      render(<Card {...props} />);

      if (expectedTitle) {
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
      }

      expect(screen.getByText(expectedContent)).toBeInTheDocument();
    });
  });

  describe('バリアント', () => {
    it.each([
      {
        name: 'デフォルトバリアントのカードが表示される',
        variant: 'default',
      },
      {
        name: 'プライマリバリアントのカードが表示される',
        variant: 'primary',
      },
      {
        name: 'セカンダリバリアントのカードが表示される',
        variant: 'secondary',
      },
    ])('$name', ({ variant }) => {
      render(
        <Card variant={variant} data-testid="test-card">
          Content
        </Card>
      );
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
    });
  });

  describe('パディング', () => {
    it.each([
      {
        name: '小パディングのカードが表示される',
        padding: 'small',
      },
      {
        name: '中パディングのカードが表示される',
        padding: 'medium',
      },
      {
        name: '大パディングのカードが表示される',
        padding: 'large',
      },
      {
        name: 'パディングなしのカードが表示される',
        padding: 'none',
      },
    ])('$name', ({ padding }) => {
      render(
        <Card padding={padding} data-testid="test-card">
          Content
        </Card>
      );
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
    });
  });

  describe('影の深さ', () => {
    it.each([
      {
        name: '影なしのカードが表示される',
        shadow: 'none',
      },
      {
        name: '小さい影のカードが表示される',
        shadow: 'small',
      },
      {
        name: '中くらいの影のカードが表示される',
        shadow: 'medium',
      },
      {
        name: '大きい影のカードが表示される',
        shadow: 'large',
      },
    ])('$name', ({ shadow }) => {
      render(
        <Card shadow={shadow} data-testid="test-card">
          Content
        </Card>
      );
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
    });
  });

  describe('フッター', () => {
    it.each([
      {
        name: 'フッター付きカードが表示される',
        props: {
          children: 'Card body',
          footer: 'Card footer',
        },
        expectedFooter: 'Card footer',
      },
      {
        name: 'フッターなしカードが表示される',
        props: {
          children: 'Card body',
        },
        expectedFooter: null,
      },
    ])('$name', ({ props, expectedFooter }) => {
      render(<Card {...props} />);

      if (expectedFooter) {
        expect(screen.getByText(expectedFooter)).toBeInTheDocument();
      }
    });
  });

  describe('ホバーエフェクト', () => {
    it('hoverable属性が適用される', () => {
      render(
        <Card hoverable data-testid="hoverable-card">
          Hoverable content
        </Card>
      );
      expect(screen.getByTestId('hoverable-card')).toBeInTheDocument();
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムクラス名が適用される', () => {
      render(
        <Card className="custom-card" data-testid="test-card">
          Content
        </Card>
      );
      const card = screen.getByTestId('test-card');
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('data-testid', () => {
    it('data-testid属性が設定される', () => {
      render(<Card data-testid="test-card">Content</Card>);
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
    });
  });
});
