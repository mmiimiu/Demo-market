'use client';

import React from 'react';
import { Download, X } from 'lucide-react';
import { Contract } from './constants';

interface ContractDocModalProps {
  contract: Contract;
  onClose: () => void;
}

export function ContractDocModal({ contract, onClose }: ContractDocModalProps) {
  const printId = 'contract-print-area';

  const handlePrint = () => {
    const el = document.getElementById(printId);
    if (!el) return;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="utf-8" />
      <title>สัญญาเช่า — ${contract.propertyName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sarabun', sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.8; padding: 48px; background: #fff; }
        h1 { font-size: 22px; font-weight: 800; text-align: center; margin-bottom: 4px; }
        .sub { text-align: center; color: #666; font-size: 12px; margin-bottom: 32px; }
        .section { margin-bottom: 24px; }
        .label { font-weight: 700; color: #374151; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #d1d5db; padding: 8px 12px; font-size: 13px; }
        th { background: #f3f4f6; font-weight: 700; text-align: left; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
        .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; }
        .sig-box { border-top: 2px solid #1a1a1a; padding-top: 8px; min-height: 80px; }
        .sig-img { max-height: 64px; }
        .terms li { margin-bottom: 8px; }
        @media print { body { padding: 24px; } }
      </style>
      </head><body>
      ${el.innerHTML}
      </body></html>
    `);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 400);
  };

  const sigs = contract.signatures;
  const ownerSig = sigs?.owner;
  const tenantSig = sigs?.tenant;
  const agentSig = sigs?.agent;

  const formatDateTH = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-black text-gray-800">เอกสารสัญญาเช่า</p>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" /> พิมพ์ / บันทึก PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contract Document Body */}
        <div id={printId} className="p-8 text-gray-800 text-sm leading-relaxed">
          {/* Title */}
          <h1 className="text-xl font-black text-center mb-1">หนังสือสัญญาเช่าที่พักอาศัย</h1>
          <p className="text-center text-xs text-gray-500 mb-8">ทำขึ้น ณ แพลตฟอร์ม PrimeRent (สัญญาเช่าฉบับสมบูรณ์)</p>

          {/* Intro paragraph */}
          <p className="indent-8 mb-6 leading-8">
            สัญญาเช่าฉบับนี้ทำขึ้นระหว่าง <span className="font-bold underline">{contract.ownerName}</span>
            {' '}(ซึ่งต่อไปในสัญญานี้จะเรียกว่า &ldquo;ผู้ให้เช่า&rdquo;) ฝ่ายหนึ่ง กับ
            {' '}<span className="font-bold underline">{contract.tenantName}</span>
            {' '}(ซึ่งต่อไปในสัญญานี้จะเรียกว่า &ldquo;ผู้เช่า&rdquo;) อีกฝ่ายหนึ่ง
            {contract.hasAgent && contract.agentName && (
              <> โดยมี <span className="font-bold underline">{contract.agentName}</span> เป็นตัวแทนผู้ดูแลประสานงานร่วมกัน </>
            )}
            {' '}ทั้งสองฝ่ายตกลงทำสัญญาเช่าทรัพย์สินประเภทห้องพักโครงการ
            {' '}<span className="font-bold underline">{contract.propertyName}</span>
            {' '}{contract.unitNo && <>ห้อง <span className="font-bold">{contract.unitNo}</span>{' '}</>}
            ตั้งอยู่ที่ <span className="font-bold">{contract.propertyAddress}</span>
            {' '}โดยมีเงื่อนไขรายละเอียดดังนี้
          </p>

          {/* Key Terms Table */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 space-y-2">
            {[
              ['อัตราค่าเช่ารายเดือน', `฿${contract.rentAmount.toLocaleString()} บาท / เดือน`],
              ['เงินประกันความเสียหาย (มัดจำ)', `฿${contract.deposit.toLocaleString()} บาท`],
              ['ระยะเวลาเช่าเริ่มต้น', formatDateTH(contract.startDate)],
              ['ระยะเวลาเช่าสิ้นสุด', formatDateTH(contract.endDate)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-600 font-medium text-xs">{label}</span>
                <span className="font-black text-gray-900 text-sm">{value}</span>
              </div>
            ))}
          </div>

          {/* Terms */}
          <div className="mb-8">
            <h4 className="font-black text-gray-900 mb-3">ข้อตกลงและหน้าที่เพิ่มเติม:</h4>
            <ol className="list-decimal pl-6 space-y-2 text-gray-600 text-xs font-medium">
              <li>ผู้เช่าตกลงชำระเงินค่าเช่าล่วงหน้าภายในวันที่ 5 ของทุกเดือน หากล่าช้าจะยินยอมให้ปรับวันละ 100 บาท</li>
              <li>ผู้เช่าตกลงรับผิดชอบชำระค่าสาธารณูปโภค ค่าน้ำ ค่าไฟ ตามหน่วยวัดอัตราที่ทางการเรียกเก็บ</li>
              <li>ห้ามมิให้ผู้เช่านำทรัพย์สินไปให้ผู้อื่นเช่าช่วง หรือใช้ประกอบกิจการผิดกฎหมาย</li>
            </ol>
          </div>

          {/* Signatures */}
          <div className={`grid gap-8 mt-10 pt-8 border-t border-gray-200 ${contract.hasAgent ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {/* Owner */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">ผู้ให้เช่า (Owner)</p>
              {ownerSig ? (
                <>
                  <img src={ownerSig.signatureDataUrl} alt="ลายเซ็นเจ้าของ" className="h-14 object-contain mb-2" />
                  <p className="font-bold text-xs text-gray-700">{ownerSig.name}</p>
                  <p className="text-[10px] text-gray-400">{new Date(ownerSig.signedAt).toLocaleDateString('th-TH')}</p>
                </>
              ) : (
                <div className="h-14 border-b-2 border-gray-300 border-dashed mb-2" />
              )}
              <div className="border-t border-gray-400 mt-2 pt-1">
                <p className="text-xs text-gray-500">{contract.ownerName}</p>
              </div>
            </div>

            {/* Tenant */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">ผู้เช่า (Tenant)</p>
              {tenantSig ? (
                <>
                  <img src={tenantSig.signatureDataUrl} alt="ลายเซ็นผู้เช่า" className="h-14 object-contain mb-2" />
                  <p className="font-bold text-xs text-gray-700">{tenantSig.name}</p>
                  <p className="text-[10px] text-gray-400">{new Date(tenantSig.signedAt).toLocaleDateString('th-TH')}</p>
                </>
              ) : (
                <div className="h-14 border-b-2 border-gray-300 border-dashed mb-2" />
              )}
              <div className="border-t border-gray-400 mt-2 pt-1">
                <p className="text-xs text-gray-500">{contract.tenantName}</p>
              </div>
            </div>

            {/* Agent */}
            {contract.hasAgent && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">ตัวแทน (Agent)</p>
                {agentSig ? (
                  <>
                    <img src={agentSig.signatureDataUrl} alt="ลายเซ็นตัวแทน" className="h-14 object-contain mb-2" />
                    <p className="font-bold text-xs text-gray-700">{agentSig.name}</p>
                    <p className="text-[10px] text-gray-400">{new Date(agentSig.signedAt).toLocaleDateString('th-TH')}</p>
                  </>
                ) : (
                  <div className="h-14 border-b-2 border-gray-300 border-dashed mb-2" />
                )}
                <div className="border-t border-gray-400 mt-2 pt-1">
                  <p className="text-xs text-gray-500">{contract.agentName || 'ตัวแทนร่วม'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
