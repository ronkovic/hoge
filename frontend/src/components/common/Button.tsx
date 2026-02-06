import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

// TDD Red Phase: Dummy implementation that will fail tests
const Button: React.FC<ButtonProps> = () => {
  throw new Error('Button component not implemented yet');
};

export default Button;
