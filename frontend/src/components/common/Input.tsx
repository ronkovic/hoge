import React from 'react';

interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number';
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  'data-testid'?: string;
}

// TDD Red Phase: Dummy implementation that will fail tests
const Input: React.FC<InputProps> = () => {
  throw new Error('Input component not implemented yet');
};

export default Input;
