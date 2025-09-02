import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-lg">
              🐛
            </div>
            {!isCollapsed && (
              <h1 className="font-bold text-lg bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                BugTracker
              </h1>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          {user?.avatar ? (
            <img
              src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${user.avatar}`}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold ${user?.avatar ? 'hidden' : ''}`}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user?.name?.split(' ')[0] || 'User'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-lg">📊</span>
            {!isCollapsed && <span>Dashboard</span>}
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-lg">👤</span>
            {!isCollapsed && <span>Profile Settings</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="text-lg">🔔</span>
            {!isCollapsed && <span>Notifications</span>}
          </button>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="secondary"
          fullWidth={!isCollapsed}
          onClick={handleLogout}
          className={`${isCollapsed ? 'px-2' : ''}`}
        >
          {isCollapsed ? '🚪' : 'Logout'}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;