'use client';

import React from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification, NotificationType } from './types';
import { translations } from './translations';

interface NotificationItemProps {
  notification: Notification;
  lang: 'th' | 'en' | 'cn';
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onActionClick?: (notification: Notification) => void;
}

export function NotificationItem({ notification, lang, onMarkAsRead, onDelete, onActionClick }: NotificationItemProps) {
  const t = translations[lang];

  const typeConfig: Record<NotificationType, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
    info: {
      icon: <Info className="w-4 h-4" />,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4" />,
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    success: {
      icon: <CheckCircle className="w-4 h-4" />,
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-100',
    },
    error: {
      icon: <XCircle className="w-4 h-4" />,
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
    },
  };

  const config = typeConfig[notification.type];

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t.timeAgo.justNow;
    if (minutes < 60) return t.timeAgo.minutesAgo.replace('{n}', minutes.toString());
    if (hours < 24) return t.timeAgo.hoursAgo.replace('{n}', hours.toString());
    return t.timeAgo.daysAgo.replace('{n}', days.toString());
  };

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all hover:shadow-md',
        notification.read ? 'bg-white border-gray-100' : 'bg-white border-[#E51D53]/20 shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.bg, config.text)}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={cn('font-bold text-sm', notification.read ? 'text-gray-700' : 'text-gray-900')}>
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="px-2 py-0.5 bg-[#E51D53] text-white text-[9px] font-bold rounded-full shrink-0">
                {t.new}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{notification.message}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium">{getTimeAgo(notification.timestamp)}</span>
            <div className="flex items-center gap-2">
              {notification.actionUrl && (
                <button
                  onClick={() => onActionClick?.(notification)}
                  className="text-[10px] font-bold text-[#E51D53] hover:underline"
                >
                  {notification.actionLabel || 'View'}
                </button>
              )}
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead?.(notification.id)}
                  className="text-[10px] font-bold text-gray-400 hover:text-gray-600"
                >
                  {t.markAsRead}
                </button>
              )}
              <button
                onClick={() => onDelete?.(notification.id)}
                className="text-[10px] font-bold text-gray-400 hover:text-red-600"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
