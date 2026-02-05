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
  const variantClasses =
    variant === 'dark'
      ? 'bg-gray-800 text-white border-gray-700'
      : 'bg-white text-gray-700 border-gray-200';
  const fixedClasses = fixed ? 'fixed bottom-0 left-0 right-0 z-50' : '';

  const classes = [baseClasses, variantClasses, fixedClasses, className]
    .filter(Boolean)
    .join(' ');

  return (
    <footer className={classes} data-testid={dataTestId}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          {links && links.length > 0 && (
            <nav className="flex gap-4 flex-wrap justify-center">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {socialLinks && socialLinks.length > 0 && (
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  data-testid={`social-link-${link.platform}`}
                  className="hover:text-blue-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}

          <p className="text-sm">{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
