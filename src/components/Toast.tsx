import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { NotificationType } from '../utils/notifications';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div<{ type: NotificationType; isExiting: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 300px;
  max-width: 400px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${props => props.isExiting ? slideOut : slideIn} 0.3s ease-out;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: #10b981;
          color: white;
        `;
      case 'error':
        return `
          background: #ef4444;
          color: white;
        `;
      case 'loading':
        return `
          background: #3b82f6;
          color: white;
        `;
      case 'info':
        return `
          background: #6b7280;
          color: white;
        `;
      default:
        return `
          background: #6b7280;
          color: white;
        `;
    }
  }}
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 18px;
`;

const Message = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

interface ToastProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose, duration = 3000 }) => {
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    if (type !== 'loading' && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [type, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'loading':
        return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>;
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <ToastContainer type={type} isExiting={isExiting}>
      <IconContainer>{getIcon()}</IconContainer>
      <Message>{message}</Message>
      {type !== 'loading' && (
        <CloseButton onClick={handleClose}>
          ×
        </CloseButton>
      )}
    </ToastContainer>
  );
};

export default Toast;