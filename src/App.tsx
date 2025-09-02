import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BreadcrumbProvider } from './contexts/BreadcrumbContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ProfilePage from './pages/ProfilePage';
import MyBugs from './pages/MyBugs';
import BugDetail from './pages/BugDetail';
import OAuthCallback from './pages/OAuthCallback';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BreadcrumbProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:projectId" 
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-bugs" 
              element={
                <ProtectedRoute>
                  <MyBugs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:projectId/bugs/:bugId" 
              element={
                <ProtectedRoute>
                  <BugDetail />
                </ProtectedRoute>
              } 
            />
            <Route path="/oauth-callback" element={<OAuthCallback />} />
          </Routes>
        </Router>
        </BreadcrumbProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;