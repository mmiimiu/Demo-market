'use client';

import React, { useState } from 'react';
import { Bell, X, CheckCircle2, Home, MessageSquare, Calendar, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, type NotificationType } from '@/contexts/NotificationContext';
import { NotificationPreferences } from './NotificationPreferences';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const iconMap: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  error: <X className="w-4 h-4 text-red-500" />,
  warning: <X className="w-4 h-4 text-yellow-500" />,
  info: <Bell className="w-4 h-4 text-blue-500" />,
  new_property: <Home className="w-4 h-4 text-primary" />,
  property_update: <Home className="w-4 h-4 text-primary" />,
  chat_message: <MessageSquare className="w-4 h-4 text-primary" />,
  booking: <Calendar className="w-4 h-4 text-primary" />,
  system: <Bell className="w-4 h-4 text-gray-500" />
};

const colorMap: Record<NotificationType, string> = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
  new_property: 'bg-primary/5 border-primary/20',
  property_update: 'bg-primary/5 border-primary/20',
  chat_message: 'bg-primary/5 border-primary/20',
  booking: 'bg-primary/5 border-primary/20',
  system: 'bg-gray-50 border-gray-200'
};

export function NotificationCenter() {
  const { notifications, removeNotification, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();
  const { lang } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const ui = {
    title:        lang === 'th' ? 'การแจ้งเตือน' : lang === 'cn' ? '通知' : 'Notifications',
    markAllRead:  lang === 'th' ? 'อ่านทั้งหมด'  : lang === 'cn' ? '全部已读' : 'Mark all read',
    all:          lang === 'th' ? 'ทั้งหมด'        : lang === 'cn' ? '全部' : 'All',
    unread:       lang === 'th' ? 'ยังไม่อ่าน'    : lang === 'cn' ? '未读' : 'Unread',
    empty:        lang === 'th' ? 'ยังไม่มีการแจ้งเตือน' : lang === 'cn' ? '暂无通知' : 'No notifications yet',
    settings:     lang === 'th' ? 'ตั้งค่าการแจ้งเตือน' : lang === 'cn' ? '通知设置' : 'Notification Settings',
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (lang === 'th') {
      if (minutes < 1) return 'เมื่อกี้';
      if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
      if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
      return `${days} วันที่แล้ว`;
    } else if (lang === 'cn') {
      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      return `${days}天前`;
    } else {
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 pointer-events-auto" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">{ui.title}</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      {ui.markAllRead}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearAll}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  {ui.all}
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  {ui.unread}
                </Button>
              </div>
            </div>

            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Bell className="w-12 h-12 mb-2" />
                  <p className="text-sm">{ui.empty}</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border mb-2 cursor-pointer transition-all hover:shadow-md",
                        colorMap[notification.type],
                        !notification.read && "border-l-4 border-l-primary"
                      )}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.action) {
                          if (typeof notification.action.onClick === 'function') {
                            notification.action.onClick();
                          } else if (notification.action.url) {
                            window.location.href = notification.action.url;
                          }
                          setIsOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {iconMap[notification.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm text-gray-900">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.action && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-xs mt-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                                if (typeof notification.action!.onClick === 'function') {
                                  notification.action!.onClick();
                                } else if (notification.action!.url) {
                                  window.location.href = notification.action!.url;
                                }
                                setIsOpen(false);
                              }}
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-3 border-t border-gray-100">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowPreferences(true)}>
                <Settings className="w-4 h-4 mr-2" />
                {ui.settings}
              </Button>
            </div>
          </div>
        </>
      )}

      <NotificationPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        lang={lang}
      />
    </div>
  );
}
