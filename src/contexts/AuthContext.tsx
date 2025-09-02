import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authUtils } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authUtils.getToken();
      if (token) {
        try {
          // Make a request to validate token and get user data
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, remove it
            authUtils.removeToken();
          }
        } catch (error) {
          // Token validation failed, remove it
          authUtils.removeToken();
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    console.log('AuthContext login - token:', token);
    console.log('AuthContext login - userData:', userData);
    authUtils.saveToken(token);
    setUser(userData);
  };

  const logout = () => {
    authUtils.removeToken();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};