import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegister = async (_username: string, email: string, _password: string) => {
    // 既存メールアドレスチェック
    if (email === 'existing@example.com') {
      throw new Error('このメールアドレスは登録済みです');
    }

    // モック登録処理
    setShowSuccess(true);
    // 登録成功後はログインページへ遷移
    await new Promise(resolve => setTimeout(resolve, 100));
    navigate('/login', { state: { registered: true } });
  };

  return (
    <div>
      <h1>会員登録</h1>
      {showSuccess && (
        <div data-testid="register-success">
          登録が完了しました
        </div>
      )}
      <RegisterForm onSubmit={handleRegister} />
      <div>
        <a data-testid="to-login-link" href="/login">
          既にアカウントをお持ちの方はこちら
        </a>
      </div>
    </div>
  );
}
