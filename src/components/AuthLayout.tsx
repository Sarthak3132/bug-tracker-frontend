import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="card p-4 sm:p-6 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-xl sm:text-2xl animate-bounce-gentle">
                🐛
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                BugTracker
              </h1>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">{title}</h2>
            <p className="text-gray-600 text-xs sm:text-sm">{subtitle || `${title} to continue`}</p>
          </div>
          
          {/* Content */}
          {children}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Secure • Professional • Reliable
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;