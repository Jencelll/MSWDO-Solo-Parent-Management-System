import React from 'react';
import { useNotification } from './NotificationContext';
import { NotificationItem } from './NotificationItem';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-end px-4 py-6 sm:items-end sm:p-6 space-y-4"
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
};
