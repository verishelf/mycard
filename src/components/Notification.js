'use client';

import { useEffect, useState } from 'react';

const Notification = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`notification ${show ? 'show' : ''}`}>
      {message}
    </div>
  );
};

export default Notification;
