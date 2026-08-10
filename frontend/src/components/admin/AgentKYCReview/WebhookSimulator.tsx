import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface WebhookSimulatorProps {
  agentRequests: any[];
  selectedReqId: string;
  setSelectedReqId: (id: string) => void;
  selectedStatus: 'clear' | 'flagged';
  setSelectedStatus: (status: 'clear' | 'flagged') => void;
  receiveCriminalCheckWebhook: (requestId: string, status: 'clear' | 'flagged') => void;
}

export function WebhookSimulator({
  agentRequests,
  selectedReqId,
  setSelectedReqId,
  selectedStatus,
  setSelectedStatus,
  receiveCriminalCheckWebhook
}: WebhookSimulatorProps) {
  return (
    <Card className="border border-indigo-200 bg-indigo-50/5 rounded-2xl p-5 shadow-sm space-y-4 mt-6">
      <CardHeader className="p-0">
        <CardTitle className="text-base font-black text-indigo-950 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          ⚡ ตัวจำลองการส่งสัญญาณ Webhook (ทว. e-Criminal API)
        </CardTitle>
        <CardDescription className="text-xs text-indigo-700">
          ใช้ในการจำลองสัญญาณความปลอดภัยจากกองทะเบียนประวัติอาชญากร ส่งผลการตรวจของเอเจ้นต์กลับมาระบบอัตโนมัติ
        </CardDescription>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">เลือกใบสมัครเอเจ้นต์</label>
          <select 
            value={selectedReqId}
            onChange={e => setSelectedReqId(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-9"
          >
            {agentRequests.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.id} - สถานะตรวจประวัติ: {r.criminalCheckStatus?.toUpperCase() || 'NONE'})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">ผลการตรวจประวัติ (Criminal Status)</label>
          <select 
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as any)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-9"
          >
            <option value="clear">✓ CLEAR (ประวัติขาวสะอาด / ผ่าน)</option>
            <option value="flagged">❌ FLAGGED (พบประวัติคดีอาชญากรรม)</option>
          </select>
        </div>

        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs h-9 rounded-xl shadow-md border-none"
          onClick={() => {
            const targetId = selectedReqId || agentRequests[0]?.id;
            if (!targetId) {
              toast({
                title: '❌ ไม่พบใบสมัคร',
                description: 'ไม่มีใบสมัครเอเจ้นต์ให้ทดสอบในระบบ'
              });
              return;
            }
            receiveCriminalCheckWebhook(targetId, selectedStatus);
            if (typeof window !== 'undefined') {
              window.alert(`[DEV SIMULATOR] ยิงจำลอง Webhook สำเร็จ!\nใบสมัคร ID: ${targetId}\nผลตรวจประวัติ: ${selectedStatus.toUpperCase()}`);
            }
            toast({
              title: '⚡ จำลองสัญญาณ Webhook สำเร็จ',
              description: `ส่งข้อมูลผลตรวจ [${selectedStatus.toUpperCase()}] ให้ใบสมัคร ${targetId} สำเร็จ`
            });
          }}
        >
          ⚡ ยิงจำลอง Webhook เข้าเซิร์ฟเวอร์
        </Button>
      </div>
    </Card>
  );
}
