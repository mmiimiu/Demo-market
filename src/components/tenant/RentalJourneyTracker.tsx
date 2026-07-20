'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, CreditCard, ClipboardCheck, ArrowRight, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ShowingScheduler from '../agent/ShowingScheduler';
import { BookingForm } from '../BookingForm';
import { MoveInChecklist } from '../shared/MoveInChecklist';
import { PostTransactionRating } from '../shared/PostTransactionRating';
import { cn } from '@/lib/utils';

interface RentalJourneyTrackerProps {
  lang: 'th' | 'en' | 'cn';
  onClose: () => void;
}

export function RentalJourneyTracker({ lang, onClose }: RentalJourneyTrackerProps) {
  const [activeTab, setActiveTab] = useState<'showing' | 'booking' | 'checklist'>('showing');
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingPaid, setBookingPaid] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState(false);

  const isThai = lang === 'th';
  const isChinese = lang === 'cn';

  // 1. Preload completed showing in localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if bookings already exist to set state
      const checkBookingsState = () => {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const targetBooking = bookings.find((b: any) => b.propertyId === 1);
        if (targetBooking) {
          setBookingCompleted(true);
          if (targetBooking.status === 'paid') {
            setBookingPaid(true);
          }
        }
      };

      // Check if checklists already exist
      const checkChecklistState = () => {
        const check = localStorage.getItem('move_in_checklist_signed_1');
        if (check === 'true') {
          setChecklistCompleted(true);
        }
      };

      checkBookingsState();
      checkChecklistState();

      // Listen for localstorage changes (like booking submission)
      const handleStorageChange = () => {
        checkBookingsState();
      };
      window.addEventListener('storage', handleStorageChange);
      
      // Also poll slightly since React events are within context
      const timer = setInterval(() => {
        checkBookingsState();
      }, 1000);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(timer);
      };
    }
  }, []);

  const t = {
    title: isThai ? 'ติดตามการเช่าของคุณ' : isChinese ? '我的租房进程' : 'Your Rental Journey',
    subtitle: isThai ? 'ขั้นตอนจัดการที่พักตั้งแต่ดูห้องจนถึงย้ายเข้าสำเร็จ' : isChinese ? '跟踪从看房到入住的完整流程' : 'Manage your rental steps from viewing to moving in',
    stepShowing: isThai ? '1. นัดหมายดูห้อง' : isChinese ? '1. 预约看房' : '1. Schedule Showing',
    stepBooking: isThai ? '2. จองและมัดจำ' : isChinese ? '2. 预订与押金' : '2. Book & Deposit',
    stepChecklist: isThai ? '3. ตรวจรับห้องย้ายเข้า' : isChinese ? '3. 验房与入住' : '3. Move-in Checklist',
    viewingFinished: isThai ? 'ดูห้องเสร็จเรียบร้อยแล้ว!' : isChinese ? '看房已完成！' : 'Viewing completed successfully!',
    viewingDesc: isThai ? 'คุณได้เข้าดูห้อง "คอนโดหรู ใกล้ BTS อโศก สุขุมวิท" เรียบร้อยแล้ว หากสนใจเช่าพื้นที่นี้ สามารถเริ่มทำสัญญาและชำระค่ามัดจำล่วงหน้าได้ทันที' : isChinese ? '您已看过了“素坤逸阿速 BTS 站旁豪华公寓”，如果满意，请在此预订房产。' : 'You have viewed "Luxury Condo near BTS Asok, Sukhumvit". If you are satisfied, please book the property and secure it.',
    btnBook: isThai ? 'ดำเนินขั้นตอนการจองห้องนี้' : isChinese ? '点击预订此房源' : 'Proceed with Booking',
    bookingStatus: isThai ? 'สถานะการจอง: ' : isChinese ? '预订状态：' : 'Booking Status: ',
    paid: isThai ? 'ชำระเงินมัดจำแล้ว' : isChinese ? '押金已支付' : 'Deposit Paid',
    pendingPayment: isThai ? 'รอชำระเงินมัดจำ' : isChinese ? '等待支付押金' : 'Pending Deposit Payment',
    btnPay: isThai ? 'ดำเนินการจองและเปิด QR ชำระเงิน' : isChinese ? '继续预订并付款' : 'Open Booking & Payment Form',
    checklistLocked: isThai ? 'กรุณาชำระเงินมัดจำเพื่อปลดล็อครายการตรวจสอบก่อนย้ายเข้า' : isChinese ? '支付押金后解锁验房清单' : 'Please pay the deposit to unlock the Move-in Checklist',
    checklistHeader: isThai ? 'ตรวจรับห้องและเซ็นเอกสารก่อนรับกุญแจ' : isChinese ? '入住前验房与签名' : 'Inspect Room & Sign Before Receiving Keys'
  };

  return (
    <div className={cn(
      "w-full bg-white text-gray-900 border border-gray-100 p-4 sm:p-8 space-y-8",
      lang === 'th' ? "font-thai" : lang === 'cn' ? "font-chinese" : "font-english"
    )}>
      {/* Title */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary rounded-none border border-primary/10">
          <Home className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{t.title}</h2>
          <p className="text-sm text-gray-500 font-medium">{t.subtitle}</p>
        </div>
      </div>

      {/* Stepper Steps UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'showing', label: t.stepShowing, icon: Calendar, active: activeTab === 'showing', done: bookingCompleted },
          { id: 'booking', label: t.stepBooking, icon: CreditCard, active: activeTab === 'booking', done: bookingPaid, disabled: !bookingCompleted },
          { id: 'checklist', label: t.stepChecklist, icon: ClipboardCheck, active: activeTab === 'checklist', done: checklistCompleted, disabled: !bookingPaid }
        ].map((stepItem) => (
          <button
            key={stepItem.id}
            type="button"
            disabled={stepItem.disabled}
            onClick={() => setActiveTab(stepItem.id as any)}
            className={cn(
              "flex items-center gap-3 p-4 border text-left transition-all rounded-none",
              stepItem.active 
                ? "border-primary bg-primary/5 text-primary" 
                : stepItem.disabled
                  ? "border-gray-100 bg-gray-50/50 text-gray-400 cursor-not-allowed"
                  : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
              stepItem.done 
                ? "bg-green-500 text-white" 
                : stepItem.active
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
            )}>
              {stepItem.done ? '✓' : <stepItem.icon className="w-4 h-4" />}
            </div>
            <span className="font-bold text-xs tracking-wider uppercase">{stepItem.label}</span>
          </button>
        ))}
      </div>

      {/* Main view container */}
      <div className="border border-gray-100 bg-gray-50/30 p-6 rounded-none min-h-[350px]">
        {activeTab === 'showing' && (
          <div className="space-y-6">
            {/* Completed Showing Banner (mocked) */}
            <div className="bg-primary/5 border border-primary/10 p-6 rounded-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <Badge className="bg-[#1A56DB] text-white border-none font-black rounded-none">
                  {t.viewingFinished}
                </Badge>
                <h3 className="text-lg font-black text-gray-900">คอนโดหรู ใกล้ BTS อโศก สุขุมวิท</h3>
                <p className="text-sm font-medium text-gray-600 max-w-2xl">{t.viewingDesc}</p>
              </div>
              <Button
                onClick={() => {
                  setActiveTab('booking');
                  setShowBookingForm(true);
                }}
                className="bg-primary hover:bg-primary/90 text-white font-black text-sm px-6 h-12 rounded-none gap-2 shrink-0 shadow-lg shadow-primary/10"
              >
                {t.btnBook} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Embedded scheduler for checking other viewings */}
            <div className="bg-white border border-gray-100 p-4">
              <ShowingScheduler mode="tenant" />
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-none bg-white p-6">
              <CardContent className="p-0 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">การจองห้องพักและชำระค่ามัดจำ</h3>
                    <p className="text-xs text-gray-500 font-medium">คอนโดหรู ใกล้ BTS อโศก สุขุมวิท</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">{t.bookingStatus}</span>
                    <Badge className={cn(
                      "font-black rounded-none border-none",
                      bookingPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                      {bookingPaid ? t.paid : t.pendingPayment}
                    </Badge>
                  </div>
                </div>

                {bookingPaid ? (
                  <div className="p-8 border border-green-200 bg-green-50/50 flex flex-col items-center justify-center text-center space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
                    <h4 className="text-lg font-black text-green-800">ยืนยันเงินมัดจำเสร็จสิ้น!</h4>
                    <p className="text-sm text-gray-600 font-medium max-w-md">
                      การจองและสัญญาของคุณได้รับการอนุมัติอย่างเป็นทางการเรียบร้อยแล้ว คุณสามารถย้ายเข้าได้ในวันที่ทำสัญญา 
                      โปรดดำเนินการต่อในขั้นตอนที่ 3 เพื่อตรวจรับห้องพักและบันทึกใบเช็คลิสต์อิเล็กทรอนิกส์
                    </p>
                    <Button
                      onClick={() => setActiveTab('checklist')}
                      className="bg-green-600 hover:bg-green-700 text-white font-black text-sm px-6 h-11 rounded-none gap-2 mt-2"
                    >
                      {isThai ? 'ไปหน้าตรวจรับห้องย้ายเข้า' : 'Go to Move-In Checklist'} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center space-y-4">
                    <CreditCard className="w-16 h-16 text-gray-400" />
                    <h4 className="text-base font-black text-gray-800">{t.pendingPayment}</h4>
                    <p className="text-xs text-gray-500 font-medium max-w-sm">
                      กรุณากรอกใบสมัครจองสิทธิ์และสแกนชำระเงินมัดจำ (ค่ามัดจำ 2 เดือน + ค่าเช่าล่วงหน้า 1 เดือน) เพื่อปลดล็อคขั้นตอนสุดท้าย
                    </p>
                    <Button
                      onClick={() => setShowBookingForm(true)}
                      className="bg-primary hover:bg-primary/90 text-white font-black text-sm px-8 h-12 rounded-none shadow-lg shadow-primary/10 gap-2"
                    >
                      {t.btnPay}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            {!bookingPaid ? (
              <div className="p-8 border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center space-y-4">
                <ClipboardCheck className="w-16 h-16 text-gray-300" />
                <h4 className="text-sm font-bold text-gray-500">{t.checklistLocked}</h4>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 p-4 space-y-8">
                <div>
                  <div className="border-b border-gray-100 pb-4 mb-6">
                    <h3 className="text-xl font-black text-gray-900">{t.checklistHeader}</h3>
                    <p className="text-xs text-gray-500 font-medium">คอนโดหรู ใกล้ BTS อโศก สุขุมวิท</p>
                  </div>
                  
                  {/* Embed checklist inside */}
                  <MoveInChecklist 
                    lang={lang} 
                    propertyName="Luxury Condo near BTS Asok, Sukhumvit"
                  />
                </div>

                {/* Show Owner Rating if checklist is completed */}
                {checklistCompleted && (
                  <div className="pt-6 border-t border-gray-100 animate-in slide-in-from-bottom-4">
                    <PostTransactionRating 
                      lang={lang}
                      targetUserId="owner_mock_id"
                      targetRoleName={isThai ? "เจ้าของห้อง" : "Owner"}
                      transactionContext={isThai ? "หลังจากการทำสัญญาและตรวจรับห้องเรียบร้อยแล้ว คุณประทับใจการบริการของเจ้าของห้องอย่างไรบ้าง?" : "Now that you've moved in, how was your experience with the owner?"}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded Booking Modal Form */}
      {showBookingForm && (
        <BookingForm
          property={{ id: 1, name: "คอนโดหรู ใกล้ BTS อโศก สุขุมวิท", price: 18000, type: "condo" }}
          onClose={() => {
            setShowBookingForm(false);
            // Re-read storage state
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            const targetBooking = bookings.find((b: any) => b.propertyId === 1);
            if (targetBooking) {
              setBookingCompleted(true);
              if (targetBooking.status === 'paid') {
                setBookingPaid(true);
                setActiveTab('checklist');
              }
            }
          }}
          lang={lang}
          currency="THB"
        />
      )}
    </div>
  );
}
