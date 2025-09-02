import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.span`
  color: #6b7280;
  font-size: 14px;
`;

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'small' 
}) => {
  const spinnerSize = size === 'small' ? '16px' : size === 'medium' ? '24px' : '32px';
  
  return (
    <SpinnerContainer>
      <Spinner style={{ width: spinnerSize, height: spinnerSize }} />
      {message && <LoadingText>{message}</LoadingText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;