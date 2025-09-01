import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4 sm:mb-6">
      <label 
        htmlFor={props.id} 
        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
      >
        {label}
      </label>
      <input
        className={`input-field text-sm sm:text-base py-2 sm:py-3 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;