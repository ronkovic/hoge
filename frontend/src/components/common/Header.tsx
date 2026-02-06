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
  const positionClass = fixed ? 'fixed top-0 left-0 right-0 z-50' : '';
  const combinedClasses = `${baseClasses} ${positionClass} ${className}`.trim();

  return (
    <header className={combinedClasses} data-testid={dataTestId}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>

          {links && links.length > 0 && (
            <nav className="flex items-center space-x-6 mx-8">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.name}</span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  ログアウト
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
