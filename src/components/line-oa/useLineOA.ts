'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { mockProperties } from '@/lib/properties';
import type { LineMessage, BillItem, WebviewTab, ActiveRole, PaymentStatus } from './types';

export function useLineOA() {
  const [activeRole, setActiveRole] = useState<ActiveRole>('tenant');
  const [messages, setMessages] = useState<LineMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [webviewTab, setWebviewTab] = useState<WebviewTab>('none');
  const [richMenuOpen, setRichMenuOpen] = useState(true);

  const [bills, setBills] = useState<BillItem[]>([
    { id: 'rent', label: 'ค่าเช่าห้องประจำเดือน', amount: 12000, checked: true },
    { id: 'water', label: 'ค่าน้ำประปา', amount: 350, checked: true },
    { id: 'electric', label: 'ค่าไฟฟ้า', amount: 1450, checked: true },
    { id: 'common', label: 'ค่าเช่าส่วนกลาง', amount: 500, checked: false },
    { id: 'deposit', label: 'ค่ามัดจำแรกเข้า', amount: 0, checked: false },
  ]);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paidAmount, setPaidAmount] = useState(0);

  const [roomNumberInput, setRoomNumberInput] = useState('A-1204');
  const [ownerRentInput, setOwnerRentInput] = useState('12000');
  const [ownerWaterInput, setOwnerWaterInput] = useState('350');
  const [ownerElectricInput, setOwnerElectricInput] = useState('1450');
  const [ownerCommonInput, setOwnerCommonInput] = useState('500');
  const [maintenanceIssue, setMaintenanceIssue] = useState('');
  const [maintenanceList, setMaintenanceList] = useState<any[]>([
    { id: 1, type: 'แอร์ไม่เย็น', date: '01/07/2026', status: 'กำลังดำเนินการ' },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedTotal = bills.reduce((a, b) => b.checked ? a + b.amount : a, 0);

  useEffect(() => {
    const intentStr = typeof window !== 'undefined' ? localStorage.getItem('primerent_pending_line_chat') : null;
    const init: LineMessage[] = [
      { id: 'w1', sender: 'bot', text: 'ยินดีต้อนรับสู่ RentFlow Official Account! 🏠✨ ศูนย์กลางการเช่าและจัดการที่พักอัจฉริยะ', timestamp: new Date(Date.now() - 3600000) },
      { id: 'w2', sender: 'bot', text: 'เชื่อมต่อกับเว็บไซต์ PrimeRent เรียบร้อยแล้วค่ะ เลือกเมนูด้านล่างเพื่อใช้งานได้เลยค่ะ 👇', timestamp: new Date(Date.now() - 3590000) },
    ];
    
    // Auto trigger expiry alert for demo (15, 30, 45 days)
    const role = typeof window !== 'undefined' ? localStorage.getItem('primerent_user_role') : 'renter';
    if (role === 'renter' || role === 'owner' || role === 'landlord' || role === 'agent') {
      const mockDaysLeft = [15, 30, 45][Math.floor(Math.random() * 3)];
      init.push({ 
        id: 'auto_exp', 
        sender: 'bot', 
        text: `⚠️ สัญญาเช่าโครงการ Sukhumvit Condo (ห้อง A-1204) กำลังจะหมดอายุในอีก ${mockDaysLeft} วัน`, 
        timestamp: new Date(Date.now() - 10000), 
        isFlex: true, 
        flexType: 'contract_expiry', 
        flexData: { room: 'Sukhumvit Condo (ห้อง A-1204)', expiryDate: '31/08/2026', daysLeft: mockDaysLeft } 
      });
    }

    if (intentStr) {
      try {
        const intent = JSON.parse(intentStr);
        if (intent?.type === 'booking_payment') {
          setBills([
            { id: 'deposit', label: `ค่ามัดจำการจองห้องพัก: ${intent.propertyName}`, amount: intent.amount, checked: true },
            { id: 'rent', label: 'ค่าเช่าล่วงหน้า', amount: 0, checked: false },
          ]);
          init.push({ id: 'flex_bp_' + Date.now(), sender: 'bot', text: `📝 บิลมัดจำ ${intent.propertyName} ยอด ฿${intent.amount.toLocaleString()}`, timestamp: new Date(), isFlex: true, flexType: 'booking_payment', flexData: { room: intent.propertyName, amount: intent.amount, propertyId: intent.propertyId } });
          localStorage.removeItem('primerent_pending_line_chat');
        }
      } catch { /* ignore */ }
    }
    setMessages(init);
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleBillCheckbox = (id: string) => setBills(p => p.map(b => b.id === id ? { ...b, checked: !b.checked } : b));

  const handleSendChat = () => {
    if (!inputText.trim()) return;
    const msg: LineMessage = { id: Date.now().toString(), sender: 'user', text: inputText, timestamp: new Date() };
    setMessages(p => [...p, msg]);
    setInputText('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), sender: 'bot', text: 'ระบบรับข้อมูลเรียบร้อยแล้วค่ะ เลือกใช้งานผ่านเมนูด้านล่างได้เลยค่ะ', timestamp: new Date() }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleUploadSlip = () => {
    const slipId = 'slip_' + Date.now();
    const slipUrl = 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=400';
    const slipData = {
      amount: selectedTotal,
      items: bills.filter(b => b.checked).map(b => b.label).join(', '),
      room: 'A-1204',
      image: slipUrl
    };
    setSlipImage(slipUrl);
    setSlipUploaded(true);
    setPaymentStatus('pending_verification');

    // ข้อความสลิปจากผู้เช่า
    const tenantSlipMsg: LineMessage = {
      id: slipId,
      sender: 'tenant',
      text: `📤 อัปโหลดสลิปจำนวน ฿${selectedTotal.toLocaleString()} เรียบร้อยแล้ว`,
      timestamp: new Date(),
      isFlex: true,
      flexType: 'slip',
      flexData: slipData,
    };

    // LINE notification แจ้งเจ้าของ/เอเจนต์อัตโนมัติ
    const ownerNotifyMsg: LineMessage = {
      id: 'slip_notify_' + Date.now(),
      sender: 'bot',
      text: `🔔 แจ้งเตือน: ผู้เช่าห้อง ${slipData.room} ส่งหลักฐานการชำระเงิน ฿${selectedTotal.toLocaleString()} รอการอนุมัติ`,
      timestamp: new Date(Date.now() + 500),
      isFlex: true,
      flexType: 'slip_notify',
      flexData: slipData,
    };

    setMessages(p => [...p, tenantSlipMsg, ownerNotifyMsg]);
    toast({ title: '📤 ส่งสลิปชำระเงินเรียบร้อย', description: '🔔 ระบบแจ้งเตือนเจ้าของห้องผ่าน LINE แล้ว กำลังรอการตรวจสอบ' });
    setWebviewTab('none');
  };

  const handleSendBill = () => {
    const rent = parseFloat(ownerRentInput) || 0, water = parseFloat(ownerWaterInput) || 0;
    const electric = parseFloat(ownerElectricInput) || 0, common = parseFloat(ownerCommonInput) || 0;
    const total = rent + water + electric + common;
    setBills([{ id: 'rent', label: 'ค่าเช่าห้องประจำเดือน', amount: rent, checked: true }, { id: 'water', label: 'ค่าน้ำประปา', amount: water, checked: true }, { id: 'electric', label: 'ค่าไฟฟ้า', amount: electric, checked: true }, { id: 'common', label: 'ค่าส่วนกลาง', amount: common, checked: common > 0 }, { id: 'deposit', label: 'ค่ามัดจำ', amount: 0, checked: false }]);
    setPaymentStatus('unpaid'); setSlipUploaded(false); setSlipImage(null);
    setMessages(p => [...p, { id: 'bill_' + Date.now(), sender: 'owner', text: `📝 บิลห้อง ${roomNumberInput} ยอด ฿${total.toLocaleString()}`, timestamp: new Date(), isFlex: true, flexType: 'bill', flexData: { room: roomNumberInput, rent, water, electric, common, total } }]);
    toast({ title: 'ส่งบิลสำเร็จ', description: `บิลห้อง ${roomNumberInput} ฿${total.toLocaleString()} ถูกส่งแล้ว` });
    setWebviewTab('none');
  };

  const handleApproveSlip = () => {
    setPaymentStatus('paid');
    setPaidAmount(selectedTotal);

    // แจ้งเจ้าของ/เอเจนต์ว่าอนุมัติแล้ว
    const approveMsg: LineMessage = {
      id: 'appr_owner_' + Date.now(),
      sender: 'bot',
      text: `✅ อนุมัติยอดชำระ ฿${selectedTotal.toLocaleString()} เรียบร้อยแล้วค่ะ`,
      timestamp: new Date(),
    };

    // แจ้งกลับผู้เช่าว่าการชำระเงินได้รับการอนุมัติแล้ว
    const tenantNotifyMsg: LineMessage = {
      id: 'appr_tenant_notify_' + Date.now(),
      sender: 'bot',
      text: `🎉 ยืนยันการชำระเงินสำเร็จ! ยอด ฿${selectedTotal.toLocaleString()} ได้รับการอนุมัติโดยเจ้าของห้องแล้ว ขอบคุณค่ะ`,
      timestamp: new Date(Date.now() + 300),
      isFlex: true,
      flexType: 'payment_approved',
      flexData: { amount: selectedTotal, room: 'A-1204' },
    };

    setMessages(p => [...p, approveMsg, tenantNotifyMsg]);
    toast({ title: '✅ อนุมัติการชำระเงินสำเร็จ', description: `ระบบแจ้งผู้เช่าผ่าน LINE แล้ว` });
  };

  const handleSendMaintenance = () => {
    if (!maintenanceIssue.trim()) return;
    const req = { id: maintenanceList.length + 1, type: maintenanceIssue, date: new Date().toLocaleDateString('th-TH'), status: 'รอรับเรื่อง' };
    setMaintenanceList(p => [req, ...p]); setMaintenanceIssue('');
    setMessages(p => [...p, { id: 'maint_' + Date.now(), sender: 'user', text: `🔧 แจ้งซ่อม: ${req.type}`, timestamp: new Date() }, { id: 'maint_b_' + Date.now(), sender: 'bot', text: `ช่างได้รับเรื่อง "${req.type}" แล้วค่ะ`, timestamp: new Date() }]);
    toast({ title: 'ส่งแจ้งซ่อมสำเร็จ' });
  };

  const handleSendQR = (amount: number, room: string) => {
    setMessages(p => [
      ...p,
      {
        id: 'qr_' + Date.now(),
        sender: 'agent',
        text: `💳 QR เรียกเก็บเงินห้อง ${room} ยอด ฿${amount.toLocaleString()}`,
        timestamp: new Date(),
        isFlex: true,
        flexType: 'qr_payment',
        flexData: { amount, room }
      }
    ]);
    toast({ title: 'ส่ง QR ชำระเงินสำเร็จ' });
    setWebviewTab('none');
  };

  const handleApproveAppointment = (info: any) => {
    setMessages(p => [
      ...p,
      {
        id: 'appr_apt_' + Date.now(),
        sender: 'bot',
        text: `📅 ยืนยันกำหนดการดูห้อง: ${info.dateTime}`,
        timestamp: new Date(),
        isFlex: true,
        flexType: 'appointment_confirmed',
        flexData: info
      }
    ]);
    setWebviewTab('none');
  };

  const handleBroadcast = (text: string, segmentDesc: string) => {
    setMessages(p => [
      ...p,
      {
        id: 'bc_' + Date.now(),
        sender: 'agent',
        text: `📢 Broadcast (กลุ่มเป้าหมาย: ${segmentDesc}):\n${text}`,
        timestamp: new Date()
      }
    ]);
    setWebviewTab('none');
  };

  const triggerExpiryWarning = () => {
    const d = [15, 30, 45][Math.floor(Math.random() * 3)];
    setMessages(p => [...p, { id: 'exp_' + Date.now(), sender: 'bot', text: `⚠️ สัญญาเช่าโครงการ Sukhumvit Condo (ห้อง A-1204) กำลังจะหมดอายุในอีก ${d} วัน`, timestamp: new Date(), isFlex: true, flexType: 'contract_expiry', flexData: { room: 'Sukhumvit Condo (ห้อง A-1204)', expiryDate: '31/08/2026', daysLeft: d } }]);
    toast({ title: 'จำลองแจ้งเตือนสัญญาสำเร็จ' });
  };

  const triggerAppointmentReminder = () => {
    setMessages(p => [...p, { id: 'app_rem_' + Date.now(), sender: 'bot', text: '⏰ Reminder: นัดดูห้อง Sukhumvit Condo พรุ่งนี้เวลา 14:00 น. กับ Agent แสนดี', timestamp: new Date(), isFlex: true, flexType: 'appointment_confirmed', flexData: { date: 'พรุ่งนี้ 14:00 น.', propertyId: 'p1' } }]);
    toast({ title: 'ส่ง Reminder นัดหมายแล้ว' });
  };

  const triggerSigningReminder = () => {
    setMessages(p => [...p, { id: 'sign_rem_' + Date.now(), sender: 'bot', text: '📝 ได้เวลาทำสัญญาเช่าออนไลน์ (E-Sign) กดลิงก์เพื่อเซ็นสัญญาได้เลยค่ะ', timestamp: new Date(), isFlex: true, flexType: 'contract_sign', flexData: { room: 'Sukhumvit Condo (E-Sign)', expiryDate: 'วันนี้' } }]);
    toast({ title: 'ส่งแจ้งเตือนเซ็นสัญญาแล้ว' });
  };

  const simulateWebhookReconcile = () => {
    setPaymentStatus('paid');
    setMessages(p => [...p, { id: 'webhook_' + Date.now(), sender: 'bot', text: '✅ ระบบได้รับการยืนยันการชำระเงินอัตโนมัติ (Webhook Reconciled) ยอดเงินถูกต้องครบถ้วนค่ะ', timestamp: new Date() }]);
    toast({ title: 'Reconcile สำเร็จ' });
  };

  const triggerContractSign = () => {
    setMessages(p => [
      ...p,
      {
        id: 'sign_' + Date.now(),
        sender: 'bot',
        text: '✍️ เอกสารทำสัญญาเช่าพร้อมให้ลงนามแล้ว',
        timestamp: new Date(),
        isFlex: true,
        flexType: 'contract_sign'
      }
    ]);
    toast({ title: 'จำลองแจ้งเตือนทำสัญญาสำเร็จ' });
  };

  return {
    activeRole, setActiveRole, messages, inputText, setInputText, isTyping, webviewTab, setWebviewTab, richMenuOpen, setRichMenuOpen,
    bills, slipImage, slipUploaded, paymentStatus, paidAmount, selectedTotal,
    roomNumberInput, setRoomNumberInput, ownerRentInput, setOwnerRentInput, ownerWaterInput, setOwnerWaterInput,
    ownerElectricInput, setOwnerElectricInput, ownerCommonInput, setOwnerCommonInput,
    maintenanceIssue, setMaintenanceIssue, maintenanceList, scrollRef,
    handleBillCheckbox, handleSendChat, handleUploadSlip, handleSendBill, handleApproveSlip, handleSendMaintenance, triggerExpiryWarning, triggerAppointmentReminder, triggerSigningReminder, simulateWebhookReconcile,
    handleSendQR, handleApproveAppointment, handleBroadcast, triggerContractSign,
  };
}
