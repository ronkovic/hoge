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

// TDD Red Phase: Dummy implementation that will fail tests
const Header: React.FC<HeaderProps> = () => {
  throw new Error('Header component not implemented yet');
};

export default Header;
