import { useState } from 'react';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!email || !password) {
      setError('必須項目を入力してください');
      return;
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(email, password);
      }
    } catch {
      setError('認証に失敗しました');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form data-testid="login-form" onSubmit={handleSubmit} noValidate>
      <div>
        <input
          data-testid="login-email"
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          data-testid="login-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" data-testid="password-toggle" onClick={togglePasswordVisibility}>
          {showPassword ? '非表示' : '表示'}
        </button>
      </div>
      {error && <div data-testid="login-error">{error}</div>}
      <button data-testid="login-submit" type="submit">
        ログイン
      </button>
    </form>
  );
}
