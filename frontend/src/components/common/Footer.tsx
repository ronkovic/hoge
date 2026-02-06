import React from 'react';

interface FooterProps {
  copyright: string;
  links?: Array<{ label: string; href: string }>;
  socialLinks?: Array<{ platform: string; url: string }>;
  variant?: 'dark' | 'light';
  fixed?: boolean;
  className?: string;
  'data-testid'?: string;
}

const Footer: React.FC<FooterProps> = ({
  copyright,
  links,
  socialLinks,
  variant = 'light',
  fixed = false,
  className = '',
  'data-testid': dataTestId,
}) => {
  const baseClasses = 'border-t py-6';
  const variantClasses = {
    dark: 'bg-gray-800 text-white border-gray-700',
    light: 'bg-white text-gray-700 border-gray-200',
  };
  const positionClass = fixed ? 'fixed bottom-0 left-0 right-0 z-50' : '';
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${positionClass} ${className}`.trim();

  return (
    <footer className={combinedClasses} data-testid={dataTestId}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm">
            {copyright}
          </div>

          {links && links.length > 0 && (
            <nav className="flex items-center space-x-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={`text-sm hover:underline transition-colors ${
                    variant === 'dark' ? 'hover:text-gray-300' : 'hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {socialLinks && socialLinks.length > 0 && (
            <div className="flex items-center space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  data-testid={`social-link-${link.platform}`}
                  className={`text-sm transition-colors ${
                    variant === 'dark' ? 'hover:text-gray-300' : 'hover:text-blue-600'
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
