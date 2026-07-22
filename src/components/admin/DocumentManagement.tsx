'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Search, FileCheck, AlertCircle, Download, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/hooks/useAdminStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function DocumentManagement() {
  const { documents, loadDatabase } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeDocAudit, setActiveDocAudit] = useState<any>(null);

  useEffect(() => { loadDatabase(); }, [loadDatabase]);

  const filtered = documents.filter(d => {
    const matchSearch = d.propertyName.toLowerCase().includes(search.toLowerCase()) || d.tenantName.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || d.documentType === filterType;
    return matchSearch && matchType;
  });

  const typeLabel = (t: string) => {
    switch (t) { case 'contract': return 'สัญญาเช่า'; case 'kyc': return 'KYC Document'; case 'checklist': return 'Move-in Checklist'; default: return t; }
  };
  const typeColor = (t: string) => {
    switch (t) { case 'contract': return 'bg-indigo-50 text-indigo-700 border-indigo-100'; case 'kyc': return 'bg-emerald-50 text-emerald-700 border-emerald-100'; case 'checklist': return 'bg-amber-50 text-amber-700 border-amber-100'; default: return 'bg-slate-100 text-slate-600'; }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-600/20">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">การจัดการเอกสาร</h1>
          <p className="text-xs text-slate-500 font-bold">เก็บ สัญญา, KYC document, Move-in Checklist — ตาม retention policy PDPA</p>
        </div>
      </div>

      {/* PDPA Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 font-bold leading-relaxed">
          <p className="font-black mb-1">📋 นโยบายเก็บรักษาข้อมูลตาม PDPA:</p>
          <p>• สัญญาเช่า: เก็บ 5 ปีหลังสิ้นสุดสัญญา</p>
          <p>• เอกสาร KYC: เก็บ 3 ปีหลังยกเลิกบัญชี</p>
          <p>• Move-in Checklist: เก็บ 5 ปีหลังสิ้นสุดสัญญา</p>
          <p className="mt-1 text-blue-600">เอกสารที่หมดอายุจะถูก flag เพื่อรอการลบ</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'เอกสารทั้งหมด', value: documents.length, icon: '📄' },
          { label: 'สัญญาเช่า', value: documents.filter(d => d.documentType === 'contract').length, icon: '📝' },
          { label: 'KYC Documents', value: documents.filter(d => d.documentType === 'kyc').length, icon: '🆔' },
          { label: 'Move-in Checklists', value: documents.filter(d => d.documentType === 'checklist').length, icon: '✅' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-lg font-black text-slate-800">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเอกสาร..." className="pl-9 h-9 text-xs rounded-xl" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded-xl px-3 py-2 text-xs bg-white font-bold focus:outline-none">
          <option value="all">ทุกประเภท</option>
          <option value="contract">สัญญาเช่า</option>
          <option value="kyc">KYC Document</option>
          <option value="checklist">Move-in Checklist</option>
        </select>
      </div>

      {/* Documents Table */}
      <Card className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b">
              <tr className="font-black text-slate-400 text-[10px] uppercase">
                <th className="p-4">ชื่อเอกสาร</th>
                <th className="p-4">คู่สัญญา</th>
                <th className="p-4 text-center">ประเภท</th>
                <th className="p-4 text-center">ลายเซ็น</th>
                <th className="p-4 text-center">สถานะ</th>
                <th className="p-4 text-center">PDPA Retention</th>
                <th className="p-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-black text-slate-900">{doc.propertyName}</td>
                  <td className="p-4">
                    {doc.tenantName !== '-' && <p className="text-slate-800">{doc.tenantName} (Tenant)</p>}
                    {doc.ownerName !== '-' && <p className="text-slate-500">{doc.ownerName} (Owner)</p>}
                  </td>
                  <td className="p-4 text-center">
                    <Badge className={`${typeColor(doc.documentType)} border font-bold text-[9px]`}>{typeLabel(doc.documentType)}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge className="bg-slate-100 border text-slate-700 font-black">{doc.signaturesCount}/3 Signed</Badge>
                  </td>
                  <td className="p-4 text-center font-bold text-indigo-700">{doc.status}</td>
                  <td className="p-4 text-center">
                    {doc.retentionExpiry && (
                      <div className="text-[10px]">
                        <p className={cn('font-bold', doc.pdpaCompliant ? 'text-green-600' : 'text-red-600')}>
                          {doc.pdpaCompliant ? '✅ Compliant' : '⚠️ Expired'}
                        </p>
                        <p className="text-slate-400">หมดอายุ: {doc.retentionExpiry}</p>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Button variant="outline" size="sm" className="rounded-lg h-7 text-[10px] font-black gap-1" onClick={() => setActiveDocAudit(doc)}>
                        <FileCheck className="w-3 h-3 text-blue-500" /> Audit
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg h-7 text-[10px] font-black gap-1">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Document Audit Dialog */}
      {activeDocAudit && (
        <Dialog open={!!activeDocAudit} onOpenChange={() => setActiveDocAudit(null)}>
          <DialogContent className="max-w-md w-[95vw] max-h-[85vh] overflow-y-auto rounded-2xl font-thai">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                ประวัติการเซ็นและโครงสร้างเอกสาร (Audit Trail)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div className="bg-slate-50 border rounded-xl p-3 space-y-1.5">
                <p>ชื่อเอกสาร: <span className="font-black text-slate-950">{activeDocAudit.propertyName}</span></p>
                <p>Status: <span className="text-indigo-600 font-black">{activeDocAudit.status}</span></p>
                <p>ประเภท: <Badge className={`${typeColor(activeDocAudit.documentType)} border font-bold text-[9px]`}>{typeLabel(activeDocAudit.documentType)}</Badge></p>
                <p>Signatures: <span className="font-black text-slate-950">{activeDocAudit.signaturesCount}/3</span></p>
                {activeDocAudit.retentionExpiry && <p>Retention Expiry: <span className="text-slate-500">{activeDocAudit.retentionExpiry}</span></p>}
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 font-black text-[10px] uppercase">Signatures Integrity Verification</p>
                <div className="border rounded-xl divide-y">
                  {['Owner Digital Signature', 'Tenant Digital Signature', 'Agent Witness Signature (Optional)'].map((sig, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between">
                      <span>{i + 1}. {sig}</span>
                      <Badge className={activeDocAudit.signaturesCount > i ? 'bg-green-50 text-green-700 border border-green-100 font-bold' : 'bg-slate-100 text-slate-400 font-bold'}>
                        {activeDocAudit.signaturesCount > i ? '✓ VERIFIED' : '⏳ PENDING'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-[10.5px] leading-relaxed text-yellow-800">
                  เอกสารทั้งหมดมีลายน้ำประทับวันที่ลงลายมือชื่อดิจิทัลและ IP Address ป้องกันผู้ใดปลอมแปลงข้อมูลข้อตกลง
                </p>
              </div>
              <Button onClick={() => setActiveDocAudit(null)} className="w-full h-11 rounded-xl font-black">ปิด</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
