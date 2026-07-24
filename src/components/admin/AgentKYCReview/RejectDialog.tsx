import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface RejectDialogProps {
  rejectDialog: { requestId: string; userId: string } | null;
  setRejectDialog: (dialog: { requestId: string; userId: string } | null) => void;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  handleReject: () => void;
}

export function RejectDialog({
  rejectDialog,
  setRejectDialog,
  rejectReason,
  setRejectReason,
  handleReject
}: RejectDialogProps) {
  if (!rejectDialog) return null;

  return (
    <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(''); }}>
      <DialogContent className="max-w-sm w-[95vw] rounded-2xl font-thai">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            ปฏิเสธการสมัครเอเจ้นต์
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-black text-slate-700 mb-1 block">เหตุผลที่ปฏิเสธ *</label>
            <textarea 
              value={rejectReason} 
              onChange={e => setRejectReason(e.target.value)} 
              placeholder="ระบุเหตุผลที่ปฏิเสธเอกสาร..." 
              className="w-full border rounded-xl p-3 text-xs font-bold min-h-[80px] focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" 
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => { setRejectDialog(null); setRejectReason(''); }} 
              className="flex-1 rounded-xl font-black text-xs"
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={!rejectReason.trim()} 
              className="flex-1 rounded-xl font-black text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              ยืนยันปฏิเสธ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
