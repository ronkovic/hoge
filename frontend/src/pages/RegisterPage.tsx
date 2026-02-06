import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegister = async (username: string, email: string, _password: string) => {
    // 既存メールアドレスチェック
    if (email === 'existing@example.com') {
      throw new Error('このメールアドレスは登録済みです');
    }

    // モック登録処理
    console.log('Registering:', { username, email });
    setShowSuccess(true);
    // 登録成功後はログインページへ遷移
    await new Promise((resolve) => setTimeout(resolve, 100));
    navigate('/login', { state: { registered: true } });
  };

  return (
    <div>
      <h1>会員登録</h1>
      {showSuccess && <div data-testid="register-success">登録が完了しました</div>}
      <RegisterForm onSubmit={handleRegister} />
      <div>
        <Link data-testid="to-login-link" to="/login">
          既にアカウントをお持ちの方はこちら
        </Link>
      </div>
    </div>
  );
}
