import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../components/LoginForm';

describe('LoginForm', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
  });

  describe('レンダリング', () => {
    it.each([
      {
        name: 'ログインフォームが表示される',
        testId: 'login-form',
      },
      {
        name: 'メールアドレス入力フィールドが表示される',
        testId: 'login-email',
      },
      {
        name: 'パスワード入力フィールドが表示される',
        testId: 'login-password',
      },
      {
        name: 'ログインボタンが表示される',
        testId: 'login-submit',
      },
      {
        name: 'パスワード表示切り替えボタンが表示される',
        testId: 'password-toggle',
      },
    ])('$name', ({ testId }) => {
      render(<LoginForm onSubmit={mockOnSubmit} />);
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it.each([
      {
        name: '空のフォーム送信時にバリデーションエラーが表示される',
        email: '',
        password: '',
        expectedError: '必須項目を入力してください',
      },
      {
        name: 'メールアドレスのみ空の場合エラーが表示される',
        email: '',
        password: 'password123',
        expectedError: '必須項目を入力してください',
      },
      {
        name: 'パスワードのみ空の場合エラーが表示される',
        email: 'test@example.com',
        password: '',
        expectedError: '必須項目を入力してください',
      },
      {
        name: '無効なメールアドレス形式でエラーが表示される(アットマークなし)',
        email: 'testexample.com',
        password: 'password123',
        expectedError: '有効なメールアドレスを入力してください',
      },
      {
        name: '無効なメールアドレス形式でエラーが表示される(ドメインなし)',
        email: 'test@',
        password: 'password123',
        expectedError: '有効なメールアドレスを入力してください',
      },
      {
        name: '無効なメールアドレス形式でエラーが表示される(TLDなし)',
        email: 'test@example',
        password: 'password123',
        expectedError: '有効なメールアドレスを入力してください',
      },
    ])('$name', async ({ email, password, expectedError }) => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      if (email) {
        await user.type(screen.getByTestId('login-email'), email);
      }
      if (password) {
        await user.type(screen.getByTestId('login-password'), password);
      }

      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toHaveTextContent(expectedError);
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('フォーム送信', () => {
    it.each([
      {
        name: '正しいメールアドレスとパスワードでonSubmitが呼ばれる',
        email: 'test@example.com',
        password: 'password123',
      },
      {
        name: '複雑なメールアドレス形式でonSubmitが呼ばれる',
        email: 'test.user+tag@example.co.jp',
        password: 'ComplexP@ssw0rd!',
      },
    ])('$name', async ({ email, password }) => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('login-email'), email);
      await user.type(screen.getByTestId('login-password'), password);
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(email, password);
      });
    });

    it('onSubmitがPromiseをrejectした場合エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error('認証エラー'));
      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('login-email'), 'test@example.com');
      await user.type(screen.getByTestId('login-password'), 'wrongpassword');
      await user.click(screen.getByTestId('login-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toHaveTextContent('認証に失敗しました');
      });
    });
  });

  describe('パスワード表示切り替え', () => {
    it.each([
      {
        name: '初期状態ではパスワードが非表示になっている',
        initialType: 'password',
      },
    ])('$name', ({ initialType }) => {
      render(<LoginForm onSubmit={mockOnSubmit} />);
      const passwordInput = screen.getByTestId('login-password');
      expect(passwordInput).toHaveAttribute('type', initialType);
    });

    it('パスワード表示ボタンをクリックするとパスワードが表示される', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByTestId('login-password');
      const toggleButton = screen.getByTestId('password-toggle');

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('パスワード表示ボタンを2回クリックすると元に戻る', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByTestId('login-password');
      const toggleButton = screen.getByTestId('password-toggle');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('入力フィールドの制御', () => {
    it.each([
      {
        name: 'メールアドレス入力フィールドに値が反映される',
        testId: 'login-email',
        value: 'test@example.com',
      },
      {
        name: 'パスワード入力フィールドに値が反映される',
        testId: 'login-password',
        value: 'password123',
      },
    ])('$name', async ({ testId, value }) => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId(testId);
      await user.type(input, value);

      expect(input).toHaveValue(value);
    });
  });

  describe('エラーメッセージのクリア', () => {
    it('バリデーションエラー後、再送信時にエラーメッセージがクリアされる', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      // 最初にバリデーションエラーを発生させる
      await user.click(screen.getByTestId('login-submit'));
      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toHaveTextContent('必須項目を入力してください');
      });

      // 正しい値を入力して再送信
      mockOnSubmit.mockResolvedValue(undefined);
      await user.type(screen.getByTestId('login-email'), 'test@example.com');
      await user.type(screen.getByTestId('login-password'), 'password123');
      await user.click(screen.getByTestId('login-submit'));

      // エラーメッセージが消えることを確認
      await waitFor(() => {
        expect(screen.queryByTestId('login-error')).not.toBeInTheDocument();
      });
    });
  });

  describe('onSubmitプロパティなしでの動作', () => {
    it('onSubmitが未指定の場合でもエラーにならない', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByTestId('login-email'), 'test@example.com');
      await user.type(screen.getByTestId('login-password'), 'password123');

      // エラーにならないことを確認
      await expect(user.click(screen.getByTestId('login-submit'))).resolves.not.toThrow();
    });
  });

  describe('フォーム属性', () => {
    it('フォームにnoValidate属性が設定されている', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);
      const form = screen.getByTestId('login-form');
      expect(form).toHaveAttribute('noValidate');
    });
  });

  describe('入力フィールドの属性', () => {
    it.each([
      {
        name: 'メールアドレス入力フィールドのtype属性がemailである',
        testId: 'login-email',
        expectedType: 'email',
      },
    ])('$name', ({ testId, expectedType }) => {
      render(<LoginForm onSubmit={mockOnSubmit} />);
      const input = screen.getByTestId(testId);
      expect(input).toHaveAttribute('type', expectedType);
    });

    it.each([
      {
        name: 'メールアドレス入力フィールドにplaceholderが設定されている',
        testId: 'login-email',
        expectedPlaceholder: 'メールアドレス',
      },
      {
        name: 'パスワード入力フィールドにplaceholderが設定されている',
        testId: 'login-password',
        expectedPlaceholder: 'パスワード',
      },
    ])('$name', ({ testId, expectedPlaceholder }) => {
      render(<LoginForm onSubmit={mockOnSubmit} />);
      const input = screen.getByTestId(testId);
      expect(input).toHaveAttribute('placeholder', expectedPlaceholder);
    });
  });

  describe('ボタンのテキスト', () => {
    it('ログインボタンのテキストが正しい', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);
      const button = screen.getByTestId('login-submit');
      expect(button).toHaveTextContent('ログイン');
    });

    it.each([
      {
        name: 'パスワード非表示時のボタンテキストが「表示」である',
        clickCount: 0,
        expectedText: '表示',
      },
      {
        name: 'パスワード表示時のボタンテキストが「非表示」である',
        clickCount: 1,
        expectedText: '非表示',
      },
    ])('$name', async ({ clickCount, expectedText }) => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const toggleButton = screen.getByTestId('password-toggle');

      for (let i = 0; i < clickCount; i++) {
        await user.click(toggleButton);
      }

      expect(toggleButton).toHaveTextContent(expectedText);
    });
  });
});
