'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell, Home, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/contexts/NotificationContext';

interface ToastProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  new_property: <Home className="w-5 h-5 text-primary" />,
  property_update: <Home className="w-5 h-5 text-primary" />,
  chat_message: <MessageSquare className="w-5 h-5 text-primary" />,
  booking: <Calendar className="w-5 h-5 text-primary" />,
  system: <Bell className="w-5 h-5 text-gray-500" />
};

const colorMap: Record<NotificationType, string> = {
  success: 'border-green-500 bg-green-50',
  error: 'border-red-500 bg-red-50',
  warning: 'border-yellow-500 bg-yellow-50',
  info: 'border-blue-500 bg-blue-50',
  new_property: 'border-primary bg-primary/5',
  property_update: 'border-primary bg-primary/5',
  chat_message: 'border-primary bg-primary/5',
  booking: 'border-primary bg-primary/5',
  system: 'border-gray-500 bg-gray-50'
};

export function NotificationToast({ id, type, title, message, onClose, action }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-300 transform",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className={cn(
        "bg-white rounded-xl shadow-2xl border-l-4 p-4 flex items-start gap-3",
        colorMap[type]
      )}>
        <div className="flex-shrink-0 mt-0.5">
          {iconMap[type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
          <p className="text-gray-600 text-sm line-clamp-2">{message}</p>
          
          {action && (
            <button
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className="mt-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <NotificationToast
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            action={toast.action}
            onClose={() => onClose(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
