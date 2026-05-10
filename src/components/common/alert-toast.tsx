'use client';

import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface AlertToastProps {
  show: boolean;
  onClose: () => void;
  message: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
}

const AlertToast: React.FC<AlertToastProps> = ({
  show,
  onClose,
  message,
  variant = 'success',
}) => {
  const bgVariant = variant === 'danger' ? 'danger' : variant;

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
      <Toast 
        show={show} 
        onClose={onClose} 
        delay={3000} 
        autohide 
        bg={bgVariant}
      >
        <Toast.Header closeButton className="border-0">
          <strong className="me-auto text-capitalize">{variant}</strong>
        </Toast.Header>
        <Toast.Body className={variant === 'success' || variant === 'danger' ? 'text-white' : ''}>
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default AlertToast;
