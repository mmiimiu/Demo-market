'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Globe, BellRing, Eye, Moon } from 'lucide-react';
import type { Language } from '@/lib/types';

interface SystemPreferencesProps {
  isTh: boolean;
}

export function SystemPreferences({ isTh }: SystemPreferencesProps) {
  const { lang, setLang } = useApp();
  
  // Notification States
  const [emailNotify, setEmailNotify] = useState(true);
  const [smsNotify, setSmsNotify] = useState(false);
  const [pushNotify, setPushNotify] = useState(true);
  const [lineNotify, setLineNotify] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const emailPref = localStorage.getItem('primerent_pref_email');
    const smsPref = localStorage.getItem('primerent_pref_sms');
    const pushPref = localStorage.getItem('primerent_pref_push');
    const linePref = localStorage.getItem('primerent_pref_line');

    if (emailPref !== null) setEmailNotify(emailPref === 'true');
    if (smsPref !== null) setSmsNotify(smsPref === 'true');
    if (pushPref !== null) setPushNotify(pushPref === 'true');
    if (linePref !== null) setLineNotify(linePref === 'true');
  }, []);

  const handleNotifyToggle = (type: 'email' | 'sms' | 'push' | 'line', val: boolean) => {
    if (type === 'email') {
      setEmailNotify(val);
      localStorage.setItem('primerent_pref_email', String(val));
    } else if (type === 'sms') {
      setSmsNotify(val);
      localStorage.setItem('primerent_pref_sms', String(val));
    } else if (type === 'push') {
      setPushNotify(val);
      localStorage.setItem('primerent_pref_push', String(val));
    } else if (type === 'line') {
      setLineNotify(val);
      localStorage.setItem('primerent_pref_line', String(val));
    }

    toast({
      title: isTh ? 'ปรับปรุงการแจ้งเตือนสำเร็จ' : 'Notification Preferences Saved',
      description: isTh ? 'การตั้งค่าช่องทางแจ้งข่าวสารได้รับการอัปเดตแล้ว' : 'Your alert preference changes have been synced.'
    });
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('primerent_lang', newLang);
    toast({
      title: newLang === 'th' ? 'เปลี่ยนภาษาสำเร็จ' : newLang === 'cn' ? '语言已更改' : 'Language Changed',
      description: newLang === 'th' ? 'ระบบเปลี่ยนเป็นภาษาไทยเรียบร้อยแล้ว' : newLang === 'cn' ? '系统已切换为中文。' : 'System display language switched to English.'
    });
  };

  return (
    <div className="space-y-6 font-thai">
      
      {/* ─── SECTION 1: LANGUAGE SWITCHER [TH / EN / CN] ───────────────── */}
      <div className="space-y-3">
        <h4 className="font-black text-gray-800 text-lg flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-500" />
          {isTh ? 'เปลี่ยนภาษา (Change Language)' : 'Change Language'}
        </h4>
        <p className="text-xs text-gray-400 font-bold -mt-1">
          {isTh ? 'เลือกภาษาเริ่มต้นของแอปพลิเคชันสำหรับใช้งานระบบ' : 'Select your primary language for application interface.'}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { code: 'th', label: 'ภาษาไทย (TH)' },
            { code: 'en', label: 'English (EN)' },
            { code: 'cn', label: '中文 (CN)' }
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => handleLanguageChange(item.code as Language)}
              className={`h-12 text-xs font-black transition-all border flex items-center justify-center rounded-none ${
                lang === item.code
                  ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── SECTION 2: NOTIFICATION CHANNELS ────────────────────────────── */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h4 className="font-black text-gray-800 text-lg flex items-center gap-2">
          <BellRing className="w-5 h-5 text-gray-500" />
          {isTh ? 'การตั้งค่าช่องทางแจ้งเตือน (Notifications)' : 'Notification Channels'}
        </h4>
        <p className="text-xs text-gray-400 font-bold -mt-1">
          {isTh ? 'เลือกช่องทางติดต่อและอัปเดตดีลที่คุณสะดวกรับเรื่องมากที่สุด' : 'Choose how you would like to be updated about actions.'}
        </p>

        <div className="space-y-3">
          {/* Email notifications */}
          <div className="flex items-center justify-between p-5 border border-gray-100 bg-white">
            <div>
              <p className="font-black text-sm text-gray-900">{isTh ? 'อีเมลแจ้งเตือนการเช่า (Email Alerts)' : 'Email Notifications'}</p>
              <p className="text-xs text-gray-400 font-bold">{isTh ? 'รับบิลค่าเช่า, การยืนยันเอกสาร และการทำสัญญาผ่านทางอีเมล' : 'Invoices, lease signings and transaction statements.'}</p>
            </div>
            <input 
              type="checkbox" 
              checked={emailNotify} 
              onChange={e => handleNotifyToggle('email', e.target.checked)}
              className="w-5 h-5 rounded accent-primary bg-gray-50 cursor-pointer" 
            />
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between p-5 border border-gray-100 bg-white">
            <div>
              <p className="font-black text-sm text-gray-900">{isTh ? 'ข้อความด่วน SMS (SMS Alerts)' : 'SMS Notifications'}</p>
              <p className="text-xs text-gray-400 font-bold">{isTh ? 'รับรหัส OTP, และการแจ้งซ่อมแซมด่วนทาง SMS เบอร์มือถือ' : 'Urgent maintenance reports, status updates and security tokens.'}</p>
            </div>
            <input 
              type="checkbox" 
              checked={smsNotify} 
              onChange={e => handleNotifyToggle('sms', e.target.checked)}
              className="w-5 h-5 rounded accent-primary bg-gray-50 cursor-pointer" 
            />
          </div>

          {/* App Push notifications */}
          <div className="flex items-center justify-between p-5 border border-gray-100 bg-white">
            <div>
              <p className="font-black text-sm text-gray-900">{isTh ? 'การแจ้งเตือนบนหน้าเว็บ (In-App Push)' : 'In-App Alerts'}</p>
              <p className="text-xs text-gray-400 font-bold">{isTh ? 'แสดงแจ้งเตือนผ่านกระดิ่งบาร์ขวาด้านบนทันที' : 'Real-time alert notifications badge inside the web platform.'}</p>
            </div>
            <input 
              type="checkbox" 
              checked={pushNotify} 
              onChange={e => handleNotifyToggle('push', e.target.checked)}
              className="w-5 h-5 rounded accent-primary bg-gray-50 cursor-pointer" 
            />
          </div>

          {/* LINE official updates */}
          <div className="flex items-center justify-between p-5 border border-gray-100 bg-white">
            <div>
              <p className="font-black text-sm text-gray-900">{isTh ? 'การติดตามแจ้งเตือน Line OA (LINE Push)' : 'LINE Integration'}</p>
              <p className="text-xs text-gray-400 font-bold">{isTh ? 'ส่งความคืบหน้าแจ้งเตือนผ่านห้องแชทไลน์อัตโนมัติ' : 'Sync status and lease updates directly inside your LINE app.'}</p>
            </div>
            <input 
              type="checkbox" 
              checked={lineNotify} 
              onChange={e => handleNotifyToggle('line', e.target.checked)}
              className="w-5 h-5 rounded accent-primary bg-gray-50 cursor-pointer" 
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION 3: DISPLAY THEME ────────────────────────────────────── */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h4 className="font-black text-gray-800 text-lg flex items-center gap-2">
          <Moon className="w-5 h-5 text-gray-500" />
          {isTh ? 'การแสดงผลของหน้าจอ (Display)' : 'Display Theme'}
        </h4>
        <div className="flex items-center justify-between p-5 border border-gray-100 bg-white">
          <div>
            <p className="font-black text-sm text-gray-900">{isTh ? 'โหมดสีมืด (Dark Mode)' : 'Dark Theme Interface'}</p>
            <p className="text-xs text-gray-400 font-bold">{isTh ? 'ปรับปรุงเฉดสีช่วยถนอมสายตา' : 'Improve readability during night time.'}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 text-[10px] font-black bg-gray-100 text-gray-500 rounded-full">COMING SOON</span>
        </div>
      </div>

    </div>
  );
}
