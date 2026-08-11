import React, { useState } from 'react';
import { FileText, Download, Edit2, AlertTriangle, Share2, History, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ContractManagerProps } from './types';
import { TEMPLATES, AUDIT_CONFIG } from './constants';
import { SignaturePad } from './SignaturePad';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { ContractEditModal } from './ContractEditModal';
import { handleSignSubmit } from './handlers';
import { handleDownloadPDF, handleShareLine } from './utils';
import { useContractData } from './useContractData';

export function ContractManager({ contractId, lang, isCompact = false, forceRole, canEdit }: ContractManagerProps) {
  const {
    contract, setContract, loading, template, setTemplate, auditLog, setAuditLog,
    editMonthlyRent, setEditMonthlyRent, editDepositAmount, setEditDepositAmount,
    editAdvanceRentAmount, setEditAdvanceRentAmount, editStartDate, setEditStartDate,
    editEndDate, setEditEndDate, editAttachments, setEditAttachments, editLandlordName,
    editTenantName, editAgentName, editPropertyName, signaturesCount,
    isSigned, currentUserRole, user, db
  } = useContractData(contractId, forceRole);

  const [isEditing, setIsEditing] = useState(false);
  const [signingRole, setSigningRole] = useState<'tenant' | 'owner' | 'agent' | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [hasSigned, setHasSigned] = useState(false);

  if (loading) return <div className="py-10 text-center text-sm font-bold text-gray-400">กำลังโหลดเอกสารสัญญา...</div>;
  if (!contract) return <div className="py-10 text-center text-gray-700 font-bold"><AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />ไม่พบข้อมูลสัญญาเช่า</div>;

  const editable = canEdit ?? (currentUserRole === 'owner' || currentUserRole === 'agent');

  return (
    <div className={`font-thai ${isCompact ? 'space-y-2' : 'space-y-8 p-4'}`}>
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
        <Card className={isCompact ? "border-0 shadow-none bg-transparent" : "border-2 border-gray-200 shadow-xl rounded-none bg-white"}>
          <CardHeader className={isCompact ? "bg-transparent border-b p-4 flex flex-row justify-between items-start" : "bg-gradient-to-r from-slate-50 to-white border-b p-8 flex flex-row justify-between items-start"}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
                <div>
                  <CardTitle className={isCompact ? "text-sm font-black text-gray-900" : "text-2xl font-bold text-gray-900"}>สัญญาเช่าดิจิทัล</CardTitle>
                  <CardDescription className="text-[10px] text-gray-500">ID: {contractId}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isSigned ? "default" : "secondary"} className="font-black text-[9px]">{isSigned ? '✅ บังคับใช้' : '⏳ รอลงนาม'}</Badge>
                <Badge variant="outline" className="font-black border-primary/20 text-primary text-[9px]">{TEMPLATES[template]?.labelTh || 'สัญญาเช่า'}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <DocumentPreviewModal contract={contract} contractId={contractId} lang={lang} template={template} />
              {editable && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="icon" className="rounded-none"><Edit2 className="w-4 h-4" /></Button>
              )}
            </div>
          </CardHeader>
          <CardContent className={isCompact ? "p-4 space-y-4" : "p-8 space-y-6"}>
            <div className={isCompact ? "grid grid-cols-2 gap-2 text-center" : "grid grid-cols-4 gap-4 text-center"}>
              <div className="bg-slate-50 p-2.5 rounded-lg"><p className="text-[9px] font-bold text-gray-400">ค่าเช่า/เดือน</p><p className="text-sm font-black text-primary">฿{Number(contract.monthlyRent || 0).toLocaleString()}</p></div>
              <div className="bg-slate-50 p-2.5 rounded-lg"><p className="text-[9px] font-bold text-gray-400">เงินมัดจำ</p><p className="text-sm font-black text-gray-800">฿{Number(contract.depositAmount || 0).toLocaleString()}</p></div>
              <div className="bg-slate-50 p-2.5 rounded-lg"><p className="text-[9px] font-bold text-gray-400">ลายเซ็น</p><p className="text-sm font-black text-gray-800">{signaturesCount}/{contract.agentId ? 3 : 2}</p></div>
              <div className="bg-slate-50 p-2.5 rounded-lg"><p className="text-[9px] font-bold text-gray-400">สถานะ</p><p className="text-sm font-black text-emerald-600">{isSigned ? 'Active' : 'Pending'}</p></div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-xs font-black text-gray-900 mb-3">ลงนามสัญญา</h3>
              <div className="grid grid-cols-3 gap-2">
                {['tenant', 'owner', ...(contract.agentId ? ['agent'] : [])].map((role) => {
                  const sig = contract.signatures?.[role];
                  return (
                    <div key={role} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1.5"><span className="text-[9px] font-black uppercase text-gray-400">{role === 'tenant' ? 'ผู้เช่า' : role === 'owner' ? 'เจ้าของ' : 'ตัวแทน'}</span>{sig ? <Check className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3 text-gray-400" />}</div>
                      {sig ? <p className="text-[9px] text-gray-600 font-black truncate">{sig.name}</p> : role === currentUserRole && !isSigned ? (<Button onClick={() => setSigningRole(role as any)} size="sm" className="w-full font-black text-[9px] h-6 px-1">ลงนาม</Button>) : <p className="text-[9px] text-gray-400 font-bold">รอลงนาม</p>}
                    </div>
                  );
                })}
              </div>
            </div>
            {signingRole && (
              <div className="border-t pt-4 bg-blue-50/50 p-4 rounded-lg">
                <h3 className="text-xs font-black text-gray-900 mb-3">ลงนามในฐานะ {signingRole === 'tenant' ? 'ผู้เช่า' : signingRole === 'owner' ? 'เจ้าของ' : 'ตัวแทน'}</h3>
                <SignaturePad onSigned={(dataUrl) => { setSignatureDataUrl(dataUrl); setHasSigned(true); }} onClear={() => { setSignatureDataUrl(''); setHasSigned(false); }} hasSigned={hasSigned} lang={lang} />
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handleSignSubmit(hasSigned, signatureDataUrl, signingRole, contractId, user, db, contract, setContract, setHasSigned, setSigningRole, setAuditLog, toast, lang)} disabled={!hasSigned} className="flex-1 bg-primary font-black text-xs h-8">ยืนยันลายเซ็น</Button>
                  <Button onClick={() => setSigningRole(null)} variant="outline" className="font-black text-xs h-8">ยกเลิก</Button>
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-3 border-t">
              <Button onClick={() => handleDownloadPDF(contract, contractId, template, TEMPLATES, toast, lang)} variant="outline" className="flex-1 font-black text-[10px] h-8 gap-1"><Download className="w-3.5 h-3.5" />PDF</Button>
              <Button onClick={() => handleShareLine(lang, (v: any) => {}, toast)} variant="outline" className="flex-1 font-black text-[10px] h-8 gap-1"><Share2 className="w-3.5 h-3.5" />LINE</Button>
              <Button onClick={() => setShowAudit(!showAudit)} variant="outline" className="flex-1 font-black text-[10px] h-8 gap-1"><History className="w-3.5 h-3.5" />Logs</Button>
            </div>
            {showAudit && (
              <div className="border-t pt-4 space-y-2">
                <h3 className="text-xs font-black text-gray-900">ประวัติการแก้ไข (Audit Log)</h3>
                {auditLog.slice(0, 5).map((log, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg text-[10px] font-bold"><span>{AUDIT_CONFIG[log.event as keyof typeof AUDIT_CONFIG]?.icon}</span><div><p className="text-gray-900">{log.actor}</p><p className="text-gray-500 font-normal leading-normal">{log.detail}</p></div></div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
