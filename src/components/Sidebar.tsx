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
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 z-50 flex flex-col h-screen
        md:fixed md:top-0 md:left-0
        ${isCollapsed 
          ? 'fixed -translate-x-full md:translate-x-0 w-48 sm:w-56 md:w-60 lg:w-16' 
          : 'fixed translate-x-0 w-48 sm:w-56 md:w-60 lg:w-64'
        }
      `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 relative">
        <div 
          className={`flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          onClick={onToggle}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-lg">
            🐛
          </div>
          {!isCollapsed && (
            <h1 className="font-bold text-lg bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              BugTracker
            </h1>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="absolute top-4 right-2 p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200 text-gray-400 hover:text-gray-600 hover:scale-110"
            title="Collapse sidebar"
          >
            «
          </button>
        )}
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
            onClick={() => {
              navigate('/dashboard');
              // Don't auto-close on tablet/desktop, only on mobile
              if (window.innerWidth < 768) {
                onToggle();
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-lg">📊</span>
            {!isCollapsed && <span>Dashboard</span>}
          </button>
          <button 
            onClick={() => {
              navigate('/profile');
              if (window.innerWidth < 768) {
                onToggle();
              }
            }}
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
    </>
  );
};

export default Sidebar;