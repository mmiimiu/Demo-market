import React from 'react';
import { Notifications } from '@/components/shared/Notifications';
import { useNotifications } from '@/contexts/NotificationContext';

interface OwnerNotificationsTabProps {
  isThai: boolean;
  isChinese: boolean;
}

export function OwnerNotificationsTab({ isThai, isChinese }: OwnerNotificationsTabProps) {
  const lang: 'th' | 'en' | 'cn' = isThai ? 'th' : isChinese ? 'cn' : 'en';
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  const filteredNotifications = notifications
    .filter(n => {
      // Owners should not see administrative system alerts
      return !n.id.startsWith('mock_admin_');
    })
    .map(n => {
      let destUrl = undefined;
      if (n.id.startsWith('welcome_signup_') || n.id === 'mock_welcome_signup') {
        destUrl = '/profile';
      } else if (n.id === 'mock_price_wishlist') {
        destUrl = '/profile';
      } else if (n.id === 'mock_new_in_zone' || n.id === 'mock_saved_search_match') {
        destUrl = '/listings';
      } else if (n.id === 'mock_line_chat_message') {
        destUrl = '/chat';
      } else if (n.id.startsWith('mock_appointment_')) {
        destUrl = '/owner/dashboard?tab=properties';
      } else if (n.id === 'mock_contract_expiry_30_days') {
        destUrl = '/owner/dashboard?tab=contracts';
      } else if (n.id === 'mock_monthly_invoice_alert') {
        destUrl = '/owner/dashboard?tab=billing';
      } else if (n.id.startsWith('mock_expiry_')) {
        destUrl = '/owner/dashboard?tab=properties';
      }

      return {
        id: n.id,
        type: (n.type === 'new_property' || n.type === 'property_update' || n.type === 'chat_message' || n.type === 'booking' || n.type === 'system')
          ? 'info' as const
          : n.type as 'success' | 'error' | 'warning' | 'info',
        title: n.title,
        message: n.message,
        timestamp: n.timestamp,
        read: n.read,
        actionLabel: n.action?.label || (destUrl ? (isThai ? 'เปิดดู' : 'View') : undefined),
        actionUrl: destUrl || (n.action ? '#' : undefined),
        _original: n
      };
    });

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (id: string) => {
    removeNotification(id);
  };

  const handleActionClick = (notification: any) => {
    const orig = notification._original;
    if (orig && orig.action && orig.action.onClick) {
      orig.action.onClick();
    } else if (notification.actionUrl && notification.actionUrl !== '#') {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <Notifications
      lang={lang}
      notifications={filteredNotifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDelete={handleDelete}
      onActionClick={handleActionClick}
    />
  );
}
