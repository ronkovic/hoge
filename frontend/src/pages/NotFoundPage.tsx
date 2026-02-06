import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div
      data-testid="not-found-page"
      style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}
    >
      <h1>404 - ページが見つかりません</h1>
      <p>お探しのページは存在しません。</p>
      <nav>
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
