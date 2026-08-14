'use client';

import React, { useState } from 'react';
import { translations } from '@/lib/translations';
import { Home, Users, CheckCircle2, Coins, Building2, BarChart3, Activity, FileText, Bell, Trash2, Radar, MessageSquare, MapPin, X, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import { AgentPerformanceDashboard } from './AgentPerformanceDashboard';
import { TabContracts } from '@/components/contract/ContractSystem/TabContracts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ContractDocument } from '../contract/ContractSystem/ContractDocument';
import { SignaturePad } from '../shared/ContractManager/SignaturePad';

interface AgentDashboardProps {
  lang: 'th' | 'en' | 'cn';
}

export function AgentDashboard({ lang }: AgentDashboardProps) {
  const t = translations[lang] || translations.th;
  const isTh = lang === 'th';
  const { notifications, markAsRead, removeNotification } = useNotifications();
  const [selectedPayout, setSelectedPayout] = useState<any>(null);

  // Filter agent notifications:
  // Hide Admin System Alerts, but show expiry alerts, wishlist/price drop alerts, LINE OA chat, appointment reminders, welcome, etc.
  const agentNotifications = notifications.filter(n => {
    return !n.id.startsWith('mock_admin_');
  });

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id);
    
    if (n.action?.url) {
      window.location.href = n.action.url;
      return;
    }
    
    const id = n.id;
    if (id.startsWith('welcome_signup_') || id === 'mock_welcome_signup') {
      window.location.href = '/profile';
    } else if (id === 'mock_price_wishlist') {
      window.location.href = '/profile';
    } else if (id === 'mock_new_in_zone' || id === 'mock_saved_search_match') {
      window.location.href = '/listings';
    } else if (id === 'mock_line_chat_message') {
      window.location.href = '/chat';
    } else if (id.startsWith('mock_appointment_')) {
      window.location.href = '/owner/dashboard?tab=properties';
    } else if (id === 'mock_contract_expiry_30_days') {
      window.location.href = '/owner/dashboard?tab=contracts';
    } else if (id === 'mock_monthly_invoice_alert') {
      window.location.href = '/owner/dashboard?tab=billing';
    } else if (id.startsWith('mock_expiry_')) {
      window.location.href = '/owner/dashboard?tab=properties';
    }
  };
  
  const [chartMode, setChartMode] = useState<'deals' | 'commissions'>('deals');
  const [commissionFilter, setCommissionFilter] = useState<string>('Jun');
  const [interactiveRooms, setInteractiveRooms] = useState([
    { id: '1', name: isTh ? 'Ideo Mix Sukhumvit (ห้อง 102)' : 'Ideo Mix Sukhumvit (Room 102)', status: 'rented', type: 'Condo 1BR', rent: 14000 },
    { id: '2', name: isTh ? 'The Base Park East (ห้อง 405)' : 'The Base Park East (Room 405)', status: 'rented', type: 'Condo 2BR', rent: 18500 },
    { id: '3', name: isTh ? 'Condo Asoke Place (ห้อง 1209)' : 'Condo Asoke Place (Room 1209)', status: 'rented', type: 'Condo 2BR', rent: 22000 },
    { id: '4', name: isTh ? 'Studio BTS Onnut (ห้อง 77)' : 'Studio BTS Onnut (Room 77)', status: 'vacant', type: 'Studio Room', rent: 9500 },
    { id: '5', name: isTh ? 'Whizdom 101 (ห้อง 2304)' : 'Whizdom 101 (Room 2304)', status: 'vacant', type: 'Condo 1BR', rent: 16000 },
  ]);

  // State for Owner Matching Opportunities (Owner posts seeking agents)
  const [matchingOpportunities, setMatchingOpportunities] = useState([
    {
      id: 'opp-1',
      project: 'คอนโด Life Asoke Hype (1 ห้องนอน 35 ตร.ม.)',
      details: 'กุญแจฝากไว้ที่นิติบุคคล สามารถพาลูกค้าไปดูได้เลยค่ะ',
      commission: '1 เดือน (สำหรับสัญญา 1 ปี)',
      ownerName: 'คุณมยุรี (เจ้าของห้อง)',
      location: 'พระราม 9, อโศก',
      status: 'searching', // searching, matched
      doorCode: '8894',
      keyLocation: 'นิติบุคคล ชั้น 1',
      distance: '2.1 km',
      agentsNearbyCount: 28,
      isSigned: false
    },
    {
      id: 'opp-2',
      project: 'Ideo Mix Sukhumvit (ห้อง 102)',
      details: 'ห้องสตูดิโอแต่งครบพร้อมเข้าอยู่ สนใจทักแชทขอข้อมูลเพิ่มเติมได้ค่ะ',
      commission: '1 เดือน',
      ownerName: 'คุณสมศักดิ์ (เจ้าของห้อง)',
      location: 'สุขุมวิท, อุดมสุข',
      status: 'searching',
      doorCode: '1025',
      keyLocation: 'ตู้จดหมายรหัส 4321',
      distance: '1.5 km',
      agentsNearbyCount: 19,
      isSigned: false
    }
  ]);

  // States for Agent Authorization Document & Signatures
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedOwnerListing, setSelectedOwnerListing] = useState<any>(null);
  const [authSignatureDataUrl, setAuthSignatureDataUrl] = useState('');
  const [authContract, setAuthContract] = useState<any>(null);

  const handleStartAuthSign = (listing: any) => {
    setSelectedOwnerListing(listing);
    setAuthSignatureDataUrl('');
    setAuthContract({
      id: `cnt-auth-${listing.id}`,
      propertyName: `แบบร่างหนังสือแต่งตั้งและมอบอำนาจตัวแทนเอเจ้นท์ - ${listing.project}`,
      propertyAddress: listing.location,
      zone: 'โซนทั่วไป',
      unitNo: 'ห้องพักมอบอำนาจ',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rentAmount: 0,
      deposit: 0,
      ownerName: listing.ownerName,
      tenantName: '-',
      agentName: 'คุณ (นายหน้า)',
      hasAgent: true,
      status: 'pending_signatures',
      signatures: {
        owner: {
          signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><path d="M 10,15 C 30,5 40,25 60,15 C 70,10 80,10 90,15" stroke="black" stroke-width="2" fill="none"/></svg>',
          name: listing.ownerName,
          signedAt: new Date().toISOString()
        }
      }
    });
    setIsAuthModalOpen(true);
  };

  const handleAuthSignSubmit = () => {
    if (!authSignatureDataUrl || !selectedOwnerListing) return;
    
    // Update matchingOpportunities state
    setMatchingOpportunities(prev => prev.map(item => {
      if (item.id === selectedOwnerListing.id) {
        return { ...item, status: 'matched', isSigned: true };
      }
      return item;
    }));

    // Add to interactiveRooms to show it's now managed!
    setInteractiveRooms(prev => [
      ...prev,
      {
        id: `managed-${selectedOwnerListing.id}`,
        name: selectedOwnerListing.project,
        status: 'vacant',
        type: 'Condo 1BR',
        rent: 15000
      }
    ]);
    
    setIsAuthModalOpen(false);
    alert('✅ ลงนามสัญญามอบสิทธิ์และจับคู่สำเร็จ! ข้อมูลถูกปลดล็อกและห้องถูกเพิ่มเข้าสู่รายการห้องภายใต้การจัดการเรียบร้อยแล้วค่ะ');
  };

  const toggleRoomStatus = (id: string) => {
    setInteractiveRooms(prev => prev.map(room => {
      if (room.id === id) {
        return { ...room, status: room.status === 'rented' ? 'vacant' : 'rented' };
      }
      return room;
    }));
  };

  const rentedInteractive = interactiveRooms.filter(r => r.status === 'rented').length;
  const vacantInteractive = interactiveRooms.filter(r => r.status === 'vacant').length;

  // Recalculate based on 5 interactive + 50 base units
  const totalManaged = 55;
  const occupiedCount = 35 + rentedInteractive;
  const vacantCount = 15 + vacantInteractive;

  // Base commission (฿110,000) + ฿6,000 for each rented interactive room
  const currentCommission = 110000 + (rentedInteractive * 6000);

  const getFilteredCommissionDetails = () => {
    switch (commissionFilter) {
      case 'Jan':
        return { label: isTh ? 'ค่าคอมมิชชั่น ม.ค.' : 'Commission Jan', value: '฿45,000', desc: isTh ? 'ค่าคอมมิชชั่นเดือน มกราคม' : 'Commission for January' };
      case 'Feb':
        return { label: isTh ? 'ค่าคอมมิชชั่น ก.พ.' : 'Commission Feb', value: '฿68,000', desc: isTh ? 'ค่าคอมมิชชั่นเดือน กุมภาพันธ์' : 'Commission for February' };
      case 'Mar':
        return { label: isTh ? 'ค่าคอมมิชชั่น มี.ค.' : 'Commission Mar', value: '฿39,000', desc: isTh ? 'ค่าคอมมิชชั่นเดือน มีนาคม' : 'Commission for March' };
      case 'Apr':
        return { label: isTh ? 'ค่าคอมมิชชั่น เม.ย.' : 'Commission Apr', value: '฿85,000', desc: isTh ? 'ค่าคอมมิชชั่นเดือน เมษายน' : 'Commission for April' };
      case 'May':
        return { label: isTh ? 'ค่าคอมมิชชั่น พ.ค.' : 'Commission May', value: '฿50,000', desc: isTh ? 'ค่าคอมมิชชั่นเดือน พฤษภาคม' : 'Commission for May' };
      case 'Yearly':
        const yearlySum = 287000 + currentCommission;
        return { label: isTh ? 'ค่าคอมมิชชั่น รายปี' : 'Yearly Commission', value: `฿${yearlySum.toLocaleString()}`, desc: isTh ? 'ยอดสะสมรายปี 2026' : 'Cumulative total for 2026' };
      case 'Jun':
      default:
        return { label: isTh ? 'ค่าคอมมิชชั่น มิ.ย. (MTD)' : 'Commission Jun (MTD)', value: `฿${currentCommission.toLocaleString()}`, desc: isTh ? 'เป้ารายเดือนสะสม (เดือนปัจจุบัน)' : 'Month-to-date income (current)' };
    }
  };

  const commDetails = getFilteredCommissionDetails();

  // Mock Chart Data for deals closed and commission monthly
  const chartData = {
    deals: [
      { label: isTh ? 'ม.ค.' : 'Jan', value: 8 },
      { label: isTh ? 'ก.พ.' : 'Feb', value: 12 },
      { label: isTh ? 'มี.ค.' : 'Mar', value: 7 },
      { label: isTh ? 'เม.ย.' : 'Apr', value: 15 },
      { label: isTh ? 'พ.ค.' : 'May', value: 9 },
      { label: isTh ? 'มิ.ย.' : 'Jun', value: rentedInteractive + 6 }, // dynamic
    ],
    commissions: [
      { label: isTh ? 'ม.ค.' : 'Jan', value: 45000 },
      { label: isTh ? 'ก.พ.' : 'Feb', value: 68000 },
      { label: isTh ? 'มี.ค.' : 'Mar', value: 39000 },
      { label: isTh ? 'เม.ย.' : 'Apr', value: 85000 },
      { label: isTh ? 'พ.ค.' : 'May', value: 50000 },
      { label: isTh ? 'มิ.ย.' : 'Jun', value: currentCommission - 50000 }, // dynamic
    ]
  };

  const maxChartValue = Math.max(...(chartMode === 'deals' ? chartData.deals.map(d => d.value) : chartData.commissions.map(d => d.value)));

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 font-sans">
      <header className="mb-2">
        <h1 className="text-2xl font-black text-gray-900 mb-1">
          {t.nav_agent_dashboard || 'Agent Dashboard'}
        </h1>
        <p className="text-xs text-gray-500 font-semibold">
          {isTh ? 'สถิติการปิดดีล รายได้ และรายการดูแลอสังหาริมทรัพย์แบบครบวงจร' : 'Comprehensive performance analytics, commissions, and property lists.'}
        </p>
      </header>

      {/* Agent Performance Dashboard */}
      <AgentPerformanceDashboard lang={lang} occupiedCount={occupiedCount} totalManaged={totalManaged} />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {[
          { key: 'total', label: isTh ? 'ห้องในมือทั้งหมด' : 'Total Units Managed', value: `${totalManaged} ห้อง`, icon: Building2, color: 'bg-teal-500/10 text-teal-700 border-teal-100', desc: isTh ? 'คอนโด & อพาร์ตเมนต์' : 'Condos & Apartments' },
          { key: 'occupied', label: isTh ? 'ปล่อยเช่าอยู่ตอนนี้' : 'Occupied / Rented', value: `${occupiedCount} ห้อง`, icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-700 border-emerald-100', desc: isTh ? 'ผู้เช่าพักอาศัยอยู่' : 'Active tenants' },
          { key: 'vacant', label: isTh ? 'กำลังรอปล่อยเช่า' : 'Vacant / Available', value: `${vacantCount} ห้อง`, icon: Home, color: 'bg-amber-500/10 text-amber-700 border-amber-100', desc: isTh ? 'ว่างพร้อมเปิดดีล' : 'Ready for matching' },
          { key: 'commission', label: commDetails.label, value: commDetails.value, icon: Coins, color: 'bg-indigo-500/10 text-indigo-700 border-indigo-100', desc: commDetails.desc },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-150 rounded-2xl p-5 sm:p-6 shadow-xs transition-all hover:shadow-md flex flex-col justify-between min-w-0">
            <div>
              <div className="flex justify-between items-start gap-2">
                <div className={cn('p-2.5 rounded-xl shrink-0 border shadow-2xs', kpi.color)}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                {kpi.key === 'commission' ? (
                  <select 
                    value={commissionFilter}
                    onChange={(e) => setCommissionFilter(e.target.value)}
                    className="bg-slate-100 hover:bg-slate-200 text-[9px] text-gray-800 border-none rounded-lg px-2 py-1 font-black outline-none cursor-pointer transition-colors shadow-inner shrink-0"
                  >
                    <option value="Jun">{isTh ? 'มิ.ย. (เดือนนี้)' : 'Jun (MTD)'}</option>
                    <option value="May">{isTh ? 'พ.ค. 2026' : 'May 2026'}</option>
                    <option value="Apr">{isTh ? 'เม.ย. 2026' : 'Apr 2026'}</option>
                    <option value="Mar">{isTh ? 'มี.ค. 2026' : 'Mar 2026'}</option>
                    <option value="Feb">{isTh ? 'ก.พ. 2026' : 'Feb 2026'}</option>
                    <option value="Jan">{isTh ? 'ม.ค. 2026' : 'Jan 2026'}</option>
                    <option value="Yearly">{isTh ? 'ทั้งปี 2026' : 'Yearly 2026'}</option>
                  </select>
                ) : (
                  <Badge className="bg-slate-50 text-slate-400 font-bold border-none text-[8px] tracking-wider uppercase shrink-0">Verified</Badge>
                )}
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mt-3 truncate tracking-tight">{kpi.value}</p>
              <p className="text-[11px] text-gray-700 font-bold mt-1 truncate">{kpi.label}</p>
            </div>
            <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-slate-100/60">
              <p className="text-[9px] text-gray-400 font-semibold truncate">{kpi.desc}</p>
              {kpi.key === 'commission' && (
                <button 
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/tax/wht?role=agent&agentId=AG-88941');
                      const data = await res.json();
                      if (data.success) {
                        alert(isTh 
                          ? `[หนังสือรับรองหักภาษี ณ ที่จ่าย 3%]\nเลขที่เอกสาร: ${data.data.documentNo}\nผู้ได้รับเงิน: ${data.data.agentName}\nค่า Commission รวม: ฿${data.data.grossCommission.toLocaleString()}\nหักภาษี 3%: ฿${data.data.whtAmount.toLocaleString()}\nสุทธิรับจริง: ฿${data.data.netPayout.toLocaleString()}\n\nดาวน์โหลดไฟล์ PDF เรียบร้อยแล้ว!` 
                          : `Downloaded WHT 3% Certificate: ${data.data.documentNo}`);
                      }
                    } catch (e) {
                      alert('Error fetching WHT certificate');
                    }
                  }}
                  className="text-[9px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-100 transition-all cursor-pointer shrink-0"
                >
                  {isTh ? '📄 ใบ WHT 3%' : '📄 WHT 3%'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Performance Analytics Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              {isTh ? 'กราฟแสดงวิเคราะห์สถิติผลงาน' : 'Monthly Performance Analytics'}
            </h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
              {isTh ? 'เปรียบเทียบผลดีลและค่าคอมมิชชั่นปี 2026' : 'Monthly transactions and earnings metrics.'}
            </p>
          </div>
          {/* Chart Mode Toggle Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setChartMode('deals')}
              className={cn('px-3 py-1.5 text-[9px] font-black rounded-lg transition-all', chartMode === 'deals' ? 'bg-white text-teal-700 shadow-xs' : 'text-gray-500 hover:text-gray-900')}
            >
              {isTh ? 'จำนวนห้องปล่อยเช่าได้' : 'Deals Closed'}
            </button>
            <button 
              onClick={() => setChartMode('commissions')}
              className={cn('px-3 py-1.5 text-[9px] font-black rounded-lg transition-all', chartMode === 'commissions' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-900')}
            >
              {isTh ? 'รายได้ค่าคอมมิชชั่น' : 'Commission Income'}
            </button>
          </div>
        </div>

        {/* Styled HTML Bar Chart */}
        <div className="pt-2">
          <div className="flex items-end justify-between gap-3 md:gap-6 h-40 bg-slate-50/50 p-4 border border-gray-150 rounded-xl relative shadow-inner">
            {(chartMode === 'deals' ? chartData.deals : chartData.commissions).map((data, idx) => {
              const heightPercentage = maxChartValue > 0 ? (data.value / maxChartValue) * 85 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white font-bold text-[8px] px-2 py-1 rounded-md shadow-md z-10 pointer-events-none whitespace-nowrap">
                    {chartMode === 'deals' ? `${data.value} ห้อง` : `฿${data.value.toLocaleString()}`}
                  </div>
                  {/* The Bar */}
                  <div 
                    className={cn(
                      'w-full max-w-[28px] rounded-t-md transition-all duration-500 hover:opacity-95 cursor-pointer relative shadow-sm',
                      chartMode === 'deals' ? 'bg-gradient-to-t from-teal-600 to-teal-400' : 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                    )}
                    style={{ height: `${heightPercentage}%` }}
                  />
                  <span className="text-[9px] text-gray-400 font-bold mt-2">{data.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* อสังหาริมทรัพย์ที่เปิดรับนายหน้า (Agent Matching) */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-blue-150 pb-2.5">
          <div>
            <h4 className="font-black text-blue-900 text-sm flex items-center gap-1.5">
              <Radar className="w-4 h-4 text-blue-600" />
              {isTh ? 'จับคู่นายหน้าหาผู้เช่า (Agent Matching)' : 'Agent Matching (Opportunities)'}
            </h4>
            <p className="text-[10px] text-blue-700/80 font-semibold mt-0.5">
              {isTh ? 'รายการทรัพย์สินที่เจ้าของห้องมอบสิทธิ์ให้ทำตลาดแบบเปิด ลงนามรับงานเพื่อสแกนและจับคู่สิทธิ์ 1:1 ได้ทันที' : 'Listings open for agent representation. Sign to match immediately.'}
            </p>
          </div>
          <Badge className="bg-blue-600 text-white font-bold border-none text-[8px]">AGENT MATCHING</Badge>
        </div>

        <div className="space-y-3">
          {matchingOpportunities.map((listing) => (
            <div key={listing.id} className={cn("p-4 border rounded-xl flex flex-col sm:flex-row justify-between gap-4 transition-all relative overflow-hidden bg-white shadow-2xs hover:shadow-sm", listing.status === 'matched' ? 'border-green-200 bg-green-50/10' : 'border-blue-100')}>
              {listing.status === 'matched' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
              )}
              <div className="flex-1 min-w-0 font-sans">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge className="bg-blue-50 text-blue-700 font-bold border border-blue-100 text-[9px] px-1.5 py-0">
                    เจ้าของหาเอเจนต์
                  </Badge>
                  <span className="text-[10.5px] text-gray-500 font-semibold">โพสต์โดย {listing.ownerName}</span>
                </div>
                <h5 className="font-black text-gray-950 text-sm truncate">{listing.project}</h5>
                <p className="text-[11px] text-gray-600 font-medium mt-1 leading-relaxed">{listing.details}</p>
                <div className="flex flex-wrap gap-2 mt-2.5 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    <MapPin className="w-3 h-3" /> {listing.location} (ห่าง {listing.distance})
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    <Radar className="w-3 h-3" /> มีเอเจนต์ใกล้เคียง {listing.agentsNearbyCount} คน
                  </span>
                </div>

                {listing.status === 'matched' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-black text-green-800">
                      <CheckCircle2 className="w-4 h-4 text-green-600 animate-bounce" />
                      <span>จับคู่สำเร็จ! ข้อมูลทรัพย์ถูกเพิ่มลงในพอร์ตจำลองปล่อยเช่าของคุณแล้ว</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-green-150 border-dashed">
                      <div>
                        <span className="text-gray-500 font-medium block">รหัสประตูดิจิทัล (Door Code):</span>
                        <span className="font-black text-green-950 text-sm font-mono">{listing.doorCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium block">จุดรับฝากกุญแจ (Key Location):</span>
                        <span className="font-black text-green-950 text-sm">{listing.keyLocation}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex sm:flex-col justify-between sm:justify-end gap-3 sm:min-w-[150px] shrink-0 items-start sm:items-end">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-gray-500 font-medium block">ค่าคอมมิชชันที่เสนอ</span>
                  <span className="text-base font-black text-blue-600">{listing.commission}</span>
                </div>
                {listing.status === 'matched' ? (
                  <button 
                    onClick={() => alert(`เปิดห้องแชทจำลอง 1:1 กับ ${listing.ownerName}`)}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1 w-full sm:w-auto justify-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> แชทกับเจ้าของ
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStartAuthSign(listing)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm w-full sm:w-auto text-center"
                  >
                    ลงนามรับงาน (Sign & Match)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Rooms List Panel */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-150 pb-2.5">
          <div>
            <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              {isTh ? 'ห้องพักภายใต้การจัดการ (จำลองคลิกอัปเดต)' : 'Managed Properties (Click Toggle Status)'}
            </h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
              {isTh ? 'คลิกที่ปุ่มสถานะเพื่อเปลี่ยนและทดสอบการอัปเดตกราฟ/การ์ดด้านบนแบบเรียลไทม์' : 'Toggle room status to test live calculations.'}
            </p>
          </div>
          <Badge className="bg-teal-500 text-white font-bold border-none text-[8px]">55 UNITS TOTAL</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {interactiveRooms.map((room) => (
            <div key={room.id} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-150 shadow-xs hover:border-gray-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                <Home className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0 font-sans">
                <p className="font-black text-gray-900 text-xs truncate">{room.name}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">{room.type} · ฿{room.rent.toLocaleString()}/{isTh ? 'เดือน' : 'mo'}</p>
              </div>
              <button
                onClick={() => toggleRoomStatus(room.id)}
                className={cn(
                  'text-[9px] font-black border-none px-3 py-1.5 rounded-lg transition-all uppercase select-none hover:scale-105 active:scale-95 shadow-sm',
                  room.status === 'rented' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                )}
              >
                {room.status === 'rented' ? (isTh ? 'ปล่อยเช่าแล้ว' : 'Rented') : (isTh ? 'ว่าง/รอปล่อย' : 'Vacant')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CRM Lead Funnel & Recent Contracts Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Lead Funnel Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              {isTh ? 'กรวยข้อมูลลูกค้า (CRM Lead Funnel)' : 'CRM Lead Funnel'}
            </h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
              {isTh ? 'ความคืบหน้าของรายชื่อลูกค้าเป้าหมายและการบริการในพอร์ต' : 'Pipeline status of prospects and customers.'}
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              { stage: isTh ? 'ลูกค้าสนใจใหม่ (Inquiries)' : 'New Inquiries', count: 18, color: 'bg-blue-600', percent: '90%', desc: isTh ? 'รอนัดหมายดูสถานที่จริง' : 'Awaiting property viewing' },
              { stage: isTh ? 'พาเข้าชมสถานที่ (Viewings)' : 'Property Viewings', count: 12, color: 'bg-amber-500', percent: '65%', desc: isTh ? 'อยู่ระหว่างนำทางและแนะนำห้องพัก' : 'Guided room tours in progress' },
              { stage: isTh ? 'เจรจาสัญญาเช่า (Negotiations)' : 'Under Negotiation', count: 9, color: 'bg-indigo-600', percent: '45%', desc: isTh ? 'กำลังตกลงราคาและเงื่อนไขเอกสาร' : 'Agreeing terms and contract drafts' },
              { stage: isTh ? 'ปิดดีลสำเร็จเดือนนี้ (Closed Won)' : 'Deals Won MTD', count: rentedInteractive + 6, color: 'bg-emerald-600', percent: '80%', desc: isTh ? 'ชำระมัดจำและเริ่มระยะเวลาเช่าแล้ว' : 'Signed & deposit received' },
            ].map((funnel, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-700">{funnel.stage}</span>
                  <span className="text-gray-900 font-black">{funnel.count} {isTh ? 'ราย' : 'leads'}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                  <div className={cn('h-full rounded-full transition-all duration-500', funnel.color)} style={{ width: funnel.percent }} />
                </div>
                <p className="text-[9px] text-gray-400 font-semibold">{funnel.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Lease Contracts & Expiry Alerts Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              {isTh ? 'แจ้งเตือนสัญญาใกล้หมดอายุ & กำหนดดูแลห้องพัก' : 'Lease Expirations & Property Maintenance'}
            </h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
              {isTh ? 'เรียงลำดับสัญญาที่ใกล้หมดอายุขึ้นก่อน พร้อมกำหนดการซักผ้าม่าน ล้างแอร์ และวันเก็บค่าเช่า' : 'Sorted by contract expiration date with maintenance schedules.'}
            </p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {[
              { name: 'Ideo Mix Sukhumvit (102)', tenant: 'Somchai J.', rent: 14000, daysLeft: 15, expireDate: '19 ส.ค. 2026', curtainDate: '15 ส.ค. 2026', acDate: '20 ส.ค. 2026', rentDueDate: 'ทุกวันที่ 1', payWindowDays: 5, urgent: true },
              { name: 'The Base Park East (405)', tenant: 'Sarah J.', rent: 18500, daysLeft: 42, expireDate: '15 ก.ย. 2026', curtainDate: '1 ก.ย. 2026', acDate: '10 ก.ย. 2026', rentDueDate: 'ทุกวันที่ 5', payWindowDays: 3, urgent: false },
              { name: 'Condo Asoke Place (1209)', tenant: 'Kittisak P.', rent: 22000, daysLeft: 88, expireDate: '30 ต.ค. 2026', curtainDate: '15 ต.ค. 2026', acDate: '25 ต.ค. 2026', rentDueDate: 'ทุกวันที่ 1', payWindowDays: 7, urgent: false },
              { name: 'Studio BTS Onnut (77)', tenant: 'Napa W.', rent: 9500, daysLeft: 150, expireDate: '31 ธ.ค. 2026', curtainDate: '10 ธ.ค. 2026', acDate: '15 ธ.ค. 2026', rentDueDate: 'ทุกวันที่ 28', payWindowDays: 5, urgent: false },
              { name: 'Whizdom 101 (2304)', tenant: 'David L.', rent: 16000, daysLeft: 210, expireDate: '28 ก.พ. 2027', curtainDate: '15 ก.พ. 2027', acDate: '20 ก.พ. 2027', rentDueDate: 'ทุกวันที่ 10', payWindowDays: 5, urgent: false }
            ].sort((a, b) => a.daysLeft - b.daysLeft).map((c, i) => (
              <div key={i} className={cn("p-3.5 border rounded-xl space-y-2.5 transition-all", c.urgent ? "bg-rose-50/40 border-rose-200" : "bg-white border-gray-150 hover:bg-slate-50/50")}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-gray-900 text-xs">{c.name}</p>
                      {c.urgent && <Badge className="bg-rose-500 text-white font-bold text-[8px] border-none px-1.5 py-0">หมดอายุเร็วๆ นี้</Badge>}
                    </div>
                    <p className="text-[9.5px] text-gray-500 font-bold mt-0.5">{isTh ? 'ผู้เช่า' : 'Tenant'}: {c.tenant} · ฿{c.rent.toLocaleString()}/ด</p>
                  </div>
                  <div className="text-right">
                    <span className={cn("text-[9.5px] font-black px-2 py-0.5 rounded-lg border", c.urgent ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-amber-50 text-amber-800 border-amber-200")}>
                      ⏳ เหลือ {c.daysLeft} วัน (หมด {c.expireDate})
                    </span>
                  </div>
                </div>

                {/* Maintenance & Billing Schedule Bar */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-[9px] font-bold border-t border-gray-100 border-dashed">
                  <div className="bg-blue-50/70 p-1.5 rounded-lg text-blue-900 border border-blue-100">
                    <span className="text-gray-500 font-medium block">{isTh ? '🧺 วันซักผ้าม่าน' : 'Curtain Wash'}</span>
                    <span className="font-black text-blue-950">{c.curtainDate}</span>
                  </div>
                  <div className="bg-teal-50/70 p-1.5 rounded-lg text-teal-900 border border-teal-100">
                    <span className="text-gray-500 font-medium block">{isTh ? '❄️ วันล้างแอร์' : 'AC Clean'}</span>
                    <span className="font-black text-teal-950">{c.acDate}</span>
                  </div>
                  <div className="bg-emerald-50/70 p-1.5 rounded-lg text-emerald-900 border border-emerald-100">
                    <span className="text-gray-500 font-medium block">{isTh ? '💰 เก็บค่าเช่า' : 'Rent Due'}</span>
                    <span className="font-black text-emerald-950">{c.rentDueDate} (ชำระใน {c.payWindowDays} วัน)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Split Payouts (สำหรับเอเจ้นต์และ Co-Agents) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-gray-150 pb-2.5">
          <div>
            <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-indigo-600" />
              {isTh ? 'รายงานค่าคอมมิชชันและส่วนแบ่ง Co-Agent (รอบจ่ายอัตโนมัติทุกวันที่ 25)' : 'My Commission Splits & Auto-Payouts'}
            </h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
              {isTh ? 'ระบบจะคำนวณและแบ่งจ่ายตรงอัตโนมัติในวันที่ 25 ของเดือน คลิกเพื่อดูรายละเอียดห้องที่ปล่อยเช่าและส่วนแบ่ง' : 'Monthly splits processed automatically on the 25th. Click to view detailed splits.'}
            </p>
          </div>
          <Badge className="bg-emerald-500 text-white font-bold border-none text-[8px]">ACTIVE AUTO-PAYOUT</Badge>
        </div>

        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-xs text-left font-sans">
            <thead className="bg-gray-50 border-b border-gray-150 text-[10px] text-gray-400 font-black uppercase">
              <tr>
                <th className="p-3">{isTh ? 'ห้องที่ปล่อยเช่า' : 'Property / Deal'}</th>
                <th className="p-3">{isTh ? 'ค่าเช่า/สัญญา' : 'Rent / Contract'}</th>
                <th className="p-3 text-center">{isTh ? 'บทบาทของคุณ' : 'My Role'}</th>
                <th className="p-3 text-center">{isTh ? 'ส่วนแบ่งของคุณ (%)' : 'My Split (%)'}</th>
                <th className="p-3 text-center">{isTh ? 'ยอดรับสุทธิ' : 'Net Amount'}</th>
                <th className="p-3 text-center">{isTh ? 'สถานะรอบการโอน' : 'Status'}</th>
                <th className="p-3 text-right">{isTh ? 'รายละเอียด' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {[
                { id: 'pay_001', room: 'Ideo Mix Sukhumvit (ห้อง 102)', rent: 12000, contract: 'doc_001', role: 'Main Agent', splitPercent: '70%', netAmount: 8400, status: 'waiting', mainAgent: 'วรรณา สุขใจ (คุณ)', coAgents: [{ name: 'ธีรพล มั่นคง', role: 'Co-Agent 1', percent: '20%', amount: 2400 }], websiteFee: 1200 },
                { id: 'pay_002', room: 'The Base Park East (ห้อง 405)', rent: 15000, contract: 'doc_004', role: 'Main Agent', splitPercent: '90%', netAmount: 13500, status: 'disbursed', mainAgent: 'วรรณา สุขใจ (คุณ)', coAgents: [], websiteFee: 1500 },
                { id: 'pay_003', room: 'Condo Asoke Place (ห้อง 1209)', rent: 20000, contract: 'doc_002', role: 'Co-Agent', splitPercent: '10%', netAmount: 2000, status: 'waiting', mainAgent: 'สมชาย นามดี', coAgents: [{ name: 'วรรณา สุขใจ (คุณ)', role: 'Co-Agent 1', percent: '10%', amount: 2000 }, { name: 'เก่ง กล้าหาญ', role: 'Co-Agent 2', percent: '10%', amount: 2000 }], websiteFee: 2000 }
              ].map(pay => (
                <tr key={pay.id} className="hover:bg-slate-50/40">
                  <td className="p-3">
                    <p className="font-black text-gray-900">{pay.room}</p>
                    <p className="text-[9px] text-gray-400 font-semibold">ID: {pay.id}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-gray-850">฿{pay.rent.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-400 font-semibold">{pay.contract}</p>
                  </td>
                  <td className="p-3 text-center">
                    <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase',
                      pay.role === 'Main Agent' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    )}>
                      {pay.role === 'Main Agent' ? (isTh ? '👤 เอเจ้นต์หลัก' : 'Main Agent') : (isTh ? '👥 โคเอเจ้นต์ร่วม' : 'Co-Agent')}
                    </span>
                  </td>
                  <td className="p-3 text-center font-black text-slate-800">{pay.splitPercent}</td>
                  <td className="p-3 text-center font-black text-green-600">฿{pay.netAmount.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <span className={cn('text-[8px] font-black px-2 py-0.5 rounded-lg border uppercase',
                      pay.status === 'disbursed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    )}>
                      {pay.status === 'disbursed' ? (isTh ? '✓ โอนแล้ว' : 'Disbursed') : (isTh ? '⏳ รอโอน 25 ของเดือน' : 'Waiting Batch')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => setSelectedPayout(pay)}
                      className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer select-none"
                    >
                      🔍 {isTh ? 'ดูรายละเอียด' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Split Detail Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden font-sans">
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                  🛡️ {isTh ? 'สัดส่วนและรายละเอียดการแบ่งเงิน' : 'Commission Split Details'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">PAYOUT ID: {selectedPayout.id}</p>
              </div>
              <button 
                onClick={() => setSelectedPayout(null)}
                className="text-slate-400 hover:text-white transition-colors text-xs font-black bg-transparent border-none cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Condo info */}
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{isTh ? 'ห้องที่ปล่อยเช่าได้สำเร็จ' : 'Rented Property'}</p>
                <p className="font-black text-gray-900 text-sm">{selectedPayout.room}</p>
                <p className="text-[10px] text-gray-500 font-bold">{isTh ? 'ค่าเช่าและสัญญา' : 'Rent & Contract'}: ฿{selectedPayout.rent.toLocaleString()}/ด · {selectedPayout.contract}</p>
              </div>

              <hr className="border-gray-100" />

              {/* Commission Splits Hierarchy */}
              <div className="space-y-3.5">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{isTh ? 'ตารางการกระจายเงินส่วนแบ่ง (Split Distribution)' : 'Split Distribution'}</p>
                
                {/* 1. Main Agent */}
                <div className="flex items-center justify-between text-xs p-2.5 bg-green-50/40 border border-green-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">👤</span>
                    <div>
                      <p className="font-black text-green-950">{isTh ? 'เอเจ้นต์หลัก (Main Agent)' : 'Main Agent'}</p>
                      <p className="text-[9px] text-green-600 font-bold">{selectedPayout.mainAgent}</p>
                    </div>
                  </div>
                  <span className="font-black text-green-700">
                    ฿{((selectedPayout.rent * 0.7) * (selectedPayout.coAgents.length > 0 ? 1 : 1.285)).toLocaleString(undefined, {maximumFractionDigits: 0})} ({selectedPayout.coAgents.length > 0 ? '70%' : '90%'})
                  </span>
                </div>

                {/* 2. Co-agents */}
                {selectedPayout.coAgents.map((co: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2.5 bg-indigo-50/40 border border-indigo-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">👥</span>
                      <div>
                        <p className="font-black text-indigo-950">{co.role} ({co.name})</p>
                        <p className="text-[9px] text-indigo-500 font-bold">{isTh ? 'โคเอเจ้นต์ร่วมรับส่วนแบ่งเท่ากัน' : 'Co-Agent Equal Split'}</p>
                      </div>
                    </div>
                    <span className="font-black text-indigo-700">฿{co.amount.toLocaleString()} ({co.percent})</span>
                  </div>
                ))}

                {/* 3. Platform Fee */}
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 border border-gray-150 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">💻</span>
                    <div>
                      <p className="font-black text-gray-900">{isTh ? 'ค่าธรรมเนียมเว็บไซต์' : 'Website Fee'}</p>
                      <p className="text-[9px] text-gray-400 font-bold">PrimeRent Platform Escrow</p>
                    </div>
                  </div>
                  <span className="font-black text-slate-700">฿{selectedPayout.websiteFee.toLocaleString()} (10%)</span>
                </div>
              </div>

              {/* Automatic System Banner */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-[10.5px] text-indigo-900 font-bold leading-relaxed">
                ⚡ {isTh 
                  ? 'ระบบอัตโนมัติจะประมวลยอดและตัดจ่ายเงินโอนเข้าบัญชีธนาคารที่คุณผูกไว้โดยตรงในวันที่ 25 ของเดือน ไม่ต้องกดดำเนินการใดๆ' 
                  : 'Automated batch payout processes this split directly into your registered bank account on the 25th of the month.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Notifications & Activity Feed */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-rose-500" />
            {isTh ? 'การแจ้งเตือนสำหรับตัวแทน (Agent Activity Alerts & Feed)' : 'Agent Notifications & Feed'}
          </h4>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
            {isTh ? 'รายงานนัดดูห้อง แชทลูกค้าจำลอง และสถานะประกาศเช่าของคุณ' : 'Stay updated with your client showing schedules, chat logs, and expirations.'}
          </p>
        </div>

        {agentNotifications.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 font-bold bg-slate-50 rounded-xl">
            {isTh ? 'ไม่มีการแจ้งเตือนในขณะนี้' : 'No notifications available.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[350px] overflow-y-auto pr-1">
            {agentNotifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-4 border rounded-xl flex items-start justify-between gap-3 transition-all relative overflow-hidden",
                  n.read ? "bg-slate-50/50 border-gray-150" : "bg-rose-50/10 border-rose-100/50 hover:bg-rose-50/20"
                )}
              >
                {!n.read && <div className="absolute left-0 top-0 w-1 h-full bg-rose-500" />}
                <div className="flex-1 min-w-0 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-gray-900 leading-snug">{n.title}</span>
                    {!n.read && <Badge className="bg-rose-500 text-white font-bold border-none text-[8px] scale-90 px-1 py-0 h-3 flex items-center justify-center shrink-0">NEW</Badge>}
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[8px] text-gray-400 mt-2 font-bold">{new Date(n.timestamp).toLocaleString()}</p>
                  {n.action && (
                    <button 
                      onClick={() => handleNotificationClick(n)}
                      className="mt-2.5 text-[9px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer select-none"
                    >
                      {n.action.label}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!n.read && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="p-1 text-gray-400 hover:text-green-600 hover:bg-slate-100 rounded-lg transition-colors text-[9px] font-black border border-gray-100"
                    >
                      {isTh ? 'อ่านแล้ว' : 'Mark Read'}
                    </button>
                  )}
                  <button 
                    onClick={() => removeNotification(n.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors border border-gray-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contracts & Draft Templates Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <TabContracts userRole="agent" />
      </div>

      {/* Dialog for Agent Authorization Agreement */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="max-w-[840px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-none font-sans">
          <div className="bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <span className="font-black text-gray-900 text-sm">
                ลงนามมอบหมายสิทธิ์นายหน้า (Agent Authorization Sign)
              </span>
              <DialogClose asChild>
                <button className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </DialogClose>
            </div>

            {/* Document body */}
            {authContract && (
              <div className="p-4 sm:p-8 bg-gray-100">
                <div className="bg-white shadow-2xl mx-auto max-w-[794px] p-6 sm:p-12 border border-gray-200 rounded-none relative">
                  <ContractDocument
                    contract={authContract as any}
                    userRole="agent"
                    onChange={(patch) => setAuthContract((prev: any) => ({ ...prev, ...patch }))}
                  />

                  {/* Owner Signature Details */}
                  <div className="mt-8 border-t border-dashed border-gray-200 pt-6 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">ลายมือชื่อผู้มอบอำนาจ (เจ้าของห้อง)</p>
                    <img src={authContract.signatures.owner.signatureDataUrl} alt="Owner Signature" className="max-h-12 mt-2 border border-gray-100 p-1" />
                    <p className="text-[10px] text-gray-400 mt-1">ลงนามโดย {authContract.signatures.owner.name} เมื่อ {new Date(authContract.signatures.owner.signedAt).toLocaleDateString('th-TH')}</p>
                  </div>

                  {/* Agent Signature Area */}
                  {authContract.signatures.agent ? (
                    <div className="mt-6 border-t border-dashed border-gray-200 pt-6 flex flex-col items-center justify-center text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase">ลายมือชื่อผู้รับมอบอำนาจ (นายหน้า)</p>
                      <img src={authContract.signatures.agent.signatureDataUrl} alt="Agent Signature" className="max-h-16 mt-2 border border-gray-100 p-1" />
                    </div>
                  ) : (
                    <div className="mt-8 border-t border-dashed border-gray-200 pt-6 bg-blue-50/50 p-4 rounded-xl">
                      <p className="text-sm font-black text-gray-900 mb-3 text-center">ลงลายมือชื่อผู้รับมอบอำนาจ (นายหน้า) เพื่อยืนยันการรับสิทธิ์</p>
                      <SignaturePad
                        onSigned={(url) => setAuthSignatureDataUrl(url)}
                        onClear={() => setAuthSignatureDataUrl('')}
                        hasSigned={!!authSignatureDataUrl}
                        lang="th"
                      />
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleAuthSignSubmit}
                          disabled={!authSignatureDataUrl}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors shadow-md shadow-blue-500/10"
                        >
                          ยืนยันลายเซ็นร่วมกัน
                        </button>
                        <button
                          onClick={() => setIsAuthModalOpen(false)}
                          className="px-6 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
