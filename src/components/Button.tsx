import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'google' | 'link';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  fullWidth = false, 
  children, 
  className = '',
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'google':
        return 'btn-google';
      case 'link':
        return 'text-primary-600 hover:text-primary-700 font-medium py-2 px-1 hover:underline transition-colors duration-200';
      default:
        return 'btn-primary';
    }
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = props.disabled ? 'opacity-60 cursor-not-allowed transform-none hover:transform-none' : '';

  return (
    <button
      className={`${getVariantClasses()} ${widthClass} ${disabledClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;