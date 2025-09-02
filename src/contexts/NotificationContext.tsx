import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast from '../components/Toast';
import { NotificationType, Notification } from '../utils/notifications';

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showLoading: (message: string) => () => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: NotificationType, message: string, duration?: number) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message: string) => {
    showNotification('success', message, 3000);
  };

  const showError = (message: string) => {
    showNotification('error', message, 5000);
  };

  const showLoading = (message: string) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type: 'loading', message };
    
    setNotifications(prev => [...prev, notification]);
    
    // Return function to dismiss loading
    return () => removeNotification(id);
  };

  const showInfo = (message: string) => {
    showNotification('info', message, 3000);
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showLoading,
      showInfo
    }}>
      {children}
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};