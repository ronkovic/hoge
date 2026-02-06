import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../../components/RegisterForm';

describe('RegisterForm', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
  });

  describe('レンダリング', () => {
    it.each([
      {
        name: '会員登録フォームが表示される',
        testId: 'register-form',
      },
      {
        name: 'ユーザー名入力フィールドが表示される',
        testId: 'register-username',
      },
      {
        name: 'メールアドレス入力フィールドが表示される',
        testId: 'register-email',
      },
      {
        name: 'パスワード入力フィールドが表示される',
        testId: 'register-password',
      },
      {
        name: 'パスワード確認入力フィールドが表示される',
        testId: 'register-password-confirm',
      },
      {
        name: '登録ボタンが表示される',
        testId: 'register-submit',
      },
      {
        name: 'パスワード表示切り替えボタンが表示される',
        testId: 'password-toggle',
      },
    ])('$name', ({ testId }) => {
      render(<RegisterForm onSubmit={mockOnSubmit} />);
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  describe('バリデーション - 必須項目', () => {
    it.each([
      {
        name: '空のフォーム送信時にバリデーションエラーが表示される',
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        expectedError: '必須項目を入力してください',
      },
      {
        name: 'ユーザー名のみ空の場合エラーが表示される',
        username: '',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        expectedError: '必須項目を入力してください',
      },
      {
        name: 'メールアドレスのみ空の場合エラーが表示される',
        username: 'testuser',
        email: '',
        password: 'password123',
        passwordConfirm: 'password123',
        expectedError: '必須項目を入力してください',
      },
      {
        name: 'パスワードのみ空の場合エラーが表示される',
        username: 'testuser',
        email: 'test@example.com',
        password: '',
        passwordConfirm: 'password123',
        expectedError: '必須項目を入力してください',
      },
      {
        name: 'パスワード確認のみ空の場合エラーが表示される',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: '',
        expectedError: '必須項目を入力してください',
      },
    ])('$name', async ({ username, email, password, passwordConfirm, expectedError }) => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      if (username) {
        await user.type(screen.getByTestId('register-username'), username);
      }
      if (email) {
        await user.type(screen.getByTestId('register-email'), email);
      }
      if (password) {
        await user.type(screen.getByTestId('register-password'), password);
      }
      if (passwordConfirm) {
        await user.type(screen.getByTestId('register-password-confirm'), passwordConfirm);
      }

      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent(expectedError);
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('バリデーション - メールアドレス形式', () => {
    it.each([
      {
        name: '無効なメールアドレス形式でエラーが表示される(アットマークなし)',
        email: 'testexample.com',
        expectedError: '有効なメールアドレスを入力してください',
      },
      {
        name: '無効なメールアドレス形式でエラーが表示される(ドメインなし)',
        email: 'test@',
        expectedError: '有効なメールアドレスを入力してください',
      },
      {
        name: '無効なメールアドレス形式でエラーが表示される(TLDなし)',
        email: 'test@example',
        expectedError: '有効なメールアドレスを入力してください',
      },
      {
        name: '無効なメールアドレス形式でエラーが表示される(スペース含む)',
        email: 'test @example.com',
        expectedError: '有効なメールアドレスを入力してください',
      },
    ])('$name', async ({ email, expectedError }) => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('register-username'), 'testuser');
      await user.type(screen.getByTestId('register-email'), email);
      await user.type(screen.getByTestId('register-password'), 'password123');
      await user.type(screen.getByTestId('register-password-confirm'), 'password123');
      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent(expectedError);
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('バリデーション - パスワード長', () => {
    it.each([
      {
        name: 'パスワードが7文字の場合エラーが表示される',
        password: 'pass123',
        expectedError: 'パスワードは8文字以上で入力してください',
      },
      {
        name: 'パスワードが1文字の場合エラーが表示される',
        password: 'p',
        expectedError: 'パスワードは8文字以上で入力してください',
      },
      {
        name: 'パスワードが空文字の場合は必須エラーが優先される',
        password: '',
        expectedError: '必須項目を入力してください',
      },
    ])('$name', async ({ password, expectedError }) => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('register-username'), 'testuser');
      await user.type(screen.getByTestId('register-email'), 'test@example.com');
      if (password) {
        await user.type(screen.getByTestId('register-password'), password);
        await user.type(screen.getByTestId('register-password-confirm'), password);
      }
      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent(expectedError);
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('バリデーション - パスワード一致', () => {
    it.each([
      {
        name: 'パスワードが一致しない場合エラーが表示される',
        password: 'password123',
        passwordConfirm: 'password456',
        expectedError: 'パスワードが一致しません',
      },
      {
        name: 'パスワードが完全に異なる場合エラーが表示される',
        password: 'abcd1234',
        passwordConfirm: 'xyz56789',
        expectedError: 'パスワードが一致しません',
      },
      {
        name: 'パスワード確認が部分的に一致する場合もエラーが表示される',
        password: 'password123',
        passwordConfirm: 'password12',
        expectedError: 'パスワードが一致しません',
      },
    ])('$name', async ({ password, passwordConfirm, expectedError }) => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('register-username'), 'testuser');
      await user.type(screen.getByTestId('register-email'), 'test@example.com');
      await user.type(screen.getByTestId('register-password'), password);
      await user.type(screen.getByTestId('register-password-confirm'), passwordConfirm);
      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent(expectedError);
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('フォーム送信', () => {
    it.each([
      {
        name: '正しい情報でonSubmitが呼ばれる',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      },
      {
        name: '複雑な情報でonSubmitが呼ばれる',
        username: 'test_user-123',
        email: 'test.user+tag@example.co.jp',
        password: 'ComplexP@ssw0rd!',
      },
      {
        name: '最小文字数(8文字)のパスワードでonSubmitが呼ばれる',
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass1234',
      },
    ])('$name', async ({ username, email, password }) => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('register-username'), username);
      await user.type(screen.getByTestId('register-email'), email);
      await user.type(screen.getByTestId('register-password'), password);
      await user.type(screen.getByTestId('register-password-confirm'), password);
      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(username, email, password);
      });
    });

    it('onSubmitがError型の例外をthrowした場合エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      const errorMessage = 'メールアドレスは既に使用されています';
      mockOnSubmit.mockRejectedValue(new Error(errorMessage));
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('register-username'), 'testuser');
      await user.type(screen.getByTestId('register-email'), 'existing@example.com');
      await user.type(screen.getByTestId('register-password'), 'password123');
      await user.type(screen.getByTestId('register-password-confirm'), 'password123');
      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent(errorMessage);
      });
    });

    it('onSubmitがError型以外の例外をthrowした場合デフォルトメッセージが表示される', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue('unknown error');
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('register-username'), 'testuser');
      await user.type(screen.getByTestId('register-email'), 'test@example.com');
      await user.type(screen.getByTestId('register-password'), 'password123');
      await user.type(screen.getByTestId('register-password-confirm'), 'password123');
      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent('登録に失敗しました');
      });
    });
  });

  describe('パスワード表示切り替え', () => {
    it('初期状態ではパスワードが非表示になっている', () => {
      render(<RegisterForm onSubmit={mockOnSubmit} />);
      const passwordInput = screen.getByTestId('register-password');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('パスワード表示ボタンをクリックするとパスワードが表示される', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByTestId('register-password');
      const toggleButton = screen.getByTestId('password-toggle');

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('パスワード表示ボタンを2回クリックすると元に戻る', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByTestId('register-password');
      const toggleButton = screen.getByTestId('password-toggle');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('パスワード確認フィールドは常に非表示(password type)', () => {
      render(<RegisterForm onSubmit={mockOnSubmit} />);
      const passwordConfirmInput = screen.getByTestId('register-password-confirm');
      expect(passwordConfirmInput).toHaveAttribute('type', 'password');
    });
  });

  describe('入力フィールドの制御', () => {
    it.each([
      {
        name: 'ユーザー名入力フィールドに値が反映される',
        testId: 'register-username',
        value: 'testuser',
      },
      {
        name: 'メールアドレス入力フィールドに値が反映される',
        testId: 'register-email',
        value: 'test@example.com',
      },
      {
        name: 'パスワード入力フィールドに値が反映される',
        testId: 'register-password',
        value: 'password123',
      },
      {
        name: 'パスワード確認入力フィールドに値が反映される',
        testId: 'register-password-confirm',
        value: 'password123',
      },
    ])('$name', async ({ testId, value }) => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      const input = screen.getByTestId(testId);
      await user.type(input, value);

      expect(input).toHaveValue(value);
    });
  });

  describe('エラーメッセージのクリア', () => {
    it('バリデーションエラー後、再送信時にエラーメッセージがクリアされる', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      // 最初にバリデーションエラーを発生させる
      await user.click(screen.getByTestId('register-submit'));
      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent(
          '必須項目を入力してください'
        );
      });

      // 正しい値を入力して再送信
      mockOnSubmit.mockResolvedValue(undefined);
      await user.type(screen.getByTestId('register-username'), 'testuser');
      await user.type(screen.getByTestId('register-email'), 'test@example.com');
      await user.type(screen.getByTestId('register-password'), 'password123');
      await user.type(screen.getByTestId('register-password-confirm'), 'password123');
      await user.click(screen.getByTestId('register-submit'));

      // エラーメッセージが消えることを確認
      await waitFor(() => {
        expect(screen.queryByTestId('register-error')).not.toBeInTheDocument();
      });
    });
  });

  describe('onSubmitプロパティなしでの動作', () => {
    it('onSubmitが未指定の場合でもエラーにならない', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByTestId('register-username'), 'testuser');
      await user.type(screen.getByTestId('register-email'), 'test@example.com');
      await user.type(screen.getByTestId('register-password'), 'password123');
      await user.type(screen.getByTestId('register-password-confirm'), 'password123');

      // エラーにならないことを確認
      await expect(user.click(screen.getByTestId('register-submit'))).resolves.not.toThrow();
    });
  });

  describe('フォーム属性', () => {
    it('フォームにnoValidate属性が設定されている', () => {
      render(<RegisterForm onSubmit={mockOnSubmit} />);
      const form = screen.getByTestId('register-form');
      expect(form).toHaveAttribute('noValidate');
    });
  });

  describe('入力フィールドの属性', () => {
    it.each([
      {
        name: 'ユーザー名入力フィールドのtype属性がtextである',
        testId: 'register-username',
        expectedType: 'text',
      },
      {
        name: 'メールアドレス入力フィールドのtype属性がemailである',
        testId: 'register-email',
        expectedType: 'email',
      },
    ])('$name', ({ testId, expectedType }) => {
      render(<RegisterForm onSubmit={mockOnSubmit} />);
      const input = screen.getByTestId(testId);
      expect(input).toHaveAttribute('type', expectedType);
    });

    it.each([
      {
        name: 'ユーザー名入力フィールドにplaceholderが設定されている',
        testId: 'register-username',
        expectedPlaceholder: 'ユーザー名',
      },
      {
        name: 'メールアドレス入力フィールドにplaceholderが設定されている',
        testId: 'register-email',
        expectedPlaceholder: 'メールアドレス',
      },
      {
        name: 'パスワード入力フィールドにplaceholderが設定されている',
        testId: 'register-password',
        expectedPlaceholder: 'パスワード',
      },
      {
        name: 'パスワード確認入力フィールドにplaceholderが設定されている',
        testId: 'register-password-confirm',
        expectedPlaceholder: 'パスワード(確認)',
      },
    ])('$name', ({ testId, expectedPlaceholder }) => {
      render(<RegisterForm onSubmit={mockOnSubmit} />);
      const input = screen.getByTestId(testId);
      expect(input).toHaveAttribute('placeholder', expectedPlaceholder);
    });
  });

  describe('ボタンのテキスト', () => {
    it('登録ボタンのテキストが正しい', () => {
      render(<RegisterForm onSubmit={mockOnSubmit} />);
      const button = screen.getByTestId('register-submit');
      expect(button).toHaveTextContent('登録');
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
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      const toggleButton = screen.getByTestId('password-toggle');

      for (let i = 0; i < clickCount; i++) {
        await user.click(toggleButton);
      }

      expect(toggleButton).toHaveTextContent(expectedText);
    });
  });

  describe('バリデーション優先順位', () => {
    it('複数のバリデーションエラーがある場合、必須チェックが優先される', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      // 必須エラーとメール形式エラーが同時に発生する状態
      await user.type(screen.getByTestId('register-username'), 'testuser');
      // emailは空のまま = 必須エラー かつ 形式エラー
      await user.type(screen.getByTestId('register-password'), 'short');
      await user.type(screen.getByTestId('register-password-confirm'), 'short');
      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent(
          '必須項目を入力してください'
        );
      });
    });

    it('必須チェックパス後、メール形式エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('register-username'), 'testuser');
      await user.type(screen.getByTestId('register-email'), 'invalid-email');
      await user.type(screen.getByTestId('register-password'), 'password123');
      await user.type(screen.getByTestId('register-password-confirm'), 'password123');
      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent(
          '有効なメールアドレスを入力してください'
        );
      });
    });

    it('メール形式チェックパス後、パスワード長エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('register-username'), 'testuser');
      await user.type(screen.getByTestId('register-email'), 'test@example.com');
      await user.type(screen.getByTestId('register-password'), 'short');
      await user.type(screen.getByTestId('register-password-confirm'), 'short');
      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent(
          'パスワードは8文字以上で入力してください'
        );
      });
    });

    it('パスワード長チェックパス後、パスワード一致エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('register-username'), 'testuser');
      await user.type(screen.getByTestId('register-email'), 'test@example.com');
      await user.type(screen.getByTestId('register-password'), 'password123');
      await user.type(screen.getByTestId('register-password-confirm'), 'password456');
      await user.click(screen.getByTestId('register-submit'));

      await waitFor(() => {
        expect(screen.getByTestId('register-error')).toHaveTextContent('パスワードが一致しません');
      });
    });
  });
});
