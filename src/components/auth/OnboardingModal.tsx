'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle, ShieldCheck } from 'lucide-react';
import { useNotification } from '@/hooks/use-notification';
import { useApp } from '@/contexts/AppContext';
import { useUser } from '@/firebase';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingModal({ open, onClose, onComplete }: OnboardingModalProps) {
  const { lang } = useApp();
  const { user } = useUser();
  const notification = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
  });

  // Check what's missing
  const needsLineLink = !(user as any)?.isLineLinked;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      
      if (user) {
        const updatedUser = {
          ...user,
          ...formData,
          isLineLinked: true, // Mocked success
          onboardingCompleted: true,
        };
        localStorage.setItem('prime_mock_user', JSON.stringify(updatedUser));
      }
      
      notification.success(
        lang === 'th' ? 'ข้อมูลสมบูรณ์' : 'Profile Completed',
        lang === 'th' ? 'ขอบคุณที่ยืนยันข้อมูลพื้นฐานครับ' : 'Thank you for providing your basic info.'
      );
      
      onComplete();
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }, 1500);
  };

  // Read current active role
  const activeRole = typeof window !== 'undefined' ? localStorage.getItem('primerent_user_role') : null;
  const isUserAdmin = activeRole === 'admin';

  return (
    <Dialog open={open} onOpenChange={(val) => { 
      // Force user to stay if they are not admin and still need to link LINE
      if (!val) {
        if (!isUserAdmin && needsLineLink) {
          notification.error(
            lang === 'th' ? 'กรุณาเชื่อมโยงบัญชี LINE' : 'Please link your LINE account',
            lang === 'th' ? 'เราต้องการข้อมูล LINE สำหรับการแจ้งเตือน OTP และธุรกรรมต่างๆ' : 'LINE is required for secure alerts & transactional verification.'
          );
          return;
        }
        onClose();
      }
    }}>
      <DialogContent className="z-[200] sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 p-6 text-center border-b border-primary/10">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-primary" />
          <DialogTitle className="text-xl font-black mb-2 text-gray-900">
            {lang === 'th' ? 'ขอข้อมูลเพิ่มเติมเพื่อความปลอดภัย' : 'Additional Verification Required'}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-gray-600">
            {lang === 'th' 
              ? 'ก่อนที่คุณจะเริ่มติดต่อเจ้าของห้องหรือทำธุรกรรม เราขอข้อมูลพื้นฐานของคุณเพื่อความโปร่งใสและปลอดภัย' 
              : 'Before you can contact owners or make a booking, we need some basic details for security.'}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold">{lang === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}</Label>
              <Input 
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                placeholder={lang === 'th' ? 'เช่น สมชาย ใจดี' : 'John Doe'} 
                required 
                className="h-12 rounded-xl border-gray-200" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold">{lang === 'th' ? 'อีเมล' : 'Email Address'}</Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com" 
                required 
                className="h-12 rounded-xl border-gray-200" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold">{lang === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'}</Label>
              <Input 
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08X-XXX-XXXX" 
                required 
                className="h-12 rounded-xl border-gray-200" 
              />
            </div>
          </div>

          {needsLineLink && (
            <div className="p-4 bg-[#06C755]/10 border border-[#06C755]/20 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#06C755] flex items-center justify-center shrink-0">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#06C755] text-sm">
                    {lang === 'th' ? 'จำเป็นต้องเชื่อมโยง LINE' : 'LINE Linkage Required'}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium mt-1">
                    {lang === 'th' 
                      ? 'เราบังคับให้ผู้ใช้งานรับ OTP ยืนยันตัวตนผ่าน LINE เพื่อป้องกันมิจฉาชีพ'
                      : 'We require a linked LINE account for OTP verification.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl font-black bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20"
          >
            {isSubmitting 
              ? (lang === 'th' ? 'กำลังบันทึก...' : 'Saving...') 
              : (needsLineLink ? (lang === 'th' ? 'บันทึกและเชื่อมโยง LINE' : 'Save & Link LINE') : (lang === 'th' ? 'ยืนยันข้อมูล' : 'Confirm'))}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
