import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../../components/common/Button';

describe('Button', () => {
  describe('レンダリング', () => {
    it.each([
      {
        name: 'デフォルトのボタンが表示される',
        props: { children: 'Click me' },
        expectedText: 'Click me',
      },
      {
        name: 'プライマリボタンが表示される',
        props: { children: 'Primary', variant: 'primary' },
        expectedText: 'Primary',
      },
      {
        name: 'セカンダリボタンが表示される',
        props: { children: 'Secondary', variant: 'secondary' },
        expectedText: 'Secondary',
      },
      {
        name: '危険操作ボタンが表示される',
        props: { children: 'Delete', variant: 'danger' },
        expectedText: 'Delete',
      },
    ])('$name', ({ props, expectedText }) => {
      render(<Button {...props} />);
      expect(screen.getByRole('button', { name: expectedText })).toBeInTheDocument();
    });
  });

  describe('サイズバリエーション', () => {
    it.each([
      {
        name: '小サイズボタンが表示される',
        props: { children: 'Small', size: 'small' },
      },
      {
        name: '中サイズボタンが表示される',
        props: { children: 'Medium', size: 'medium' },
      },
      {
        name: '大サイズボタンが表示される',
        props: { children: 'Large', size: 'large' },
      },
    ])('$name', ({ props }) => {
      render(<Button {...props} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('無効状態', () => {
    it.each([
      {
        name: '無効状態のボタンはクリックできない',
        props: { children: 'Disabled', disabled: true },
        shouldBeDisabled: true,
      },
      {
        name: '有効状態のボタンはクリックできる',
        props: { children: 'Enabled', disabled: false },
        shouldBeDisabled: false,
      },
    ])('$name', ({ props, shouldBeDisabled }) => {
      render(<Button {...props} />);
      const button = screen.getByRole('button');

      if (shouldBeDisabled) {
        expect(button).toBeDisabled();
      } else {
        expect(button).not.toBeDisabled();
      }
    });
  });

  describe('クリックイベント', () => {
    it.each([
      {
        name: 'クリック時にonClickハンドラが呼ばれる',
        clickCount: 1,
      },
      {
        name: '複数回クリック時にonClickハンドラが複数回呼ばれる',
        clickCount: 3,
      },
    ])('$name', async ({ clickCount }) => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');

      for (let i = 0; i < clickCount; i++) {
        await user.click(button);
      }

      expect(handleClick).toHaveBeenCalledTimes(clickCount);
    });
  });

  describe('フルウィズモード', () => {
    it('fullWidthプロパティが適用される', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムクラス名が適用される', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('data-testid', () => {
    it('data-testid属性が設定される', () => {
      render(<Button data-testid="test-button">Test</Button>);
      expect(screen.getByTestId('test-button')).toBeInTheDocument();
    });
  });
});
