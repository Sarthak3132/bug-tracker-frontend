import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authAPI } from '../services/api';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  // const navigate = useNavigate(); // Commented out as not used

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword(token!, formData.newPassword);
      setIsSuccess(true);
    } catch (error: any) {
      setErrors({ general: error.response?.data?.error || 'Failed to reset password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="This password reset link is invalid or has expired">
        <div className="text-center p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">⚠️</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-1 sm:mb-2">Link Expired</h3>
          <p className="text-red-700 text-xs sm:text-sm">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        
        <Link to="/forgot-password">
          <Button variant="primary" fullWidth className="text-sm sm:text-base py-2 sm:py-3">
            Request New Link
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Password Reset" subtitle="Your password has been successfully updated">
        <div className="text-center p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">✅</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-1 sm:mb-2">Password Updated!</h3>
          <p className="text-green-700 text-xs sm:text-sm">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>
        
        <Link to="/login">
          <Button variant="primary" fullWidth className="text-sm sm:text-base py-2 sm:py-3">
            Sign In
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password below">
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          label="New Password"
          placeholder="Enter your new password"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          required
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        {/* Password Strength Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-2">Password Requirements:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-center gap-2">
              <span className={formData.newPassword.length >= 6 ? 'text-green-500' : 'text-gray-400'}>✓</span>
              At least 6 characters long
            </li>
            <li className="flex items-center gap-2">
              <span className={/[A-Za-z]/.test(formData.newPassword) && /[0-9]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-400'}>✓</span>
              Contains both letters and numbers
            </li>
            <li className="flex items-center gap-2">
              <span className={/[^A-Za-z0-9]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-400'}>✓</span>
              Includes at least one special character
            </li>
          </ul>
        </div>

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs sm:text-sm text-red-600 flex items-center gap-2">
              <span>⚠</span>
              {errors.general}
            </p>
          </div>
        )}

        <Button
          variant="primary"
          type="submit"
          fullWidth
          disabled={isLoading}
          className="mt-4 sm:mt-6 text-sm sm:text-base py-2 sm:py-3"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Setting Password...
            </div>
          ) : (
            'Set New Password'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;