import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../../components/common/Input';

describe('Input', () => {
  describe('基本レンダリング', () => {
    it.each([
      {
        name: 'デフォルトのテキスト入力が表示される',
        props: { placeholder: 'Enter text' },
        expectedPlaceholder: 'Enter text',
      },
      {
        name: 'ラベル付きの入力フィールドが表示される',
        props: { label: 'Username', placeholder: 'Enter username' },
        expectedLabel: 'Username',
        expectedPlaceholder: 'Enter username',
      },
    ])('$name', ({ props, expectedLabel, expectedPlaceholder }) => {
      render(<Input {...props} />);

      if (expectedLabel) {
        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      }

      const input = screen.getByPlaceholderText(expectedPlaceholder);
      expect(input).toBeInTheDocument();
    });
  });

  describe('入力タイプ', () => {
    it.each([
      {
        name: 'テキスト入力が機能する',
        type: 'text',
      },
      {
        name: 'パスワード入力が機能する',
        type: 'password',
      },
      {
        name: 'メール入力が機能する',
        type: 'email',
      },
      {
        name: '数値入力が機能する',
        type: 'number',
      },
    ])('$name', ({ type }) => {
      render(<Input type={type} placeholder="Test input" />);
      const input = screen.getByPlaceholderText('Test input');
      expect(input).toHaveAttribute('type', type);
    });
  });

  describe('入力値の変更', () => {
    it.each([
      {
        name: '入力値が変更される',
        inputValue: 'Hello World',
      },
    ])('$name', async ({ inputValue }) => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input onChange={handleChange} placeholder="Type here" />);
      const input = screen.getByPlaceholderText('Type here') as HTMLInputElement;

      await user.clear(input);
      await user.type(input, inputValue);

      expect(handleChange).toHaveBeenCalled();
      expect(input.value).toBe(inputValue);
    });

    it('空文字が入力される', async () => {
      const user = userEvent.setup();

      render(<Input placeholder="Type here" />);
      const input = screen.getByPlaceholderText('Type here') as HTMLInputElement;

      // First type something
      await user.type(input, 'test');
      expect(input.value).toBe('test');

      // Then clear it
      await user.clear(input);
      expect(input.value).toBe('');
    });
  });

  describe('エラー表示', () => {
    it.each([
      {
        name: 'エラーメッセージが表示される',
        props: { error: 'This field is required' },
        expectedError: 'This field is required',
      },
      {
        name: 'エラーメッセージがない場合は表示されない',
        props: { error: undefined },
        expectedError: null,
      },
    ])('$name', ({ props, expectedError }) => {
      render(<Input {...props} placeholder="Test" />);

      if (expectedError) {
        expect(screen.getByText(expectedError)).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      }
    });
  });

  describe('無効状態', () => {
    it.each([
      {
        name: '無効状態の入力フィールドは入力できない',
        disabled: true,
        shouldBeDisabled: true,
      },
      {
        name: '有効状態の入力フィールドは入力できる',
        disabled: false,
        shouldBeDisabled: false,
      },
    ])('$name', ({ disabled, shouldBeDisabled }) => {
      render(<Input disabled={disabled} placeholder="Test" />);
      const input = screen.getByPlaceholderText('Test');

      if (shouldBeDisabled) {
        expect(input).toBeDisabled();
      } else {
        expect(input).not.toBeDisabled();
      }
    });
  });

  describe('必須フィールド', () => {
    it('required属性が適用される', () => {
      render(<Input required placeholder="Required field" />);
      const input = screen.getByPlaceholderText('Required field');
      expect(input).toBeRequired();
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムクラス名が適用される', () => {
      render(<Input className="custom-input" placeholder="Test" />);
      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveClass('custom-input');
    });
  });

  describe('data-testid', () => {
    it('data-testid属性が設定される', () => {
      render(<Input data-testid="test-input" placeholder="Test" />);
      expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });
  });
});
