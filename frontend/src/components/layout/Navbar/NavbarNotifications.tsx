'use client';

import React, { useState } from 'react';
import { Bell, Check, X, ExternalLink, CheckCircle2, Home, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useNotifications, type NotificationType } from '@/contexts/NotificationContext';
import { useUser } from '@/firebase';

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

interface NavbarNotificationsProps {
  lang: Language;
}

export const NavbarNotifications: React.FC<NavbarNotificationsProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useUser();

  const filteredNotifications = notifications.filter(n => {
    const localRole = typeof window !== 'undefined' ? localStorage.getItem('primerent_user_role') : null;
    const userRole = localRole || user?.role || 'tenant';
    const isAdmin = userRole === 'admin' || userRole === 'superadmin' || user?.email?.includes('admin');
    const isOwnerOrAgent = userRole === 'owner' || userRole === 'landlord' || userRole === 'agent';
    const isRenter = userRole === 'renter' || userRole === 'tenant';
    const isGeneralUser = userRole === 'user';

    if (isAdmin) {
      // Admins should ONLY see System/Admin related alerts
      return n.id.startsWith('mock_admin_') || n.title.includes('[System Alert]');
    }

    // Non-admins should NOT see admin alerts
    if (n.id.startsWith('mock_admin_') || n.title.includes('[System Alert]')) {
      return false;
    }

    // General Users (who are not renters/owners/agents yet) should ONLY see welcome/onboarding alerts
    if (isGeneralUser) {
      return n.id.startsWith('welcome_signup_') || n.id === 'mock_welcome_signup';
    }

    // Owner/Agent specific alerts (like ad expiry)
    if (n.id.startsWith('mock_expiry_')) {
      return isOwnerOrAgent;
    }

    // Tenant/Owner/Agent specific alerts (like contract expiry, monthly rent billing, appointments)
    if (n.id.startsWith('mock_contract_') || n.id === 'mock_monthly_invoice_alert' || n.id.startsWith('mock_appointment_')) {
      return isRenter || isOwnerOrAgent;
    }

    return true;
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleNotificationClick = (notification: any) => {
    handleMarkAsRead(notification.id);
    setIsOpen(false);

    const localRole = typeof window !== 'undefined' ? localStorage.getItem('primerent_user_role') : null;
    const userRole = localRole || user?.role || 'tenant';
    const isOwner = userRole === 'owner' || userRole === 'landlord';
    const isAgent = userRole === 'agent';
    const isOwnerOrAgent = isOwner || isAgent;

    // ✅ FIX: ถ้า notification มี action.url แต่เป็น /owner/dashboard และ role เป็น agent
    // ให้ remap ไปที่ /agent/dashboard แทน ไม่งั้น agent จะถูก push ไป owner page
    if (notification.action?.url) {
      let targetUrl = notification.action.url;
      if (isAgent && targetUrl.startsWith('/owner/dashboard')) {
        targetUrl = targetUrl.replace('/owner/dashboard', '/agent/dashboard');
      }
      router.push(targetUrl);
      return;
    }
    if (notification.action && typeof notification.action.onClick === 'function') {
      notification.action.onClick();
      return;
    }

    const id = notification.id;
    const title = notification.title || '';

    if (id.startsWith('mock_admin_') || title.includes('[System Alert]')) {
      router.push('/admin/dashboard');
    } else if (id.startsWith('welcome_signup_') || id === 'mock_welcome_signup') {
      router.push('/profile');
    } else if (id === 'mock_price_wishlist') {
      router.push('/listings?open=1');
    } else if (id === 'mock_new_in_zone' || id === 'mock_saved_search_match') {
      router.push('/listings');
    } else if (id === 'mock_line_chat_message') {
      router.push('/chat');
    } else if (id.startsWith('mock_appointment_')) {
      if (isAgent) {
        router.push('/agent/dashboard');
      } else if (isOwner) {
        router.push('/owner/dashboard?tab=properties');
      } else {
        router.push('/tenant/dashboard');
      }
    } else if (id === 'mock_contract_expiry_30_days') {
      if (isAgent) {
        router.push('/agent/dashboard');
      } else if (isOwner) {
        router.push('/owner/dashboard?tab=contracts');
      } else {
        router.push('/tenant/contract');
      }
    } else if (id === 'mock_monthly_invoice_alert') {
      if (isAgent) {
        router.push('/agent/dashboard');
      } else if (isOwner) {
        router.push('/owner/dashboard?tab=billing');
      } else {
        router.push('/tenant/billing');
      }
    } else if (id.startsWith('mock_expiry_')) {
      if (isAgent) {
        router.push('/agent/dashboard');
      } else {
        router.push('/owner/dashboard?tab=properties');
      }
    }
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center border text-gray-400 hover:text-gray-600 transition-all rounded-lg sm:rounded-xl",
          isOpen
            ? "border-blue-300 text-blue-600 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 sm:-top-1 sm:-right-1 bg-red-500 text-white border-none text-[8px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 rounded-full">
            {unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-[-60px] sm:right-0 top-full mt-2 w-[280px] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-black text-gray-900 text-sm">
                {lang === 'th' ? 'การแจ้งเตือน' : lang === 'cn' ? '通知' : 'Notifications'}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  {lang === 'th' ? 'อ่านทั้งหมด' : lang === 'cn' ? '全部已读' : 'Mark all read'}
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">
                    {lang === 'th' ? 'ไม่มีการแจ้งเตือน' : lang === 'cn' ? '暂无通知' : 'No notifications'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                  className={cn(
                      "px-4 py-3 border-b border-gray-50 cursor-pointer transition-all duration-200 group hover:bg-blue-50/60 hover:pl-5 active:bg-blue-100/50",
                      !notification.read && "bg-blue-50/40 border-l-2 border-l-blue-400"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {iconMap[notification.type] || <Bell className="w-4 h-4 text-gray-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-bold text-gray-900 mb-1",
                          !notification.read && "text-gray-900"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-medium">
                            {formatTime(notification.timestamp)}
                          </span>
                          {notification.action && (
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <Button
                  variant="ghost"
                  className="w-full h-9 text-xs font-bold text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    const localRole = typeof window !== 'undefined' ? localStorage.getItem('primerent_user_role') : null;
                    const userRole = localRole || 'renter';
                    if (userRole === 'admin' || userRole === 'superadmin') router.push('/admin');
                    else if (userRole === 'landlord' || userRole === 'owner') router.push('/owner/dashboard');
                    else if (userRole === 'agent') router.push('/agent/dashboard');
                    else router.push('/tenant/dashboard');
                    setIsOpen(false);
                  }}
                >
                  {lang === 'th' ? 'ดูการแจ้งเตือนทั้งหมด' : lang === 'cn' ? '查看所有通知' : 'View all notifications'}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
