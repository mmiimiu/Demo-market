'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, FileText, CreditCard, Calendar, Wrench, Star, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface NotificationBellProps {
  isSolid: boolean;
  lang: 'th' | 'en' | 'cn';
}

const TYPE_CONFIG: Record<Notification['type'], { icon: React.ReactNode; color: string }> = {
  contract: { icon: <FileText className="w-3.5 h-3.5" />, color: 'text-primary bg-primary/10' },
  payment: { icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-emerald-600 bg-emerald-50' },
  viewing: { icon: <Calendar className="w-3.5 h-3.5" />, color: 'text-blue-500 bg-blue-50' },
  maintenance: { icon: <Wrench className="w-3.5 h-3.5" />, color: 'text-amber-500 bg-amber-50' },
  review: { icon: <Star className="w-3.5 h-3.5" />, color: 'text-yellow-500 bg-yellow-50' },
  system: { icon: <Info className="w-3.5 h-3.5" />, color: 'text-gray-500 bg-gray-100' },
};

export function NotificationBell({ isSolid, lang }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const isTh = lang === 'th';

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (n: Notification) => {
    markRead(n.id);
    if (n.href) router.push(n.href);
    setOpen(false);
  };

  const timeAgo = (ts: string) => {
    try {
      return formatDistanceToNow(new Date(ts), {
        addSuffix: true,
        locale: isTh ? th : undefined,
      });
    } catch {
      return '';
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all",
          isSolid
            ? "text-gray-600 hover:text-primary hover:bg-primary/5"
            : "text-white/80 hover:text-white hover:bg-white/10"
        )}
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 shadow-2xl rounded-2xl z-[200] animate-in slide-in-from-top-2 duration-150 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="font-black text-sm text-gray-900">
                {isTh ? 'การแจ้งเตือน' : lang === 'cn' ? '通知' : 'Notifications'}
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={markAllRead}
              className="text-[10px] font-black text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              {isTh ? 'อ่านทั้งหมด' : lang === 'cn' ? '全部已读' : 'Mark all read'}
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-bold">
                  {isTh ? 'ไม่มีการแจ้งเตือน' : lang === 'cn' ? '暂无通知' : 'No notifications'}
                </p>
              </div>
            ) : notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left",
                    !n.read && "bg-primary/[0.02]"
                  )}
                >
                  {/* Icon */}
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5", cfg.color)}>
                    {cfg.icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-xs font-black text-gray-900 leading-snug", !n.read && "text-primary")}>
                        {n.title}
                      </p>
                      {!n.read && <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />}
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold mt-0.5 leading-snug">{n.description}</p>
                    <p className="text-[10px] text-gray-300 font-bold mt-1">{timeAgo(n.timestamp)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
