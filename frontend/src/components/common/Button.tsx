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

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  'data-testid': dataTestId,
}) => {
  const baseClasses = 'font-medium rounded transition-colors';

  const variantClasses = {
    default: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    disabledClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
    >
      {children}
    </button>
  );
};

export default Button;
