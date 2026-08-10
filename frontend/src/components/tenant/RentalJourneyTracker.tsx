'use client';

import React, { useState, useEffect } from 'react';
import { Home, ArrowRight, CheckCircle, CreditCard, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ShowingScheduler from '../agent/ShowingScheduler';
import { BookingForm } from '../BookingForm';
import { MoveInChecklist } from '../shared/MoveInChecklist';
import { PostTransactionRating } from '../shared/PostTransactionRating';
import { MultiPropertySelector, ManagedPropertyItem } from './MultiPropertySelector';
import { JourneyStepperHeader } from './JourneyStepperHeader';
import { cn } from '@/lib/utils';

interface RentalJourneyTrackerProps {
  lang: 'th' | 'en' | 'cn';
  role?: 'tenant' | 'agent' | 'owner';
  onClose?: () => void;
}

export function RentalJourneyTracker({ lang, role = 'tenant', onClose }: RentalJourneyTrackerProps) {
  const [activeTab, setActiveTab] = useState<'showing' | 'booking' | 'checklist'>('showing');
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingPaid, setBookingPaid] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState(false);
  const [selectedPropId, setSelectedPropId] = useState<string | number>('unit-101');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStep, setFilterStep] = useState('all');

  const isThai = lang === 'th';

  const MOCK_MANAGED_UNITS: ManagedPropertyItem[] = [
    { id: 'unit-101', name: 'คอนโดหรู ใกล้ BTS อโศก สุขุมวิท', roomNo: '12A/88', tenantName: 'คุณสมชาย ใจดี', ownerName: 'คุณวิชัย เลิศศิริ', agentName: 'คุณอรุณ สว่างใจ', statusStep: 'showing', statusLabel: '1. รอนัดดูห้อง', statusColor: 'bg-amber-100 text-amber-800' },
    { id: 'unit-102', name: 'ไอดีโอ พระราม 9 คอนโดมิเนียม', roomNo: '88/104', tenantName: 'Ms. Sarah Jenkins', ownerName: 'คุณวิชัย เลิศศิริ', agentName: 'คุณอรุณ สว่างใจ', statusStep: 'booking', statusLabel: '2. รอชำระมัดจำ', statusColor: 'bg-blue-100 text-blue-800' },
    { id: 'unit-103', name: 'บ้านเดี่ยว 2 ชั้น สุขุมวิท 71', roomNo: 'บ้านเลขที่ 45/1', tenantName: 'คุณกิตติศักดิ์ พรหมดี', ownerName: 'คุณวิชัย เลิศศิริ', agentName: 'ดูแลเอง', statusStep: 'checklist', statusLabel: '3. รอตรวจรับห้อง', statusColor: 'bg-purple-100 text-purple-800' },
    { id: 'unit-104', name: 'เดอะ เบส สุขุมวิท 77', roomNo: '15B/22', tenantName: 'คุณปรียาพร สายชล', ownerName: 'คุณวิชัย เลิศศิริ', agentName: 'คุณมณี รุ่งเรือง', statusStep: 'active', statusLabel: '4. สัญญาเช่าบังคับใช้', statusColor: 'bg-emerald-100 text-emerald-800' },
  ];

  const currentUnit = MOCK_MANAGED_UNITS.find(u => u.id === selectedPropId) || MOCK_MANAGED_UNITS[0];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const target = bookings.find((b: any) => b.propertyId === 1);
      if (target) {
        setBookingCompleted(true);
        if (target.status === 'paid') setBookingPaid(true);
      }
      if (localStorage.getItem('move_in_checklist_signed_1') === 'true') setChecklistCompleted(true);
    }
  }, [selectedPropId]);

  const t = {
    title: isThai ? `ติดตามการเช่า (${role.toUpperCase()})` : `Rental Journey (${role.toUpperCase()})`,
    subtitle: isThai ? 'ขั้นตอนจัดการที่พักตั้งแต่ดูห้อง ชำระเงินมัดจำ จนถึงย้ายเข้าสำเร็จ' : 'Manage rental steps from viewing to moving in',
    stepShowing: isThai ? '1. นัดหมายดูห้อง' : '1. Schedule Showing',
    stepBooking: isThai ? '2. จองและมัดจำ' : '2. Book & Deposit',
    stepChecklist: isThai ? '3. ตรวจรับห้องย้ายเข้า' : '3. Move-in Checklist',
  };

  return (
    <div className="w-full bg-white text-gray-900 border border-gray-100 p-4 sm:p-8 space-y-6 font-thai rounded-2xl shadow-sm">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary rounded-xl shrink-0"><Home className="w-6 h-6" /></div>
        <div>
          <h2 className="text-xl font-black text-gray-900">{t.title}</h2>
          <p className="text-xs text-gray-500 font-medium">{t.subtitle}</p>
        </div>
      </div>

      <MultiPropertySelector
        lang={lang} role={role} properties={MOCK_MANAGED_UNITS} selectedPropertyId={selectedPropId}
        onSelectProperty={setSelectedPropId} searchTerm={searchTerm} onSearchChange={setSearchTerm}
        filterStep={filterStep} onFilterStepChange={setFilterStep}
      />

      <JourneyStepperHeader
        activeTab={activeTab} onTabChange={setActiveTab} bookingCompleted={bookingCompleted}
        bookingPaid={bookingPaid} checklistCompleted={checklistCompleted} t={t}
      />

      <div className="border border-gray-100 bg-gray-50/50 p-6 rounded-2xl min-h-[320px]">
        {activeTab === 'showing' && (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/10 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <Badge className="bg-primary text-white border-none font-bold rounded-lg">{currentUnit.statusLabel}</Badge>
                <h3 className="text-lg font-black text-gray-900">{currentUnit.name} (ห้อง {currentUnit.roomNo})</h3>
                <p className="text-xs text-gray-600 font-medium">ผู้เช่า: {currentUnit.tenantName} | เจ้าของ: {currentUnit.ownerName} | Agent: {currentUnit.agentName}</p>
              </div>
              <Button onClick={() => { setActiveTab('booking'); setShowBookingForm(true); }} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-11 gap-2">
                {isThai ? 'ดำเนินขั้นตอนการจอง' : 'Proceed Booking'} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-xl"><ShowingScheduler mode={role === 'tenant' ? 'tenant' : 'agent'} /></div>
          </div>
        )}

        {activeTab === 'booking' && (
          <Card className="border-none shadow-sm rounded-xl bg-white p-6">
            <CardContent className="p-0 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div><h3 className="text-lg font-black text-gray-900">การจองห้องพักและชำระค่ามัดจำ</h3><p className="text-xs text-gray-500">{currentUnit.name} ({currentUnit.roomNo})</p></div>
                <Badge className={bookingPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>{bookingPaid ? 'มัดจำเรียบร้อย' : 'รอชำระมัดจำ'}</Badge>
              </div>
              {bookingPaid ? (
                <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <h4 className="font-bold text-green-800">ยืนยันเงินมัดจำเสร็จสิ้น!</h4>
                  <Button onClick={() => setActiveTab('checklist')} className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">ไปหน้าตรวจรับห้อง</Button>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-3">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-xs font-medium text-gray-600">กรุณาเปิดฟอร์มจองเพื่อสแกน QR ชำระมัดจำ</p>
                  <Button onClick={() => setShowBookingForm(true)} className="bg-primary text-white font-bold rounded-xl">เปิดฟอร์มจอง & QR ชำระเงิน</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'checklist' && (
          <div className="bg-white border border-gray-100 p-6 rounded-xl space-y-6">
            <h3 className="text-lg font-black text-gray-900 border-b pb-3">ตรวจรับห้องพักก่อนย้ายเข้า ({currentUnit.name})</h3>
            <MoveInChecklist lang={lang} propertyName={currentUnit.name} />
          </div>
        )}
      </div>

      {showBookingForm && (
        <BookingForm
          property={{ id: 1, name: currentUnit.name, price: 18000, type: "condo" }}
          onClose={() => {
            setShowBookingForm(false);
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            if (bookings.some((b: any) => b.propertyId === 1)) { setBookingCompleted(true); setBookingPaid(true); setActiveTab('checklist'); }
          }}
          lang={lang} currency="THB"
        />
      )}
    </div>
  );
}
