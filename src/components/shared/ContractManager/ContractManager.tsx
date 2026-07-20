import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, Download, Edit2, AlertTriangle, Share2, History, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { ContractManagerProps, ContractTemplate, AuditEvent } from './types';
import { TEMPLATES, AUDIT_CONFIG, MOCK_AUDIT_LOG } from './constants';
import { SignaturePad } from './SignaturePad';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { ContractEditModal } from './ContractEditModal';
import { handleSignSubmit } from './handlers';
import { handleDownloadPDF, handleShareLine } from './utils';

export function ContractManager({ contractId, lang }: ContractManagerProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { data: dbContract, loading: dbLoading } = useDoc<any>(db && user && !user.isMock && contractId ? `contracts/${contractId}` : null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [signingRole, setSigningRole] = useState<'tenant' | 'owner' | 'agent' | null>(null);
  const [template, setTemplate] = useState<ContractTemplate>('monthly');
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(MOCK_AUDIT_LOG);
  const [showAudit, setShowAudit] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [hasSigned, setHasSigned] = useState(false);
  const [editMonthlyRent, setEditMonthlyRent] = useState('');
  const [editDepositAmount, setEditDepositAmount] = useState('');
  const [editAdvanceRentAmount, setEditAdvanceRentAmount] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const loadContractData = useCallback(() => {
    if (user && !user.isMock && dbContract) { setContract(dbContract); setLoading(false); return; }
    const stored = localStorage.getItem('contracts');
    if (stored) {
      try { const match = JSON.parse(stored).find((c: any) => c.id === contractId); if (match) setContract(match); } catch (e) {}
    }
    setLoading(false);
  }, [dbContract, user, contractId]);

  useEffect(() => { loadContractData(); }, [loadContractData]);
  useEffect(() => {
    if (contract) {
      setEditMonthlyRent(contract.monthlyRent?.toString() || '');
      setEditDepositAmount(contract.depositAmount?.toString() || '');
      setEditAdvanceRentAmount(contract.advanceRentAmount?.toString() || '');
      setEditStartDate((contract.startDate ? new Date(contract.startDate) : new Date()).toISOString().substring(0, 10));
      setEditEndDate((contract.endDate ? new Date(contract.endDate) : new Date()).toISOString().substring(0, 10));
      if (contract.template) setTemplate(contract.template);
      if (contract.auditLog) setAuditLog(contract.auditLog as AuditEvent[]);
    }
  }, [contract]);

  if (loading || dbLoading) return <div className="py-20 text-center text-sm font-bold text-gray-400">กำลังโหลดเอกสารสัญญา...</div>;
  if (!contract) return <div className="py-20 text-center text-gray-700 font-bold"><AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />ไม่พบข้อมูลสัญญาเช่า</div>;

  const signaturesCount = Object.keys(contract.signatures || {}).length;
  const isSigned = contract.status === 'active';
  const currentUserRole = user?.isMock
    ? (localStorage.getItem('primerent_user_role') === 'owner' ? 'owner' : 'tenant')
    : (user?.uid === contract.ownerId ? 'owner' : user?.uid === contract.tenantId ? 'tenant' : 'agent');

  return (
    <div className="space-y-8 p-4 font-thai">
      {isEditing ? (
        <ContractEditModal
          editMonthlyRent={editMonthlyRent} setEditMonthlyRent={setEditMonthlyRent}
          editDepositAmount={editDepositAmount} setEditDepositAmount={setEditDepositAmount}
          editAdvanceRentAmount={editAdvanceRentAmount} setEditAdvanceRentAmount={setEditAdvanceRentAmount}
          template={template} setTemplate={setTemplate}
          editStartDate={editStartDate} setEditStartDate={setEditStartDate}
          editEndDate={editEndDate} setEditEndDate={setEditEndDate}
          contractId={contractId} user={user} db={db} contract={contract} setContract={setContract}
          setIsEditing={setIsEditing} setAuditLog={setAuditLog} toast={toast} lang={lang}
        />
      ) : (
        <Card className="border-2 border-gray-200 shadow-xl rounded-none bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b p-8 flex flex-row justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-6 h-6 text-primary" /></div>
                <div><CardTitle className="text-2xl font-bold text-gray-900">สัญญาเช่าดิจิทัล</CardTitle><CardDescription className="text-xs text-gray-500 mt-1">Contract ID: {contractId}</CardDescription></div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isSigned ? "default" : "secondary"} className="font-bold">{isSigned ? '✅ บังคับใช้' : '⏳ รอลงนาม'}</Badge>
                <Badge variant="outline" className="font-bold border-primary/20 text-primary">{TEMPLATES[template]?.labelTh || 'สัญญาเช่า'}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <DocumentPreviewModal contract={contract} contractId={contractId} lang={lang} template={template} />
              <Button onClick={() => setIsEditing(true)} variant="outline" size="icon" className="rounded-none"><Edit2 className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-lg"><p className="text-[10px] font-bold text-gray-400">ค่าเช่า/เดือน</p><p className="text-xl font-bold text-primary">฿{Number(contract.monthlyRent || 0).toLocaleString()}</p></div>
              <div className="bg-slate-50 p-4 rounded-lg"><p className="text-[10px] font-bold text-gray-400">เงินมัดจำ</p><p className="text-xl font-bold text-gray-800">฿{Number(contract.depositAmount || 0).toLocaleString()}</p></div>
              <div className="bg-slate-50 p-4 rounded-lg"><p className="text-[10px] font-bold text-gray-400">ลายเซ็น</p><p className="text-xl font-bold text-gray-800">{signaturesCount}/3</p></div>
              <div className="bg-slate-50 p-4 rounded-lg"><p className="text-[10px] font-bold text-gray-400">สถานะ</p><p className="text-xl font-bold text-emerald-600">{isSigned ? 'Active' : 'Pending'}</p></div>
            </div>
            <div className="border-t pt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">ลงนามสัญญา</h3>
              <div className="grid grid-cols-3 gap-4">
                {['tenant', 'owner', ...(contract.agentId ? ['agent'] : [])].map((role) => {
                  const sig = contract.signatures?.[role];
                  return (
                    <div key={role} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold uppercase">{role}</span>{sig ? <Check className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-gray-400" />}</div>
                      {sig ? <p className="text-xs text-gray-600 font-bold">{sig.name}</p> : role === currentUserRole && !isSigned ? (<Button onClick={() => setSigningRole(role as any)} size="sm" className="w-full font-bold">ลงนาม</Button>) : <p className="text-xs text-gray-400">รอลงนาม</p>}
                    </div>
                  );
                })}
              </div>
            </div>
            {signingRole && (
              <div className="border-t pt-6 bg-blue-50/50 p-6 rounded-lg">
                <h3 className="text-sm font-bold text-gray-900 mb-4">ลงนามในฐานะ {signingRole}</h3>
                <SignaturePad onSigned={setSignatureDataUrl} onClear={() => { setSignatureDataUrl(''); setHasSigned(false); }} hasSigned={hasSigned} lang={lang} />
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => handleSignSubmit(hasSigned, signatureDataUrl, signingRole, contractId, user, db, contract, setContract, setHasSigned, setSigningRole, setAuditLog, toast, lang)} disabled={!hasSigned} className="flex-1 bg-primary font-bold">ยืนยันลายเซ็น</Button>
                  <Button onClick={() => setSigningRole(null)} variant="outline" className="font-bold">ยกเลิก</Button>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={() => handleDownloadPDF(contract, contractId, template, TEMPLATES, toast, lang)} variant="outline" className="flex-1 font-bold gap-2"><Download className="w-4 h-4" />ดาวน์โหลด PDF</Button>
              <Button onClick={() => handleShareLine(lang, (v: boolean) => {}, toast)} variant="outline" className="flex-1 font-bold gap-2"><Share2 className="w-4 h-4" />แชร์ LINE</Button>
              <Button onClick={() => setShowAudit(!showAudit)} variant="outline" className="flex-1 font-bold gap-2"><History className="w-4 h-4" />Audit Log</Button>
            </div>
            {showAudit && (
              <div className="border-t pt-6 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">ประวัติการแก้ไข (Audit Log)</h3>
                {auditLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-xs font-bold"><span>{AUDIT_CONFIG[log.event as keyof typeof AUDIT_CONFIG]?.icon}</span><div><p className="text-gray-900">{log.actor}</p><p className="text-gray-500 font-normal">{log.detail}</p></div></div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
