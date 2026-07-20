import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, ShieldCheck, Clock, Download, Edit2, X, AlertTriangle,
  Share2, History, ChevronDown, ChevronUp, Copy, Check, Layers, Stamp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { ContractManagerProps, ContractTemplate, AuditEvent } from './types';
import { TEMPLATES, AUDIT_CONFIG, MOCK_AUDIT_LOG } from './constants';
import { SignaturePad } from './SignaturePad';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { TemplateSelector } from './TemplateSelector';
import { handleEditSave, handleSignSubmit } from './handlers';
import { handleDownloadPDF, handleShareLine } from './utils';

export function ContractManager({ contractId, lang }: ContractManagerProps) {
  const isTh = lang === 'th';
  const { user } = useUser();
  const db = useFirestore();

  const { data: dbContract, loading: dbLoading } = useDoc<any>(
    db && user && !user.isMock && contractId ? `contracts/${contractId}` : null
  );

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [signingRole, setSigningRole] = useState<'tenant' | 'owner' | 'agent' | null>(null);
  const [template, setTemplate] = useState<ContractTemplate>('monthly');
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(MOCK_AUDIT_LOG);
  const [showAudit, setShowAudit] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [hasSigned, setHasSigned] = useState(false);

  const [editMonthlyRent, setEditMonthlyRent] = useState('');
  const [editDepositAmount, setEditDepositAmount] = useState('');
  const [editAdvanceRentAmount, setEditAdvanceRentAmount] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const loadContractData = useCallback(() => {
    if (user && !user.isMock && dbContract) {
      setContract(dbContract);
      setLoading(false);
      return;
    }
    const storedContracts = localStorage.getItem('contracts');
    if (storedContracts) {
      try {
        const contracts = JSON.parse(storedContracts);
        const match = contracts.find((c: any) => c.id === contractId);
        if (match) setContract(match);
      } catch (err) {
        console.error('Error parsing mock contracts:', err);
      }
    }
    setLoading(false);
  }, [dbContract, user, contractId]);

  useEffect(() => { loadContractData(); }, [loadContractData]);

  useEffect(() => {
    if (contract) {
      setEditMonthlyRent(contract.monthlyRent?.toString() || '');
      setEditDepositAmount(contract.depositAmount?.toString() || '');
      setEditAdvanceRentAmount(contract.advanceRentAmount?.toString() || '');
      const sDate = contract.startDate ? new Date(contract.startDate) : new Date();
      const eDate = contract.endDate ? new Date(contract.endDate) : new Date();
      setEditStartDate(sDate.toISOString().substring(0, 10));
      setEditEndDate(eDate.toISOString().substring(0, 10));
      if (contract.template) setTemplate(contract.template);
      if (contract.auditLog) setAuditLog(contract.auditLog as AuditEvent[]);
    }
  }, [contract]);

  if (loading || dbLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-400">กำลังโหลดเอกสารสัญญา...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="py-20 text-center border border-dashed rounded-none p-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="font-bold text-gray-700 text-lg">ไม่พบข้อมูลสัญญาเช่า</p>
        <p className="text-xs text-gray-400 mt-1">รหัสสัญญา {contractId} ไม่มีอยู่ในระบบ</p>
      </div>
    );
  }

  const signaturesCount = Object.keys(contract.signatures || {}).length;
  const isSigned = contract.status === 'active';
  const currentUserRole = user?.isMock
    ? (localStorage.getItem('primerent_user_role') === 'owner' ? 'owner' : 'tenant')
    : (user?.uid === contract.ownerId ? 'owner' : user?.uid === contract.tenantId ? 'tenant' : 'agent');

  return (
    <div className="space-y-8 p-4 font-thai">
      {isEditing ? (
        <Card className="border-2 border-primary/20 shadow-2xl rounded-none bg-white">
          <CardHeader className="bg-slate-50 border-b p-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">✏️ แก้ไขสัญญาเช่า</CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-1">
                  การแก้ไขจะรีเซ็ตลายเซ็นทั้งหมด และต้องลงนามใหม่
                </CardDescription>
              </div>
              <Button onClick={() => setIsEditing(false)} variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={(e) => handleEditSave(e, editMonthlyRent, editDepositAmount, editAdvanceRentAmount, editStartDate, editEndDate, contractId, user, db, contract, setContract, setIsEditing, setAuditLog, toast, lang)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">ค่าเช่ารายเดือน</Label>
                  <Input type="number" value={editMonthlyRent} onChange={(e) => setEditMonthlyRent(e.target.value)} className="font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">เงินมัดจำ</Label>
                  <Input type="number" value={editDepositAmount} onChange={(e) => setEditDepositAmount(e.target.value)} className="font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">เช่าล่วงหน้า</Label>
                  <Input type="number" value={editAdvanceRentAmount} onChange={(e) => setEditAdvanceRentAmount(e.target.value)} className="font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">ประเภทสัญญา</Label>
                  <TemplateSelector value={template} onChange={setTemplate} lang={lang} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">วันเริ่มสัญญา</Label>
                  <Input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">วันสิ้นสุดสัญญา</Label>
                  <Input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="font-bold" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 font-bold">
                  บันทึกการแก้ไข
                </Button>
                <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="font-bold">
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-gray-200 shadow-xl rounded-none bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">สัญญาเช่าดิจิทัล</CardTitle>
                    <CardDescription className="text-xs text-gray-500 mt-1">Contract ID: {contractId}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isSigned ? "default" : "secondary"} className="font-bold">
                    {isSigned ? '✅ บังคับใช้' : '⏳ รอลงนาม'}
                  </Badge>
                  <Badge variant="outline" className="font-bold border-primary/20 text-primary">
                    {TEMPLATES[template].labelTh}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <DocumentPreviewModal contract={contract} contractId={contractId} lang={lang} template={template} />
                <Button onClick={() => setIsEditing(true)} variant="outline" size="icon" className="rounded-none">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ค่าเช่า/เดือน</p>
                <p className="text-xl font-bold text-primary">฿{Number(contract.monthlyRent || 0).toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">เงินมัดจำ</p>
                <p className="text-xl font-bold text-gray-800">฿{Number(contract.depositAmount || 0).toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ลายเซ็น</p>
                <p className="text-xl font-bold text-gray-800">{signaturesCount}/3</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">สถานะ</p>
                <p className="text-xl font-bold text-emerald-600">{isSigned ? 'Active' : 'Pending'}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">ลงนามสัญญา</h3>
              <div className="grid grid-cols-3 gap-4">
                {['tenant', 'owner', ...(contract.agentId ? ['agent'] : [])].map((role) => {
                  const sig = contract.signatures?.[role as string];
                  const isMyRole = role === currentUserRole;
                  return (
                    <div key={role} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">{role}</span>
                        {sig ? <Check className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      {sig ? (
                        <p className="text-xs text-gray-600 font-bold">{sig.name}</p>
                      ) : isMyRole && !isSigned ? (
                        <Button onClick={() => setSigningRole(role as any)} size="sm" className="w-full font-bold">
                          ลงนาม
                        </Button>
                      ) : (
                        <p className="text-xs text-gray-400">รอลงนาม</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {signingRole && (
              <div className="border-t pt-6 bg-blue-50/50 p-6 rounded-lg">
                <h3 className="text-sm font-bold text-gray-900 mb-4">ลงนามในฐานะ {signingRole}</h3>
                <SignaturePad
                  onSigned={setSignatureDataUrl}
                  onClear={() => { setSignatureDataUrl(''); setHasSigned(false); }}
                  hasSigned={hasSigned}
                  lang={lang}
                />
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => handleSignSubmit(hasSigned, signatureDataUrl, signingRole, contractId, user, db, contract, setContract, setHasSigned, setSigningRole, setAuditLog, toast, lang)}
                    disabled={!hasSigned}
                    className="flex-1 bg-primary hover:bg-primary/90 font-bold"
                  >
                    ยืนยันลายเซ็น
                  </Button>
                  <Button onClick={() => setSigningRole(null)} variant="outline" className="font-bold">
                    ยกเลิก
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={() => handleDownloadPDF(contract, contractId, template, TEMPLATES, toast, lang)} variant="outline" className="flex-1 font-bold gap-2">
                <Download className="w-4 h-4" />
                ดาวน์โหลด PDF
              </Button>
              <Button onClick={() => handleShareLine(lang, setLinkCopied, toast)} variant="outline" className="flex-1 font-bold gap-2">
                <Share2 className="w-4 h-4" />
                แชร์ LINE
              </Button>
              <Button onClick={() => setShowAudit(!showAudit)} variant="outline" className="font-bold gap-2">
                <History className="w-4 h-4" />
                Audit Log
              </Button>
            </div>

            {showAudit && (
              <div className="border-t pt-6 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">ประวัติการแก้ไข</h3>
                {auditLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-lg">{AUDIT_CONFIG[log.event as keyof typeof AUDIT_CONFIG]?.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">{log.actor}</p>
                      <p className="text-xs text-gray-600">{log.detail}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(log.timestamp).toLocaleString('th-TH')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
