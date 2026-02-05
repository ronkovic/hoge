import { Link, useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div data-testid="dashboard-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <nav>
          <Link to="/" data-testid="nav-link-home">Home</Link>
          {' | '}
          <Link to="/todos" data-testid="nav-link-todos">Todos</Link>
          {' | '}
          <Link to="/dashboard" data-testid="nav-link-dashboard">Dashboard</Link>
          {' | '}
          <button onClick={handleLogout} data-testid="logout-button" style={{ border: 'none', background: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
            ログアウト
          </button>
        </nav>
      </div>
      <h1 data-testid="dashboard-title">Dashboard</h1>
      <p>ダッシュボードへようこそ</p>
    </div>
  );
}
