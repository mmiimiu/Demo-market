'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAdminStore } from '@/hooks/useAdminStore';
import { toast } from '@/hooks/use-toast';
import { PendingRequestsTable } from './PendingRequestsTable';
import { KycDocumentsTable } from './KycDocumentsTable';
import { WebhookSimulator } from './WebhookSimulator';
import { RejectDialog } from './RejectDialog';

export function AgentKYCReview() {
  const { agentRequests, documents, loadDatabase, handleAgentKYC, receiveCriminalCheckWebhook } = useAdminStore();
  const [search, setSearch] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{ requestId: string; userId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [selectedReqId, setSelectedReqId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'clear' | 'flagged'>('clear');

  useEffect(() => {
    loadDatabase();
  }, [loadDatabase]);

  useEffect(() => {
    if (agentRequests.length > 0 && !selectedReqId) {
      setSelectedReqId(agentRequests[0].id);
    }
  }, [agentRequests, selectedReqId]);

  const filtered = agentRequests.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (requestId: string, userId: string) => {
    handleAgentKYC(requestId, userId, 'approve');
    toast({ title: '✓ อนุมัติเอกสารเอเจ้นต์แล้ว' });
  };

  const handleReject = () => {
    if (!rejectDialog || !rejectReason.trim()) return;
    handleAgentKYC(rejectDialog.requestId, rejectDialog.userId, 'reject', rejectReason);
    toast({ title: '❌ ปฏิเสธเอกสารเอเจ้นต์' });
    setRejectDialog(null);
    setRejectReason('');
  };

  const kycDocs = documents.filter(d => d.documentType === 'kyc');

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ตรวจสอบ + อนุมัติ Agent</h1>
          <p className="text-xs text-slate-500 font-bold">Review เอกสาร KYC, อนุมัติ/ปฏิเสธ พร้อม reason</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาผู้สมัคร..." className="pl-9 h-9 text-xs rounded-xl" />
      </div>

      <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-black text-slate-800">🕵️ รายการขออัปเกรดสมัครเอเจ้นต์รอตรวจสอบ</CardTitle>
          <CardDescription className="text-xs">ตรวจสอบเอกสารการยืนยันตัวตน, NDID, Liveness score และประวัติบริษัทประกอบการ</CardDescription>
        </CardHeader>
        <PendingRequestsTable 
          filtered={filtered} 
          handleApprove={handleApprove} 
          setRejectDialog={setRejectDialog} 
        />
      </Card>

      <KycDocumentsTable kycDocs={kycDocs} />

      <WebhookSimulator 
        agentRequests={agentRequests}
        selectedReqId={selectedReqId}
        setSelectedReqId={setSelectedReqId}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        receiveCriminalCheckWebhook={receiveCriminalCheckWebhook}
      />

      <RejectDialog 
        rejectDialog={rejectDialog}
        setRejectDialog={setRejectDialog}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        handleReject={handleReject}
      />
    </div>
  );
}
