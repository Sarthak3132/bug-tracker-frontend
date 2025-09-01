import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const navigate = useNavigate();
  const { login } = useAuth();

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
      const response = await authAPI.register(formData.name, formData.email, formData.password);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({ general: error.response?.data?.error || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join us and start tracking bugs efficiently">
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
          id="name"
          name="name"
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

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
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-2">Password Requirements:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-center gap-2">
              <span className={formData.password.length >= 6 ? 'text-green-500' : 'text-gray-400'}>✓</span>
              At least 6 characters long
            </li>
            <li className="flex items-center gap-2">
              <span className={/[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}>✓</span>
              Contains both letters and numbers
            </li>
            <li className="flex items-center gap-2">
              <span className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}>✓</span>
              Includes at least one special character
            </li>
          </ul>
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
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">Already have an account?</p>
        <Link to="/login">
          <Button variant="secondary" fullWidth className="text-sm sm:text-base py-2 sm:py-3">
            Sign In
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;