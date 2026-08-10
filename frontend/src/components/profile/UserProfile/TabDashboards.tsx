import React, { useState } from 'react';
import { Home, Users, CheckCircle2, TrendingUp, Coins, Building2, DollarSign, Star, Share2, BarChart3, Activity, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import { OwnerPropertiesTab } from '@/components/owner/OwnerDashboard/OwnerPropertiesTab';
import { useUser, useFirestore } from '@/firebase';
import { useProfileData } from '../PublicProfileModal/useProfileData';
import { useListings } from '../PublicProfileModal/useListings';
import { useReviews } from '../PublicProfileModal/useReviews';
import { ListingsTab } from '../PublicProfileModal/ListingsTab';
import { ReviewsTab } from '../PublicProfileModal/ReviewsTab';
import { handleSubmittingReview } from '../PublicProfileModal/handlers';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabDashboardsProps {
  lang: Language;
  activeTab: string;
}

export function TabDashboards({ lang, activeTab }: TabDashboardsProps) {
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const isTh = lang === 'th';
  const profileData = useProfileData(currentUser?.uid || 'current_user', lang);
  const { displayListings, recommendedListings } = useListings(profileData, db);
  const { combinedReviews, avgRating, setDbReviews } = useReviews(currentUser?.uid || 'current_user', lang, db);

  const [publicProfileSubTab, setPublicProfileSubTab] = useState<'listings' | 'reviews'>('listings');

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [chartMode, setChartMode] = useState<'deals' | 'commissions'>('deals');
  const [commissionFilter, setCommissionFilter] = useState<string>('Jun');
  const [interactiveRooms, setInteractiveRooms] = useState([
    { id: '1', name: lang === 'th' ? 'Ideo Mix Sukhumvit (ห้อง 102)' : 'Ideo Mix Sukhumvit (Room 102)', status: 'rented', type: 'Condo 1BR', rent: 14000 },
    { id: '2', name: lang === 'th' ? 'The Base Park East (ห้อง 405)' : 'The Base Park East (Room 405)', status: 'rented', type: 'Condo 2BR', rent: 18500 },
    { id: '3', name: lang === 'th' ? 'Condo Asoke Place (ห้อง 1209)' : 'Condo Asoke Place (Room 1209)', status: 'rented', type: 'Condo 2BR', rent: 22000 },
    { id: '4', name: lang === 'th' ? 'Studio BTS Onnut (ห้อง 77)' : 'Studio BTS Onnut (Room 77)', status: 'vacant', type: 'Studio Room', rent: 9500 },
    { id: '5', name: lang === 'th' ? 'Whizdom 101 (ห้อง 2304)' : 'Whizdom 101 (Room 2304)', status: 'vacant', type: 'Condo 1BR', rent: 16000 },
  ]);

  const toggleRoomStatus = (id: string) => {
    setInteractiveRooms(prev => prev.map(room => {
      if (room.id === id) {
        return { ...room, status: room.status === 'rented' ? 'vacant' : 'rented' };
      }
      return room;
    }));
  };

  if (activeTab === 'agent_dashboard') {
    const isTh = lang === 'th';
    const rentedInteractive = interactiveRooms.filter(r => r.status === 'rented').length;
    const vacantInteractive = interactiveRooms.filter(r => r.status === 'vacant').length;

    // Recalculate based on 5 interactive + 50 base units
    const totalManaged = 55;
    const occupiedCount = 35 + rentedInteractive;
    const vacantCount = 15 + vacantInteractive;
    const responseRate = '98%';

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
      <div className="p-6 md:p-8 pt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 font-sans">
        
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'total', label: isTh ? 'ห้องในมือทั้งหมด' : 'Total Units Managed', value: `${totalManaged} ห้อง`, icon: Building2, color: 'bg-teal-500/10 text-teal-700 border-teal-100', desc: isTh ? 'คอนโด & อพาร์ตเมนต์' : 'Condos & Apartments' },
            { key: 'occupied', label: isTh ? 'ปล่อยเช่าอยู่ตอนนี้' : 'Occupied / Rented', value: `${occupiedCount} ห้อง`, icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-700 border-emerald-100', desc: isTh ? 'ผู้เช่าพักอาศัยอยู่' : 'Active tenants' },
            { key: 'vacant', label: isTh ? 'กำลังรอปล่อยเช่า' : 'Vacant / Available', value: `${vacantCount} ห้อง`, icon: Home, color: 'bg-amber-500/10 text-amber-700 border-amber-100', desc: isTh ? 'ว่างพร้อมเปิดดีล' : 'Ready for matching' },
            { key: 'commission', label: commDetails.label, value: commDetails.value, icon: Coins, color: 'bg-indigo-500/10 text-indigo-700 border-indigo-100', desc: commDetails.desc },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md hover:scale-[1.01] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div className={cn('p-2.5 rounded-xl shrink-0 border', kpi.color)}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  {kpi.key === 'commission' ? (
                    <select 
                      value={commissionFilter}
                      onChange={(e) => setCommissionFilter(e.target.value)}
                      className="bg-slate-100 hover:bg-slate-200 text-[9px] text-gray-800 border-none rounded-lg px-2 py-1 font-black outline-none cursor-pointer transition-colors shadow-inner"
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
                    <Badge className="bg-slate-50 text-slate-400 font-bold border-none text-[8px] tracking-wider uppercase">Verified</Badge>
                  )}
                </div>
                <p className="text-xl font-black text-gray-900 mt-4">{kpi.value}</p>
                <p className="text-[10px] text-gray-800 font-black mt-1">{kpi.label}</p>
              </div>
              <p className="text-[9px] text-gray-400 font-semibold mt-1">{kpi.desc}</p>
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
        </div>        {/* CRM Lead Funnel & Recent Contracts Split Panel */}
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

          {/* Recent Lease Contracts Panel */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                {isTh ? 'ผลงานการทำสัญญาเช่าล่าสุด (3-Party Signature)' : 'Recent Lease Contracts'}
              </h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                {isTh ? 'ตรวจสอบความคืบหน้าของลายเซ็นอิเล็กทรอนิกส์ในสัญญา' : 'Status check of 3-party digital signatures.'}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Ideo Mix Sukhumvit (102)', tenant: 'Somchai J.', agent: 'You (Agent)', rent: 14000, term: '1 Year', status: 'completed', ownerSigned: true, tenantSigned: true, agentSigned: true },
                { name: 'The Base Park East (405)', tenant: 'Sarah J.', agent: 'You (Agent)', rent: 18500, term: '1 Year', status: 'completed', ownerSigned: true, tenantSigned: true, agentSigned: true },
                { name: 'Studio BTS Onnut (77)', tenant: 'Napa W.', agent: 'You (Agent)', rent: 9500, term: '6 Months', status: 'pending', ownerSigned: true, tenantSigned: true, agentSigned: false },
              ].map((contract, i) => (
                <div key={i} className="p-3 border border-gray-100 rounded-xl space-y-2 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{contract.name}</p>
                      <p className="text-[9px] text-gray-400 font-semibold">{isTh ? 'ผู้เช่า' : 'Tenant'}: {contract.tenant} · ฿{contract.rent.toLocaleString()}/{isTh ? 'ด' : 'mo'} ({contract.term})</p>
                    </div>
                    <Badge 
                      className={cn(
                        'text-[8px] font-black border-none px-2 py-0.5',
                        contract.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 animate-pulse'
                      )}
                    >
                      {contract.status === 'completed' ? (isTh ? 'ลงนามเสร็จสิ้น' : 'Signed') : (isTh ? 'รอนายหน้าลงนาม' : 'Pending signature')}
                    </Badge>
                  </div>
                  {/* Signing Checklist Status */}
                  <div className="flex gap-4 pt-1 text-[9px] font-bold text-gray-500 border-t border-gray-50 border-dashed">
                    <span className="flex items-center gap-1">
                      <span className={cn('w-2.5 h-2.5 rounded-full flex items-center justify-center text-[7px] text-white', contract.ownerSigned ? 'bg-emerald-500' : 'bg-gray-200')}>✓</span>
                      {isTh ? 'ผู้ให้เช่า' : 'Owner'}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={cn('w-2.5 h-2.5 rounded-full flex items-center justify-center text-[7px] text-white', contract.tenantSigned ? 'bg-emerald-500' : 'bg-gray-250')}>✓</span>
                      {isTh ? 'ผู้เช่า' : 'Tenant'}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={cn('w-2.5 h-2.5 rounded-full flex items-center justify-center text-[7px] text-white', (contract.name.includes('Sukhumvit') || contract.name.includes('Base')) ? (interactiveRooms.find(r => r.id === '1' || r.id === '2')?.status === 'rented' ? 'bg-emerald-500' : 'bg-gray-200') : (contract.agentSigned ? 'bg-emerald-500' : 'bg-gray-200'))}>✓</span>
                      {isTh ? 'นายหน้า' : 'Agent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Zones */}
        <div>
          <h4 className="font-black text-gray-800 mb-3">{lang === 'th' ? 'Zone ที่ชำนาญ' : 'Expertise Zones'}</h4>
          <div className="flex flex-wrap gap-2">
            {['สุขุมวิท', 'อโศก', 'ทองหล่อ', 'อ่อนนุช', 'BTS สีลม'].map((zone) => (
              <span key={zone} className="bg-teal-50 text-teal-700 border border-teal-100 text-sm font-bold px-3 py-1.5 rounded-none">📍 {zone}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'owner_properties') {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <OwnerPropertiesTab lang={lang as any} />
      </div>
    );
  }

  if (activeTab === 'public_profile') {
    return (
      <div className="p-8 md:p-10 pt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-none p-6 flex flex-col md:flex-row items-center gap-6 border border-amber-100">
          <div className="text-center">
            <p className="text-6xl font-black text-amber-500">{avgRating.toFixed(1)}</p>
            <div className="flex items-center gap-1 justify-center mt-1">
              {[1,2,3,4,5].map((s) => <Star key={s} className={cn('w-4 h-4', s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-amber-200')} />)}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">{combinedReviews.length} {lang === 'th' ? 'รีวิว' : 'reviews'}</p>
          </div>
          <div className="flex-1 space-y-2 w-full">
            {[{ label: lang === 'th' ? 'ความเป็นมืออาชีพ' : 'Professionalism', score: 5 }, { label: lang === 'th' ? 'ความรวดเร็วในการตอบ' : 'Response Speed', score: 4.8 }, { label: lang === 'th' ? 'ความซื่อสัตย์' : 'Trustworthiness', score: 4.9 }, { label: lang === 'th' ? 'ความรู้เรื่องทำเล' : 'Local Knowledge', score: 4.7 }].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <p className="text-xs text-gray-600 font-medium w-40 shrink-0">{item.label}</p>
                <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${(item.score / 5) * 100}%` }} /></div>
                <span className="text-xs font-black text-amber-600 w-8 text-right">{item.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Listings & Reviews Section */}
        {profileData && (
          <div className="border border-gray-100 p-5 bg-white space-y-4">
            <Tabs value={publicProfileSubTab} onValueChange={(v: any) => setPublicProfileSubTab(v)} className="w-full">
              <TabsList className="bg-white border-b border-gray-100 rounded-none p-0 h-auto justify-start">
                <TabsTrigger value="listings" className="rounded-none font-bold text-xs px-5 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  {lang === 'th' ? 'รายการเช่าของคุณ' : 'Your Listings'} ({displayListings.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-none font-bold text-xs px-5 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  {lang === 'th' ? 'รีวิวและคะแนน' : 'Reviews & Ratings'} ({combinedReviews.length})
                </TabsTrigger>
              </TabsList>
              
              <div className="pt-4">
                <ListingsTab 
                  profileData={profileData}
                  displayListings={displayListings}
                  recommendedListings={recommendedListings}
                  isTh={isTh}
                  lang={lang}
                />
                
                <ReviewsTab 
                  combinedReviews={combinedReviews}
                  avgRating={avgRating}
                  showReviewForm={showReviewForm}
                  newRating={newRating}
                  newComment={newComment}
                  newAuthorName={newAuthorName}
                  submittingReview={submittingReview}
                  isTh={isTh}
                  onToggleReviewForm={() => setShowReviewForm(!showReviewForm)}
                  onSetNewRating={setNewRating}
                  onSetNewComment={setNewComment}
                  onSetNewAuthorName={setNewAuthorName}
                  onSubmitReview={() => handleSubmittingReview(
                    newComment, newAuthorName, newRating,
                    currentUser?.uid || 'current_user', currentUser, db,
                    setDbReviews, setNewComment, setNewAuthorName,
                    setShowReviewForm, setSubmittingReview, lang
                  )}
                />
              </div>
            </Tabs>
          </div>
        )}

        <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-none border border-gray-100">
          <div className="w-10 h-10 rounded-none bg-gray-100 flex items-center justify-center"><Share2 className="w-5 h-5 text-gray-500" /></div>
          <div className="flex-1">
            <p className="font-bold text-gray-800 text-sm">{lang === 'th' ? 'แชร์โปรไฟล์ของคุณ' : 'Share Your Profile'}</p>
            <p className="text-xs text-gray-400">{lang === 'th' ? 'ส่งลิงก์โปรไฟล์ให้ลูกค้าได้เลย' : 'Send your profile link to clients'}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-none font-bold border-gray-200">{lang === 'th' ? 'คัดลอกลิงก์' : 'Copy Link'}</Button>
        </div>
      </div>
    );
  }

  return null;
}
