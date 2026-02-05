import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
  className?: string;
  'data-testid'?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  footer,
  variant = 'default',
  padding = 'medium',
  shadow = 'small',
  hoverable = false,
  className = '',
  'data-testid': dataTestId,
}) => {
  const baseClasses = 'rounded-lg border';

  const variantClasses = {
    default: 'bg-white border-gray-200',
    primary: 'bg-blue-50 border-blue-200',
    secondary: 'bg-gray-50 border-gray-300',
  };

  const paddingClasses = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  };

  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
  };

  const hoverableClasses = hoverable
    ? 'transition-shadow hover:shadow-xl cursor-pointer'
    : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    shadowClasses[shadow],
    hoverableClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} data-testid={dataTestId}>
      {title && (
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      )}
      <div className="text-gray-700">{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>
      )}
    </div>
  );
};

export default Card;
