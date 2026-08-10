'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, Home, MessageSquare, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface NotificationPreferences {
  newProperties: boolean;
  propertyUpdates: boolean;
  chatMessages: boolean;
  bookings: boolean;
  system: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const defaultPreferences: NotificationPreferences = {
  newProperties: true,
  propertyUpdates: true,
  chatMessages: true,
  bookings: true,
  system: true,
  emailNotifications: false,
  pushNotifications: true
};

interface NotificationPreferencesProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'th' | 'en' | 'cn';
}

export function NotificationPreferences({ isOpen, onClose, lang }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  useEffect(() => {
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    localStorage.setItem('notification_preferences', JSON.stringify(newPreferences));
  };

  const t = {
    title:          lang === 'th' ? 'ตั้งค่าการแจ้งเตือน'            : lang === 'cn' ? '通知设置'       : 'Notification Settings',
    subtitle:       lang === 'th' ? 'จัดการการแจ้งเตือนที่คุณต้องการรับ' : lang === 'cn' ? '管理您希望接收的通知'  : 'Manage the notifications you want to receive',
    categories:     lang === 'th' ? 'ประเภทการแจ้งเตือน'              : lang === 'cn' ? '通知类别'       : 'Notification Categories',
    delivery:       lang === 'th' ? 'วิธีการรับแจ้งเตือน'             : lang === 'cn' ? '接收方式'       : 'Delivery Methods',
    newProperties:  lang === 'th' ? 'ประกาศใหม่'                     : lang === 'cn' ? '新房源'         : 'New Properties',
    propertyUpdates:lang === 'th' ? 'อัปเดตทรัพย์สิน'                : lang === 'cn' ? '房源更新'       : 'Property Updates',
    chatMessages:   lang === 'th' ? 'ข้อความแชท'                     : lang === 'cn' ? '聊天消息'       : 'Chat Messages',
    bookings:       lang === 'th' ? 'การจอง'                          : lang === 'cn' ? '预约'           : 'Bookings',
    system:         lang === 'th' ? 'ระบบ'                            : lang === 'cn' ? '系统通知'       : 'System',
    email:          lang === 'th' ? 'อีเมล'                           : lang === 'cn' ? '电子邮件'       : 'Email',
    push:           lang === 'th' ? 'การแจ้งเตือนแบบพุช'              : lang === 'cn' ? '推送通知'       : 'Push Notifications',
    save:           lang === 'th' ? 'บันทึก'                          : lang === 'cn' ? '保存'           : 'Save',
    cancel:         lang === 'th' ? 'ยกเลิก'                          : lang === 'cn' ? '取消'           : 'Cancel',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-50 duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Notification Categories */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {t.categories}
            </h3>
            <div className="space-y-3">
              <PreferenceItem
                icon={<Home className="w-4 h-4" />}
                label={t.newProperties}
                checked={preferences.newProperties}
                onToggle={() => handleToggle('newProperties')}
              />
              <PreferenceItem
                icon={<Home className="w-4 h-4" />}
                label={t.propertyUpdates}
                checked={preferences.propertyUpdates}
                onToggle={() => handleToggle('propertyUpdates')}
              />
              <PreferenceItem
                icon={<MessageSquare className="w-4 h-4" />}
                label={t.chatMessages}
                checked={preferences.chatMessages}
                onToggle={() => handleToggle('chatMessages')}
              />
              <PreferenceItem
                icon={<Calendar className="w-4 h-4" />}
                label={t.bookings}
                checked={preferences.bookings}
                onToggle={() => handleToggle('bookings')}
              />
              <PreferenceItem
                icon={<Bell className="w-4 h-4" />}
                label={t.system}
                checked={preferences.system}
                onToggle={() => handleToggle('system')}
              />
            </div>
          </div>

          {/* Delivery Methods */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t.delivery}</h3>
            <div className="space-y-3">
              <PreferenceItem
                icon={<Check className="w-4 h-4" />}
                label={t.email}
                checked={preferences.emailNotifications}
                onToggle={() => handleToggle('emailNotifications')}
              />
              <PreferenceItem
                icon={<Check className="w-4 h-4" />}
                label={t.push}
                checked={preferences.pushNotifications}
                onToggle={() => handleToggle('pushNotifications')}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={onClose}>
            {t.save}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PreferenceItemProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onToggle: () => void;
}

function PreferenceItem({ icon, label, checked, onToggle }: PreferenceItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}
