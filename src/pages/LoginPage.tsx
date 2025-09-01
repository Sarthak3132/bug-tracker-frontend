import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(formData.email, formData.password);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({ general: error.response?.data?.error || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authAPI.googleAuth();
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue">
      {/* Google OAuth Button */}
      <Button
        variant="google"
        fullWidth
        onClick={handleGoogleLogin}
        type="button"
        className="mb-4 sm:mb-6 text-sm sm:text-base py-2 sm:py-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative mb-4 sm:mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">or continue with email</span>
        </div>
      </div>

      {/* Login Form */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-xs sm:text-sm text-red-600 flex items-center gap-2">
            <span>⚠</span>
            {errors.general}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <div className="text-right">
          <Link to="/forgot-password">
            <Button variant="link" type="button">
              Forgot your password?
            </Button>
          </Link>
        </div>

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
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {/* Register Link */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">Don't have an account?</p>
        <Link to="/register">
          <Button variant="secondary" fullWidth className="text-sm sm:text-base py-2 sm:py-3">
            Create Account
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;