'use client';

import React, { useState } from 'react';
import { Calendar, Clock, X, CheckCircle2, ChevronLeft, ChevronRight, User, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Language, Property } from '@/lib/types';

interface ViewingSchedulerProps {
  property: Property;
  lang: Language;
  onClose: () => void;
}

const TIME_SLOTS = ['09:00', '11:00', '14:00', '16:00', '18:00'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const MONTH_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const DAY_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function ViewingScheduler({ property, lang, onClose }: ViewingSchedulerProps) {
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'pick' | 'form' | 'success'>('pick');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const label = (th: string, en: string, cn: string) => isTh ? th : isCn ? cn : en;

  const monthName = isTh ? MONTH_TH[currentMonth] : MONTH_EN[currentMonth];
  const dayNames = isTh ? DAY_TH : DAY_EN;

  const isDateAvailable = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    return d >= today && d.getDay() !== 0; // No Sundays, no past
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);

    const viewingData = {
      propertyId: property.id,
      propertyName: property.name,
      date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`,
      time: selectedTime,
      name, phone, note,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage (mock)
    try {
      const existing = JSON.parse(localStorage.getItem('primerent_viewings') || '[]');
      existing.push(viewingData);
      localStorage.setItem('primerent_viewings', JSON.stringify(existing));
    } catch {}

    // Try API (graceful fail)
    try {
      await fetch('/api/viewing/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(viewingData),
      });
    } catch {}

    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setStep('success');
    toast({
      title: label('นัดดูห้องสำเร็จ!', 'Viewing Scheduled!', '预约看房成功！'),
      description: label(`${selectedDate} ${monthName} ${selectedTime}`, `${monthName} ${selectedDate}, ${selectedTime}`, `${selectedDate}号 ${selectedTime}`),
    });
  };

  const displayName = lang === 'en' ? property.nameEn : lang === 'cn' ? property.nameCn : property.name;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-primary text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5" />
            <div>
              <div className="font-black text-base">{label('นัดดูห้อง', 'Schedule Viewing', '预约看房')}</div>
              <div className="text-[10px] text-white/70 font-bold truncate max-w-[200px]">{displayName}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step: Pick Date & Time */}
        {step === 'pick' && (
          <div className="p-5 space-y-5">
            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-black text-sm text-gray-900">{monthName} {currentYear}</span>
                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {dayNames.map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-gray-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const day = i + 1;
                  const available = isDateAvailable(day);
                  const selected = selectedDate === day;
                  return (
                    <button
                      key={day}
                      onClick={() => available && setSelectedDate(day)}
                      disabled={!available}
                      className={cn(
                        "aspect-square text-xs font-black transition-all",
                        selected ? "bg-primary text-white" : available ? "hover:bg-primary/10 text-gray-900" : "text-gray-200 cursor-not-allowed"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {label('เลือกเวลา', 'Select Time', '选择时间')}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={cn(
                        "py-2 text-xs font-black border transition-all",
                        selectedTime === slot ? "bg-primary text-white border-primary" : "border-gray-200 hover:border-primary hover:text-primary"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => setStep('form')}
              disabled={!selectedDate || !selectedTime}
              className="w-full h-12 rounded-none bg-primary font-black text-white disabled:opacity-40"
            >
              {label('ต่อไป', 'Continue', '下一步')} →
            </Button>
          </div>
        )}

        {/* Step: Contact Form */}
        {step === 'form' && (
          <div className="p-5 space-y-4">
            <div className="bg-primary/5 border border-primary/10 p-3 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-black text-xs text-primary">
                {selectedDate} {monthName} {currentYear} · {selectedTime}
              </span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="font-black text-xs flex items-center gap-1"><User className="w-3.5 h-3.5" /> {label('ชื่อ-นามสกุล', 'Full Name', '姓名')}</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={label('ชื่อ นามสกุล', 'Full name', '全名')} className="rounded-none h-11 font-bold" required />
              </div>
              <div className="space-y-1.5">
                <Label className="font-black text-xs flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {label('เบอร์โทรศัพท์', 'Phone Number', '电话号码')}</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0XX-XXX-XXXX" className="rounded-none h-11 font-bold" type="tel" required />
              </div>
              <div className="space-y-1.5">
                <Label className="font-black text-xs flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {label('หมายเหตุ (ไม่บังคับ)', 'Note (Optional)', '备注（选填）')}</Label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 p-3 text-sm font-bold rounded-none resize-none focus:outline-none focus:border-primary"
                  placeholder={label('มีคำถามหรือความต้องการพิเศษ?', 'Any questions or special requests?', '有什么特别需要？')}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('pick')} className="flex-1 rounded-none h-12 font-bold border-gray-200">
                ← {label('ย้อนกลับ', 'Back', '返回')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!name.trim() || !phone.trim() || submitting}
                className="flex-1 rounded-none h-12 bg-primary font-black text-white disabled:opacity-40"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : label('ยืนยันนัด', 'Confirm', '确认预约')}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-black text-xl text-gray-900">{label('นัดสำเร็จแล้ว!', 'Viewing Scheduled!', '预约成功！')}</h3>
            <div className="bg-gray-50 border border-gray-100 p-4 text-left space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400">{label('ที่พัก', 'Property', '房源')}</span>
                <span className="text-gray-900 text-right">{displayName}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400">{label('วันที่', 'Date', '日期')}</span>
                <span className="text-primary font-black">{selectedDate} {monthName} {currentYear}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400">{label('เวลา', 'Time', '时间')}</span>
                <span className="text-primary font-black">{selectedTime}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 font-bold">
              {label('เจ้าของจะได้รับแจ้งเตือนผ่าน LINE และจะยืนยันนัดภายใน 24 ชั่วโมง', 'The owner will be notified via LINE and confirm within 24 hours.', '房东将通过LINE收到通知并在24小时内确认。')}
            </p>
            <Button onClick={onClose} className="w-full h-12 rounded-none bg-primary font-black text-white">
              {label('ปิด', 'Close', '关闭')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
