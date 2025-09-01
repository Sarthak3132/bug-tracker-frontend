import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authAPI } from '../services/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.forgotPassword(email);
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Check Your Email" subtitle="We've sent you a password reset link">
        <div className="text-center p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">📧</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-1 sm:mb-2">Email Sent!</h3>
          <p className="text-green-700 text-xs sm:text-sm">
            We've sent a password reset link to <strong className="font-medium">{email}</strong>.
            Please check your inbox and follow the instructions to reset your password.
          </p>
        </div>
        
        <Link to="/login">
          <Button variant="primary" fullWidth className="text-sm sm:text-base py-2 sm:py-3">
            Back to Sign In
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a reset link">
      <Link 
        to="/login" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 text-xs sm:text-sm mb-4 sm:mb-6 transition-colors duration-200"
      >
        <span>←</span>
        Back to Sign In
      </Link>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email address"
          value={email}
          onChange={handleChange}
          error={error}
          required
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-blue-500 text-base sm:text-lg">💡</span>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1">What happens next?</h4>
              <p className="text-xs text-blue-700">
                We'll send you a secure link to reset your password. The link will expire in 1 hour for security.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          type="submit"
          fullWidth
          disabled={isLoading}
          className="text-sm sm:text-base py-2 sm:py-3"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </div>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;