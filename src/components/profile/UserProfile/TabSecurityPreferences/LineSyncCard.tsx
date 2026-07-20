import React from 'react';
import { Button } from '@/components/ui/button';

interface LineSyncCardProps {
  lineLinked: boolean;
  lineUserId: string | null;
  loadingLine: boolean;
  isTh: boolean;
  onUnlink: () => void;
}

export function LineSyncCard({ lineLinked, lineUserId, loadingLine, isTh, onUnlink }: LineSyncCardProps) {
  return (
    <div className="p-8 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50/50 to-emerald-50/50 flex flex-col md:flex-row items-center gap-6 shadow-sm shadow-green-100/50">
      <div className="w-16 h-16 bg-[#06C755] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100/50 shrink-0 font-black text-xs">
        LINE
      </div>
      <div className="text-center md:text-left flex-1 space-y-1">
        <h4 className="font-black text-green-950 text-xl flex items-center justify-center md:justify-start gap-2">
          LINE Account Link
        </h4>
        <p className="text-green-800 font-semibold text-sm leading-relaxed">
          {loadingLine ? (
            'กำลังตรวจสอบสถานะ...'
          ) : lineLinked ? (
            `เชื่อมต่อสำเร็จ (User ID: ${lineUserId}) คุณจะได้รับแจ้งเตือนผ่านทาง LINE`
          ) : (
            'เชื่อมต่อ LINE เพื่อรับแจ้งเตือนค่านัดหมายดูห้อง บิลค่าเช่า และการแจ้งเตือนสำคัญทันที'
          )}
        </p>
      </div>
      {!loadingLine && (
        lineLinked ? (
          <Button
            variant="destructive"
            onClick={onUnlink}
            className="rounded-xl px-6 py-6 font-black text-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            {isTh ? 'ยกเลิกการเชื่อมต่อ' : 'Disconnect'}
          </Button>
        ) : (
          <a
            href="/chat/line-oa"
            className="inline-flex items-center justify-center bg-[#06C755] hover:bg-[#05b34c] text-white hover:scale-105 transition-all rounded-xl px-6 py-4 font-black text-sm shadow-xl shadow-green-200 animate-pulse"
          >
            {isTh ? 'เชื่อมต่อทันที' : 'Connect LINE'}
          </a>
        )
      )}
    </div>
  );
}
