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
  shadow = 'medium',
  hoverable = false,
  className = '',
  'data-testid': dataTestId,
}) => {
  const baseClasses = 'rounded-lg border transition-shadow';

  const variantClasses = {
    default: 'bg-white border-gray-200',
    primary: 'bg-blue-50 border-blue-200',
    secondary: 'bg-gray-50 border-gray-300',
  };

  const paddingClasses = {
    none: 'p-0',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  };

  const shadowClasses = {
    none: 'shadow-none',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
  };

  const hoverClass = hoverable ? 'hover:shadow-xl cursor-pointer' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClass} ${className}`.trim();

  return (
    <div className={combinedClasses} data-testid={dataTestId}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
