import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'User'}!</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">🎉 Authentication Complete!</h2>
            <p className="text-blue-700 text-sm">
              You have successfully logged in. This is your protected dashboard area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;