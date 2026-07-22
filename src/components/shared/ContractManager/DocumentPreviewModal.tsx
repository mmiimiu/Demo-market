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
import { SignatureBlocks } from './SignatureBlocks';
import { AttachmentPage } from './AttachmentPage';

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

  const ownerName = contract?.signatures?.owner?.name || contract?.landlordName || 'นาย สมชาย ใจดี';
  const tenantName = contract?.signatures?.tenant?.name || contract?.tenantName || 'นาย ณัฐพล ใจสู้';
  const agentName = contract?.signatures?.agent?.name || contract?.agentName || 'PrimeRent Agent';

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

              <div className="text-center border-b border-gray-100 pb-6 mb-8 mt-4">
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {isTh ? 'หนังสือสัญญาเช่าที่พักอาศัย' : 'Residential Lease Agreement'}
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  {isTh ? 'ทำขึ้น ณ แพลตฟอร์ม PrimeRent (สัญญาเช่าฉบับสมบูรณ์)' : 'Created on PrimeRent Platform (Complete Lease Agreement)'}
                </p>
              </div>

              <div className="text-sm leading-8 text-gray-800 space-y-6 mb-10 text-left indent-8">
                <p>
                  {isTh ? 'สัญญาเช่าฉบับนี้ทำขึ้นระหว่าง ' : 'This agreement is made between '}
                  <span className="font-bold underline px-1 text-black">{ownerName}</span>
                  {isTh ? ' (ซึ่งต่อไปในสัญญานี้จะเรียกว่า "ผู้ให้เช่า") ฝ่ายหนึ่ง กับ ' : ' (hereinafter referred to as the "Lessor"), and '}
                  <span className="font-bold underline px-1 text-black">{tenantName}</span>
                  {isTh ? ' (ซึ่งต่อไปในสัญญานี้จะเรียกว่า "ผู้เช่า") อีกฝ่ายหนึ่ง โดยมี ' : ' (hereinafter referred to as the "Tenant"), and '}
                  <span className="font-bold underline px-1 text-black">{agentName}</span>
                  {isTh ? ' เป็นตัวแทนและพยานผู้ประสานงานร่วมดูแล' : ' acting as the agent and coordinating witness.'}
                </p>
                
                <p>
                  {isTh ? 'ทั้งสองฝ่ายตกลงทำสัญญาเช่าทรัพย์สินประเภทห้องพัก โครงการ ' : 'Both parties agree to lease the residential property located at '}
                  <span className="font-bold underline px-1 text-black">{contract?.propertyName || 'คอนโดสุขุมวิท 101 ชั้น 12 ห้อง 1204'}</span>
                  {isTh ? ' โดยมีเงื่อนไขรายละเอียดดังนี้:' : ' with the following terms and conditions:'}
                </p>
              </div>

              <div className="bg-gray-50/80 p-6 md:p-8 rounded-2xl mb-10 border border-gray-100 space-y-4 shadow-sm text-left">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                  <span className="text-gray-600 font-medium">{isTh ? 'อัตราค่าเช่ารายเดือน:' : 'Monthly Rent:'}</span>
                  <span className="font-black text-lg text-primary">฿{Number(contract?.monthlyRent || 0).toLocaleString()} <span className="text-xs font-bold text-gray-600 ml-1">{isTh ? 'บาท / เดือน' : 'THB / month'}</span></span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                  <span className="text-gray-600 font-medium">{isTh ? 'เงินประกันความเสียหาย (มัดจำ):' : 'Security Deposit:'}</span>
                  <span className="font-black text-lg text-gray-800">฿{Number(contract?.depositAmount || 0).toLocaleString()} <span className="text-xs font-bold text-gray-600 ml-1">{isTh ? 'บาท' : 'THB'}</span></span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-600 font-medium">{isTh ? 'ระยะเวลาเช่าเริ่มต้น:' : 'Lease Start Date:'}</span>
                  <span className="font-black text-base text-gray-800">{sDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{isTh ? 'ระยะเวลาเช่าสิ้นสุด:' : 'Lease End Date:'}</span>
                  <span className="font-black text-base text-gray-800">{eDate}</span>
                </div>
              </div>

              <div className="mb-12 text-sm text-gray-800 leading-relaxed text-left">
                <h4 className="font-black mb-4 text-black">{isTh ? 'ข้อตกลงและหน้าที่เพิ่มเติม:' : 'Additional Terms and Duties:'}</h4>
                <ol className="list-decimal pl-6 space-y-3 font-medium text-gray-600">
                  <li>{isTh ? 'ผู้เช่าตกลงชำระเงินค่าเช่าล่วงหน้าภายในวันที่ 5 ของทุกเดือน หากล่าช้าจะยินยอมให้ปรับวันละ 100 บาท' : 'Tenant agrees to pay rent by the 5th of every month. Late payments incur a 100 THB/day penalty.'}</li>
                  <li>{isTh ? 'ผู้เช่าตกลงรับผิดชอบชำระค่าสาธารณูปโภค ค่าน้ำ ค่าไฟ ตามหน่วยวัดอัตราที่ทางการเรียกเก็บ' : 'Tenant is responsible for utility bills (water, electricity) at government rates.'}</li>
                  <li>{isTh ? 'ห้ามมิให้ผู้เช่านำทรัพย์สินไปให้ผู้อื่นเช่าช่วง หรือใช้ประกอบกิจการผิดกฎหมาย' : 'Subletting or using the property for illegal activities is strictly prohibited.'}</li>
                </ol>
              </div>

              {/* Main Contract Signatures */}
              <section className="mt-12 text-left">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-6">
                  {isTh ? 'ลายเซ็นผู้มีอำนาจลงนาม (Main Contract)' : 'Authorized Signatures'}
                </h2>
                <SignatureBlocks contract={contract} isTh={isTh} />
              </section>

              {/* Attachments Pages */}
              {contract?.attachments?.map((att: any, idx: number) => (
                <AttachmentPage
                  key={att.id}
                  att={att}
                  index={idx}
                  contract={contract}
                  isTh={isTh}
                />
              ))}

              {/* Footer */}
              <div className="mt-12 pt-4 border-t border-gray-200 text-center">
                <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.2em]">
                  🔒 Digitally Secured &amp; Encrypted · PrimeRent Digital Platform · {new Date().getFullYear()}
                </p>
              </div>

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
