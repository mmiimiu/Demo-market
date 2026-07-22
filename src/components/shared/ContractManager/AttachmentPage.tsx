import React from 'react';
import { SignatureBlocks } from './SignatureBlocks';
import { FileUp } from 'lucide-react';

interface AttachmentPageProps {
  att: {
    id: string;
    title: string;
    type?: 'furniture' | 'photos';
    content?: string;
    items?: { item: string; value: string }[];
  };
  index: number;
  contract: any;
  isTh: boolean;
}

export function AttachmentPage({ att, index, contract, isTh }: AttachmentPageProps) {
  return (
    <div className="mt-16 pt-16 border-t-2 border-dashed border-gray-300 page-break-before text-left">
      {/* Document Header */}
      <div className="text-center border-b-2 border-gray-900 pb-6 mb-8">
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">
          PrimeRent Digital Platform
        </div>
        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
          {att.title}
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          {att.type === 'furniture'
            ? (isTh ? 'รายละเอียดทรัพย์สินภายในห้องพัก หากเกิดความเสียหายผู้เช่ายินยอมชดใช้ตามมูลค่าที่ระบุด้านล่าง' : 'List of properties inside the room. Tenant agrees to compensate in case of damages.')
            : (isTh ? 'รูปภาพสภาพห้องพักก่อนเข้าอยู่อาศัยเพื่ออ้างอิงสภาพความเป็นจริงเมื่อสิ้นสุดสัญญา' : 'Photos of the property state before lease start for reference.')
          }
        </p>
      </div>

      {/* Attachment Content */}
      {att.type === 'furniture' ? (
        <div className="space-y-3 my-8">
          {att.items?.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-sm font-bold text-gray-800 border-b border-dashed border-gray-150 pb-1.5">
              <span>{i + 1}. {f.item}</span>
              <span>{Number(f.value || 0).toLocaleString()} {isTh ? 'บาท' : 'THB'}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="my-8 border-dashed border-2 bg-gray-50/50 p-8 rounded-xl flex flex-col items-center justify-center text-gray-400 text-center">
          <FileUp className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs font-bold">{isTh ? 'รูปภาพและเอกสารเพิ่มเติมสภาพห้องพักแนบไว้ในระบบแล้ว' : 'Photos and documents attached.'}</span>
        </div>
      )}

      {/* Attachment Signature Blocks */}
      <section className="mt-12">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-6">
          {isTh ? 'ลายเซ็นรับทราบเอกสารแนบท้าย' : 'Attachment Signatures'}
        </h2>
        <SignatureBlocks contract={contract} isTh={isTh} />
      </section>
    </div>
  );
}
