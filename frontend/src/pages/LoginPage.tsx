import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const registered = location.state?.registered;

  const handleLogin = async (email: string, password: string) => {
    // モックログイン処理
    if (email === 'test@example.com' && password === 'password123') {
      // トークンを保存
      localStorage.setItem('authToken', 'test-token-12345');

      // リダイレクト先を取得
      const redirect = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirect);
    } else {
      // ログイン失敗
      throw new Error('認証に失敗しました');
    }
  };

  return (
    <div data-testid="login-page" style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>ログイン</h1>
      {registered && (
        <div data-testid="register-success">
          登録が完了しました
        </div>
      )}
      <LoginForm onSubmit={handleLogin} />
      <div style={{ marginTop: '20px' }}>
        <Link data-testid="to-register-link" to="/register">
          アカウントをお持ちでない方はこちら
        </Link>
      </div>
      <nav style={{ marginTop: '20px' }}>
        <Link to="/" data-testid="nav-link-home">
          Home
        </Link>
        {' | '}
        <Link to="/todos" data-testid="nav-link-todos">
          Todos
        </Link>
        {' | '}
        <Link to="/dashboard" data-testid="nav-link-dashboard">
          Dashboard
        </Link>
      </nav>
    </div>
  );
}
