'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'new_property' | 'property_update' | 'chat_message' | 'booking' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick?: () => void;
    url?: string;
  };
  propertyId?: number | string;
  chatId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ⚠️ [TEST MODE] Always load fresh mock data on every page load.
  // Notifications reset on refresh but work normally within the session.
  useEffect(() => {
    // Reset contracts state on reload for testing
    if (typeof window !== 'undefined') {
      localStorage.removeItem('contracts');
    }
    // Always start with empty list — mock data is injected below every time
    let list: any[] = [];

    // Handle dynamic signup welcome notification from RegisterForm
    if (typeof window !== 'undefined') {
      const showWelcome = localStorage.getItem('primerent_show_welcome_notification');
      if (showWelcome === 'true') {
        localStorage.removeItem('primerent_show_welcome_notification');
        const welcomeId = 'welcome_signup_' + Date.now();
        list = [
          {
            id: welcomeId,
            type: 'success' as NotificationType,
            title: '🎉 สมัครสมาชิกสำเร็จ (Welcome & Onboarding)',
            message: 'ยินดีต้อนรับสู่ PrimeRent! คู่มือเริ่มต้นใช้งาน (Onboarding Guide) และข้อมูลแนะนำเบื้องต้นได้ถูกส่งไปที่อีเมลของคุณเรียบร้อยแล้ว',
            read: false,
            timestamp: new Date().toISOString(),
          },
          ...list
        ];
      }
    }

    // Always inject the full mock notification list (resets on every refresh)
    list = [
      {
        id: 'mock_expiry_7_days',
        type: 'warning' as NotificationType,
        title: '⚠️ ประกาศใกล้หมดอายุ (อีก 7 วัน)',
        message: 'ประกาศ "Sukhumvit Luxury Condo 2BR" ของคุณใกล้หมดอายุในอีก 7 วัน สามารถต่ออายุได้ผ่าน Line OA หรือหน้าเว็บในคลิกเดียว',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        // action url uses /owner/dashboard — NavbarNotifications will remap to /agent/dashboard for agent role
        action: { label: 'ต่ออายุ 1-Click', url: '/owner/dashboard?tab=properties' }
      },
      {
        id: 'mock_expiry_1_day',
        type: 'error' as NotificationType,
        title: '🚨 ประกาศใกล้หมดอายุ (อีก 24 ชั่วโมง)',
        message: 'ประกาศ "เดอะ พาร์ค ชิดลม" ของคุณจะหมดอายุใน 1 วัน กรุณาต่ออายุผ่านหน้าเว็บทันที',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        // action url uses /owner/dashboard — NavbarNotifications will remap to /agent/dashboard for agent role
        action: { label: 'ต่ออายุ 1-Click', url: '/owner/dashboard?tab=properties' }
      },
      {
        id: 'mock_price_wishlist',
        type: 'info' as NotificationType,
        title: '❤️ ราคาลดลง! (Wishlist Alert)',
        message: 'คอนโดที่คุณบันทึกใน Wishlist "Sukhumvit Luxury Condo 2BR" ลดค่าเช่าลง ฿2,000 (จาก ฿28,000 เหลือ ฿26,000/เดือน) คลิกเพื่อดูดีล',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        action: { label: '🏠 ดูดีลนี้', url: '/listings?open=1' }
      },
      {
        id: 'mock_new_in_zone',
        type: 'info' as NotificationType,
        title: '📍 มีประกาศใหม่ในย่านที่คุณสนใจ',
        message: 'ย่านสุขุมวิท/อโศก มีประกาศห้องเช่าใหม่ลงทะเบียนตรงความต้องการที่คุณบันทึกฟิลเตอร์ไว้',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
      },
      {
        id: 'mock_saved_search_match',
        type: 'new_property' as NotificationType,
        title: '⭐️ Saved Search Alert (BTS Radius 500m)',
        message: 'พบคอนโดห้องใหม่ตรงตามเงื่อนไขฟิลเตอร์ที่คุณบันทึกไว้ ระบบได้ส่งการแจ้งเตือนผลลัพธ์ผ่านทางอีเมลและ App Push แล้ว',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 15 * 60).toISOString(),
      },
      {
        id: 'mock_line_chat_message',
        type: 'chat_message' as NotificationType,
        title: '💬 ข้อความใหม่ผ่าน LineOA (Real-time Alert)',
        message: 'คุณได้รับข้อความใหม่จากเอเจนต์ นพดล เจริญวงศ์ [ส่งแจ้งเตือนด่วนและขึ้น Badge count บนไอคอน LINE OA แล้ว]',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30 * 60).toISOString(),
      },
      {
        id: 'mock_appointment_reminder_24h',
        type: 'booking' as NotificationType,
        title: '📅 [Reminder 24hr] แจ้งเตือนนัดดูห้องพรุ่งนี้',
        message: 'มีนัดหมายดูห้อง Ideo Mix Sukhumvit พรุ่งนี้เวลา 14:00 น. (Agent: นพดล) รายละเอียด วันเวลา/สถานที่/แผนที่/ชื่อ Agent ส่งไปที่ LINE OA ลูกค้าเรียบร้อยแล้ว',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 45 * 60).toISOString(),
      },
      {
        id: 'mock_appointment_reminder_1h',
        type: 'booking' as NotificationType,
        title: '📅 [Reminder 1hr] อีก 1 ชั่วโมงพบนัดหมาย',
        message: 'อีก 1 ชั่วโมงจะมีนัดดูห้อง Ideo Mix Sukhumvit เวลา 14:00 น. กรุณาเตรียมตัวและตรวจสอบแผนที่การเดินทางผ่าน LINE OA',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 50 * 60).toISOString(),
      },
      {
        id: 'mock_contract_expiry_30_days',
        type: 'warning' as NotificationType,
        title: '📝 แจ้งเตือนวันหมดสัญญา (อีก 30 วัน)',
        message: 'สัญญาเช่าห้องพักเลขที่ Rent-A1204 ของคุณจะหมดอายุในอีก 30 วัน กรุณาตรวจสอบหรือยื่นเรื่องต่อสัญญา',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 180 * 60).toISOString(),
      },
      {
        id: 'mock_monthly_invoice_alert',
        type: 'info' as NotificationType,
        title: '💵 แจ้งเรียกเก็บบิลรายเดือน (Invoice Alert)',
        message: 'บิลค่าเช่าประจำเดือน กรกฎาคม 2026 ยอด ฿15,000 ถูกส่งไปยัง LineOA และระบบในหน้าเว็บของท่านแล้ว สามารถคลิกชำระเงินได้ทันที',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 240 * 60).toISOString(),
      },
      {
        id: 'mock_admin_security_alert',
        type: 'error' as NotificationType,
        title: '🚨 [System Alert] Security Incident',
        message: 'พบการล็อคอินล้มเหลวหลายครั้งผิดปกติจาก IP 192.168.1.100 บล็อกไอพีชั่วคราวแล้ว [SA/Admin Only]',
        read: false,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'mock_admin_error_alert',
        type: 'warning' as NotificationType,
        title: '⚠️ [System Alert] System Error',
        message: 'ระบบชำระเงิน Omise API Gateway เกิดความล่าช้า (Idempotency key บล็อกการจ่ายซ้ำสำเร็จ) [SA/Admin Only]',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: 'mock_admin_kyc_pending',
        type: 'warning' as NotificationType,
        title: '📝 [System Alert] คำขอ KYC เอเจนต์ใหม่',
        message: 'เอเจนต์ สมชาย ดีใจ ยื่นเรื่องยืนยันตัวตน (KYC) รอการตรวจสอบอนุมัติจากแอดมิน [SA/Admin Only]',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 80 * 60).toISOString(),
      },
      {
        id: 'mock_admin_compliance_report',
        type: 'error' as NotificationType,
        title: '⚠️ [System Alert] รายงานการร้องเรียน',
        message: 'มีผู้ใช้รายงานห้องพัก "Sukhumvit Luxury Condo" โฆษณาหลอกลวง กรุณาเข้าตรวจสอบข้อมูล [SA/Admin Only]',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 120 * 60).toISOString(),
      },
      ...list
    ];

    setNotifications(list.map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp),
      action: n.action ? { label: n.action.label, url: n.action.url } : undefined
    })));
  }, []);

  // ⚠️ [TEST MODE] No localStorage persistence — notifications reset on every page refresh

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50 notifications
    
    // Also show as toast
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(notification.title, notification.message, notification.type);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
