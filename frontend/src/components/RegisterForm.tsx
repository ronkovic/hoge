import { useState } from 'react';

interface RegisterFormProps {
  onSubmit?: (username: string, email: string, password: string) => Promise<void>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!username || !email || !password || !passwordConfirm) {
      setError('必須項目を入力してください');
      return;
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    // パスワード長チェック
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    // パスワード一致チェック
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません');
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(username, email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form data-testid="register-form" onSubmit={handleSubmit} noValidate>
      <div>
        <input
          data-testid="register-username"
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <input
          data-testid="register-email"
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          data-testid="register-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" data-testid="password-toggle" onClick={togglePasswordVisibility}>
          {showPassword ? '非表示' : '表示'}
        </button>
      </div>
      <div>
        <input
          data-testid="register-password-confirm"
          type="password"
          placeholder="パスワード(確認)"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
      </div>
      {error && <div data-testid="register-error">{error}</div>}
      <button data-testid="register-submit" type="submit">
        登録
      </button>
    </form>
  );
}
