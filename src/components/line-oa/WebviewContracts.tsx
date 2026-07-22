'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Stamp, BarChart3, LayoutDashboard, Shield, Building2, User, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ContractManager } from '@/components/shared/ContractManager';

const MOCK_SIG_OWNER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiPjxwYXRoIGQ9Ik0yMCw0MCBRNDAsMTAgNTAsMzAgVDgwLDM1IFExMDAsMjAgMTIwLDQwIFQxNjAsMjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBmMTcyYSIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
const MOCK_SIG_TENANT = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiPjxwYXRoIGQ9Ik0xMCw1MCBDMjAsMjAgNDAsMjAgNTAsNDAgQzYwLDYwIDgwLDYwIDkwLDIwIEMxMDAsMTAgMTIwLDUwIDE0MCwzMCBDMTUwLDIwIDE3MCw2MCAxODAsMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFkNGVkOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=';
const MOCK_SIG_AGENT = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiPjxwYXRoIGQ9Ik0zMCwyMCBMODAsNTAgTDEyMCwyMCBMMTUwLDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiM0MzM4Y2EiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+';

const SIGNATORIES = [
  { label: 'สมยศ ใจดี', role: 'ผู้ให้เช่า (Owner)', ip: '182.52.12.98' },
  { label: 'ทัตเทพ แสนสุข', role: 'ผู้เช่า (Tenant)', ip: '49.228.45.112' },
  { label: 'แสนดี นายหน้า', role: 'ตัวแทน (Agent)', ip: '202.44.89.55' },
];

export default function WebviewContracts({ onSendExpiryWarning, activeRole }: { onSendExpiryWarning?: () => void, activeRole?: string }) {
  const [activeSubTab, setActiveSubTab] = useState<'document' | 'stats'>('document');
  const [userRole, setUserRole] = useState('renter');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('primerent_user_role') || 'renter';
    setUserRole(role);
  }, []);

  return (
    <div className="space-y-4 font-thai">
      {/* Sub Tabs Selection */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
        <button
          onClick={() => setActiveSubTab('document')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-lg transition-all ${
            activeSubTab === 'document' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          สัญญาดิจิทัล
        </button>
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-lg transition-all ${
            activeSubTab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          {activeRole === 'tenant' || userRole === 'renter' ? 'สรุปข้อมูลเช่า' : 'สถิติและรายงาน'}
        </button>
      </div>

      {activeSubTab === 'document' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-gray-150">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold">
              <FileText className="w-4 h-4 text-emerald-600 animate-pulse" />
              สัญญาเช่ามีผลสมบูรณ์ (Active)
            </div>
            <Button
              onClick={() => toast({ title: 'ดาวน์โหลด PDF สำเร็จ' })}
              className="bg-[#06c755] hover:bg-[#05b34c] text-white text-[10px] font-black h-8 px-3 rounded-lg"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> PDF
            </Button>
          </div>

          <div className="max-h-[500px] overflow-y-auto rounded-xl border border-gray-200 bg-white">
            <ContractManager 
              contractId="mock_ctr_A1204" 
              lang="th" 
              isCompact={true} 
              forceRole={activeRole as any} 
              canEdit={activeRole === 'owner' || activeRole === 'agent' || activeRole === 'landlord' || userRole === 'owner' || userRole === 'agent' || userRole === 'landlord'} 
            />
          </div>
        </div>
      ) : (
        /* Stats Dashboard View based on Active User Role */
        <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3">
            <LayoutDashboard className="w-5 h-5 text-indigo-600" />
            <div>
              <h4 className="font-black text-sm text-gray-900">{activeRole === 'tenant' || userRole === 'renter' ? 'สรุปข้อมูลการเช่า' : 'แผงรายงานความคืบหน้าสัญญา'}</h4>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Role: {activeRole || userRole}</p>
            </div>
          </div>

          {(activeRole || userRole) === 'agent' && (
            <div className="space-y-5">
              {/* Stats overview */}
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <span className="text-[10px] text-emerald-600 font-bold block mb-1">คอมมิชชันเดือนนี้ (ประมาณการ)</span>
                  <span className="text-2xl font-black text-emerald-700">฿35,000</span>
                </div>
                <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full">
                  เพิ่มขึ้น 12% ⬆
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border p-3 rounded-xl"><span className="text-[10px] text-gray-500 font-bold block">ห้องดูแลทั้งหมด</span><span className="text-xl font-black text-slate-800">80 ห้อง</span></div>
                <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl"><span className="text-[10px] text-indigo-600 font-bold block">ปล่อยเช่าแล้ว (Active)</span><span className="text-xl font-black text-indigo-700">30 ห้อง</span></div>
                <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl"><span className="text-[10px] text-orange-600 font-bold block">ว่างรอหาผู้เช่า</span><span className="text-xl font-black text-orange-700">45 ห้อง</span></div>
                <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl"><span className="text-[10px] text-blue-600 font-bold block">รอดีลต่อสัญญา</span><span className="text-xl font-black text-blue-700">5 ห้อง</span></div>
              </div>

              {/* To-Do / Alerts */}
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl space-y-2">
                <h5 className="font-bold text-xs text-amber-800 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> สิ่งที่ต้องจัดการ (To-Do)</h5>
                <div className="flex justify-between items-center bg-white p-2 rounded border border-amber-50 text-[10px]">
                  <span className="font-semibold text-gray-700">Ideo Mobi Rama 9</span>
                  <span className="text-red-500 font-bold">สัญญาใกล้หมด</span>
                  <Button size="sm" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try { onSendExpiryWarning?.(); } catch (err) { console.error(err); }
                    alert('ส่งแจ้งเตือนสำเร็จ: ระบบได้ทำการส่งข้อความแจ้งเตือนไปที่ผู้เช่าเรียบร้อยแล้ว');
                    toast({title: 'ส่งแจ้งเตือนสำเร็จ', description: 'ส่งข้อความแจ้งเตือนให้ผู้เช่าต่อสัญญาแล้ว'});
                  }} className="h-6 text-[9px] bg-red-500 hover:bg-red-600 px-2 rounded-md text-white">แจ้งผู้เช่า</Button>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded border border-amber-50 text-[10px]">
                  <span className="font-semibold text-gray-700">The Base Phetchaburi</span>
                  <span className="text-indigo-600 font-bold">รอเจ้าของอนุมัติสิทธิ์</span>
                  <Button size="sm" variant="outline" className="h-6 text-[9px] border-indigo-200 text-indigo-600 px-2 rounded-md">ดูคำขอ</Button>
                </div>
              </div>

              {/* Property Selector */}
              <div className="space-y-2">
                <h5 className="font-black text-xs text-gray-800">รายการห้องพักที่ดูแล (Listings)</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {/* Item 1 - Direct Owner */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm hover:border-indigo-300 cursor-pointer transition-all" onClick={() => setActiveSubTab('document')}>
                    <div>
                      <div className="font-bold text-xs text-gray-900">Life Asoke Hype #22</div>
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5"><span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] uppercase font-black">Direct Owner</span> มีผู้เช่าแล้ว</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400"><FileText className="w-3.5 h-3.5" /></Button>
                  </div>
                  {/* Item 2 - Co-Broke */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm hover:border-indigo-300 cursor-pointer transition-all" onClick={() => setActiveSubTab('document')}>
                    <div>
                      <div className="font-bold text-xs text-gray-900">XT Phayathai #08</div>
                      <div className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 mt-0.5"><span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[8px] uppercase font-black">Co-Broke</span> หาผู้เช่าอยู่</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400"><Building2 className="w-3.5 h-3.5" /></Button>
                  </div>
                  {/* Item 3 - Pending */}
                  <div className="flex items-center justify-between p-3 border border-dashed rounded-xl bg-gray-50 text-gray-400">
                    <div className="font-bold text-xs">The Base Phetchaburi</div>
                    <div className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-semibold text-gray-500">รออนุมัติสิทธิ์ดูแล</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {((activeRole || userRole) === 'landlord' || (activeRole || userRole) === 'owner') && (
            <div className="space-y-5">
              {/* Stats overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border p-3 rounded-xl"><span className="text-[10px] text-gray-400 font-bold block">อสังหาริมทรัพย์ในมือ</span><span className="text-xl font-black text-slate-800">5 แห่ง</span></div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl"><span className="text-[10px] text-emerald-600 font-bold block">มีผู้เช่าแล้ว</span><span className="text-xl font-black text-emerald-700">3 แห่ง</span></div>
                <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl"><span className="text-[10px] text-indigo-600 font-bold block">รายได้รวมเดือนนี้</span><span className="text-xl font-black text-indigo-700">฿45,000</span></div>
                <div className="bg-red-50/50 border border-red-100 p-3 rounded-xl"><span className="text-[10px] text-red-600 font-bold block">ยอดค้างชำระ</span><span className="text-xl font-black text-red-700">฿0</span></div>
              </div>

              {/* To-Do / Alerts */}
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl space-y-2">
                <h5 className="font-bold text-xs text-amber-800 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> สิ่งที่ต้องจัดการ (To-Do)</h5>
                <div className="flex justify-between items-center bg-white p-2 rounded border border-amber-50 text-[10px]">
                  <span className="font-semibold text-gray-700">Sukhumvit Condo A-1204</span>
                  <span className="text-red-500 font-bold">สัญญาใกล้หมด</span>
                  <Button size="sm" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      onSendExpiryWarning?.();
                    } catch (err) {
                      console.error(err);
                    }
                    alert('ส่งแจ้งเตือนสำเร็จ: ระบบได้ทำการส่งข้อความแจ้งเตือนไปที่ผู้เช่าเรียบร้อยแล้ว');
                    toast({title: 'ส่งแจ้งเตือนสำเร็จ', description: 'ส่งข้อความแจ้งเตือนให้ผู้เช่าต่อสัญญาแล้ว'});
                  }} className="h-6 text-[9px] bg-red-500 hover:bg-red-600 px-2 rounded-md text-white">แจ้งผู้เช่า</Button>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded border border-amber-50 text-[10px]">
                  <span className="font-semibold text-gray-700">Asoke Residence #45</span>
                  <span className="text-amber-600 font-bold">รอคุณเซ็นสัญญา</span>
                  <Button size="sm" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSubTab('document');
                  }} className="h-6 text-[9px] bg-amber-500 hover:bg-amber-600 px-2 rounded-md text-white">ดูสัญญา</Button>
                </div>
              </div>

              {/* Property Selector */}
              <div className="space-y-2">
                <h5 className="font-black text-xs text-gray-800">รายการห้องพัก/สัญญาของคุณ</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm hover:border-indigo-300 cursor-pointer transition-all" onClick={() => setActiveSubTab('document')}>
                    <div>
                      <div className="font-bold text-xs text-gray-900">Sukhumvit Condo A-1204</div>
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5"><CheckCircle2 className="w-3 h-3" /> มีผู้เช่า (สัญญาปกติ)</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400"><FileText className="w-3.5 h-3.5" /></Button>
                  </div>
                  {/* Item 2 */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm hover:border-indigo-300 cursor-pointer transition-all" onClick={() => setActiveSubTab('document')}>
                    <div>
                      <div className="font-bold text-xs text-gray-900">Asoke Residence #45</div>
                      <div className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> รอการลงนาม</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400"><FileText className="w-3.5 h-3.5" /></Button>
                  </div>
                  {/* Item 3 */}
                  <div className="flex items-center justify-between p-3 border border-dashed rounded-xl bg-gray-50 text-gray-400">
                    <div className="font-bold text-xs">Phaya Thai Villa #01</div>
                    <div className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-semibold text-gray-500">ห้องว่าง</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeRole === 'tenant' || userRole === 'renter') && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border space-y-3 font-semibold text-xs text-gray-700">
                <div className="flex justify-between"><span>สัญญาปัจจุบัน:</span><span className="font-black text-gray-900">Sukhumvit Condo A-1204</span></div>
                <div className="flex justify-between"><span>ค่าเช่า:</span><span>฿12,000/เดือน</span></div>
                <div className="flex justify-between"><span>เงินมัดจำล่วงหน้า:</span><span>฿24,000</span></div>
                <div className="flex justify-between"><span>สถานะชำระเงินมัดจำ:</span><span className="text-emerald-600 font-black">จ่ายสำเร็จ (Verified)</span></div>
              </div>

              {/* New Lease Duration & Progress Block */}
              <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2 mb-1">
                   <Clock className="w-4 h-4 text-indigo-600" />
                   <h5 className="font-black text-sm text-gray-900">ระยะการเช่า 1 ปี</h5>
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>ความคืบหน้าสัญญา (4/12 เดือน)</span>
                  <span className="text-indigo-600 font-black">33%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>รอบบิลถัดไป:</span>
                    <span className="font-black text-gray-900">5 ส.ค. 2026 (฿12,000)</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>สถานะ:</span>
                    <span className="text-emerald-600 font-black flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ปกติ</span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setShowHistory(!showHistory)} className="w-full h-8 text-[11px] font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 mt-2">
                  {showHistory ? 'ซ่อนประวัติการชำระเงิน' : 'ดูประวัติการชำระเงินทั้งหมด'}
                </Button>

                {showHistory && (
                  <div className="pt-3 mt-3 border-t border-gray-100 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <h6 className="text-[10px] font-bold text-gray-500 mb-2">ประวัติการชำระเงิน 12 งวด</h6>
                    {[...Array(12)].map((_, idx) => {
                      const isPaid = idx < 4;
                      const isCurrent = idx === 4;
                      return (
                        <div key={idx} className={`flex justify-between items-center text-[10px] p-2 rounded-lg ${isPaid ? 'bg-emerald-50 text-emerald-800' : isCurrent ? 'bg-indigo-50 border border-indigo-100 text-indigo-800' : 'bg-gray-50 text-gray-400'}`}>
                          <span>งวดที่ {idx + 1}</span>
                          <span className="font-bold flex items-center gap-1">
                            {isPaid ? <><CheckCircle2 className="w-3 h-3" /> ชำระแล้ว</> : isCurrent ? 'รอชำระ (5 ส.ค.)' : 'ยังไม่ถึงกำหนด'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
