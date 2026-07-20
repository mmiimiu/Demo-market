import React from 'react';
import { FileText, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ContractTemplate } from './types';
import { TEMPLATES } from './constants';

interface DocumentPreviewProps {
  contract: any;
  contractId: string;
  lang: 'th' | 'en' | 'cn';
  template: ContractTemplate;
}

export function DocumentPreviewModal({ contract, contractId, lang, template }: DocumentPreviewProps) {
  const isTh = lang === 'th';
  const isSigned = contract?.status === 'active';

  const sDate = contract?.startDate ? format(new Date(contract.startDate), 'dd MMMM yyyy') : 'N/A';
  const eDate = contract?.endDate ? format(new Date(contract.endDate), 'dd MMMM yyyy') : 'N/A';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-none h-10 font-bold gap-2 border-gray-200">
          <Eye className="w-4 h-4" />
          {isTh ? 'ดูเอกสารสัญญา' : lang === 'cn' ? '查看合同' : 'View Document'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-none border-none">
        <div className="bg-white">
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-bold text-gray-900 text-sm">
                {isTh ? 'เอกสารสัญญาเช่าดิจิทัล' : 'Digital Lease Agreement'}
              </span>
              <Badge variant="outline" className="rounded-none text-xs font-bold border-primary/20 text-primary">
                {contractId}
              </Badge>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-none h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>

          <div className="p-8 bg-gray-100 min-h-[600px]">
            <div className="bg-white shadow-2xl mx-auto max-w-2xl p-12 relative min-h-[800px] border border-gray-200">
              
              <div className={cn(
                "absolute inset-0 flex items-center justify-center pointer-events-none select-none",
                "opacity-[0.04] rotate-[-35deg]"
              )}>
                <span className="text-8xl font-bold text-gray-900 tracking-widest uppercase">
                  {isSigned ? (isTh ? 'บังคับใช้' : 'ACTIVE') : (isTh ? 'ร่าง' : 'DRAFT')}
                </span>
              </div>

              <div className="text-center border-b-2 border-gray-900 pb-6 mb-8">
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">PrimeRent Digital Platform</div>
                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                  {isTh ? 'สัญญาเช่าที่พักอาศัย' : lang === 'cn' ? '住宅租赁合同' : 'Residential Lease Agreement'}
                </h1>
                <div className="text-xs text-gray-500 font-bold mt-2">
                  {isTh ? 'รหัสสัญญา' : 'Contract ID'}: {contractId} &nbsp;·&nbsp;
                  {isTh ? 'ประเภท' : 'Type'}: {isTh ? TEMPLATES[template].labelTh : TEMPLATES[template].label}
                </div>
              </div>

              <section className="mb-8">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">
                  1. {isTh ? 'คู่สัญญา' : 'Parties to Agreement'}
                </h2>
                <div className="grid grid-cols-2 gap-6 text-sm font-bold">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isTh ? 'ผู้ให้เช่า (Landlord)' : 'Landlord / Owner'}</p>
                    <p className="text-gray-800">ID: {contract?.ownerId || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isTh ? 'ผู้เช่า (Tenant)' : 'Tenant'}</p>
                    <p className="text-gray-800">ID: {contract?.tenantId || 'N/A'}</p>
                  </div>
                  {contract?.agentId && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isTh ? 'ตัวแทน (Agent)' : 'Agent'}</p>
                      <p className="text-gray-800">ID: {contract.agentId}</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">
                  2. {isTh ? 'ระยะเวลาสัญญา' : 'Term of Lease'}
                </h2>
                <div className="grid grid-cols-2 gap-6 text-sm font-bold">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isTh ? 'วันที่เริ่ม' : 'Start Date'}</p>
                    <p className="text-gray-800">{sDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isTh ? 'วันที่สิ้นสุด' : 'End Date'}</p>
                    <p className="text-gray-800">{eDate}</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">
                  3. {isTh ? 'ค่าเช่าและเงื่อนไขการชำระ' : 'Rent and Payment Terms'}
                </h2>
                <div className="text-sm font-bold space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isTh ? 'ค่าเช่ารายเดือน' : 'Monthly Rent'}</span>
                    <span className="text-gray-900">฿{contract?.rent?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isTh ? 'วันที่ชำระ' : 'Payment Due Date'}</span>
                    <span className="text-gray-900">{contract?.paymentDay || 'N/A'}</span>
                  </div>
                </div>
              </section>

              {isSigned && (
                <div className="mt-12 pt-8 border-t-2 border-gray-900">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
                      {isTh ? 'สถานะ: บังคับใช้' : 'Status: Active'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-bold">
                    {isTh ? 'เอกสารนี้ได้รับการลงนามดิจิทัลแล้ว' : 'This document has been digitally signed'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
