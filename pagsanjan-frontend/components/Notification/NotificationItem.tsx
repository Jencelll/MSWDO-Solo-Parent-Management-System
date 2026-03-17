import React, { useEffect, useState } from 'react';
import { Notification } from './types';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const styles = {
  success: 'border-l-emerald-500 bg-white dark:bg-slate-800',
  error: 'border-l-rose-500 bg-white dark:bg-slate-800',
  warning: 'border-l-amber-500 bg-white dark:bg-slate-800',
  info: 'border-l-blue-500 bg-white dark:bg-slate-800',
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleDismiss = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Wait for exit animation
  };

  return (
    <div
      role="alert"
      className={`
        w-full max-w-sm pointer-events-auto overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 
        border-l-4 transition-all duration-300 ease-in-out transform
        ${styles[notification.type]}
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[notification.type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {notification.title && (
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                {notification.title}
              </p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-transparent text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              onClick={handleDismiss}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
