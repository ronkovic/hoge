import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  links?: Array<{ label: string; href: string }>;
  user?: { name: string };
  onLogout?: () => void;
  fixed?: boolean;
  className?: string;
  'data-testid'?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  links,
  user,
  onLogout,
  fixed = false,
  className = '',
  'data-testid': dataTestId,
}) => {
  const baseClasses = 'bg-white border-b border-gray-200 shadow-sm';
  const fixedClasses = fixed ? 'fixed top-0 left-0 right-0 z-50' : '';

  const classes = [baseClasses, fixedClasses, className]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={classes} data-testid={dataTestId}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>

        {links && links.length > 0 && (
          <nav className="flex gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.name}</span>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                ログアウト
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
