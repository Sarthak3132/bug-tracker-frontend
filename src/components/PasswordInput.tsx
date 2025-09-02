import React, { useState } from 'react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, error, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-4 sm:mb-6">
      <label 
        htmlFor={props.id} 
        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          className={`input-field text-sm sm:text-base py-2 sm:py-3 pr-10 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''} ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      {error && (
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;