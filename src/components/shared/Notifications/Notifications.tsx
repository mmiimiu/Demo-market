'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { translations } from './translations';
import { Notification } from './types';
import { NotificationItem } from './NotificationItem';
import { NotificationsProps } from './types';

export function Notifications({ lang, notifications, onMarkAsRead, onMarkAllAsRead, onDelete, onActionClick }: NotificationsProps) {
  const t = translations[lang];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#E51D53]" />
          <h3 className="text-lg font-black text-gray-900">{t.title}</h3>
          {unreadCount > 0 && (
            <Badge className="bg-[#E51D53] text-white font-bold rounded-full px-2.5 py-0.5 text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 rounded-xl"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              {t.markAllAsRead}
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">{t.noNotifications}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              lang={lang}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
              onActionClick={onActionClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
