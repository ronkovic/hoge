import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (username && password) {
      localStorage.setItem('authToken', 'test-token-12345');

      const redirect = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirect);
    }
  };

  return (
    <div data-testid="login-page" style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>ログイン</h1>
      <form data-testid="login-form" onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            data-testid="login-username"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            data-testid="login-password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" data-testid="login-submit" style={{ width: '100%', padding: '10px' }}>
          ログイン
        </button>
      </form>
      <nav style={{ marginTop: '20px' }}>
        <Link to="/" data-testid="nav-link-home">Home</Link>
        {' | '}
        <Link to="/todos" data-testid="nav-link-todos">Todos</Link>
        {' | '}
        <Link to="/dashboard" data-testid="nav-link-dashboard">Dashboard</Link>
      </nav>
    </div>
  );
}
