import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const registered = location.state?.registered;

  const handleLogin = async (email: string, password: string) => {
    // モックログイン処理
    if (email === 'test@example.com' && password === 'password123') {
      // ログイン成功
      navigate('/dashboard');
    } else {
      // ログイン失敗
      throw new Error('認証に失敗しました');
    }
  };

  return (
    <div>
      <h1>ログイン</h1>
      {registered && (
        <div data-testid="register-success">
          登録が完了しました
        </div>
      )}
      <LoginForm onSubmit={handleLogin} />
      <div>
        <Link data-testid="to-register-link" to="/register">
          アカウントをお持ちでない方はこちら
        </Link>
      </div>
    </div>
  );
}
