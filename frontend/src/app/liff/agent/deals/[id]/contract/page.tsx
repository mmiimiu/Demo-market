"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, FileSignature, CheckCircle2, Download, RefreshCw } from 'lucide-react';

export default function DealContractView() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  // If id is deal-6 (Mary), we simulate the "Pending Web Sync" state.
  // Otherwise (deal-5), we show the "Signed" state.
  const isPending = id === 'deal-6';

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-100 pb-24 font-sans">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap');
        `}} />
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900">เอกสารสัญญาเช่า</span>
        <div className="flex gap-2">
          {!isPending && (
            <button className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center">
        
        {isPending ? (
          // ================= PENDING WEB SYNC STATE (DEAL-6) =================
          <div className="w-full max-w-md space-y-4">
            
            {/* Deal Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileSignature className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-slate-900 text-lg">The Base Park (12A)</h2>
              <p className="text-sm text-slate-500 mb-4">ผู้เช่า: คุณแมรี่ (Mary)</p>
              
              <div className="flex divide-x divide-slate-100 border-t border-slate-100 pt-4">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">ค่าเช่าสุทธิ</p>
                  <p className="font-bold text-slate-900">9,500<span className="text-xs font-normal text-slate-500 ml-1">บ./ด.</span></p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">ระยะเวลา</p>
                  <p className="font-bold text-slate-900">12<span className="text-xs font-normal text-slate-500 ml-1">เดือน</span></p>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1 mt-6">ไฟล์สัญญาเช่าที่เซ็นแล้ว</h3>

            {/* Auto-Syncing Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20" />
                <div className="absolute inset-0 bg-blue-50 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              
              <div>
                <p className="font-bold text-slate-800 text-lg">กำลังรอข้อมูลจากระบบหลัก...</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  ระบบกำลังเชื่อมต่อและดึงข้อมูลสัญญาเช่าจากแพลตฟอร์มเว็บไซต์
                  <br/>คุณไม่จำเป็นต้องอัปโหลดเอกสารเอง
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">ระบบจะส่งแจ้งเตือนในแชทเมื่อเอกสารพร้อมใช้งาน</p>
              </div>
            </div>
          </div>
        ) : (
          // ================= SIGNED STATE (DEAL-5) =================
          <>
            {/* Success Banner */}
            <div className="w-full bg-emerald-600 text-white rounded-xl p-3 flex items-center gap-3 shadow-md mb-6 max-w-md">
              <div className="bg-white/20 rounded-full p-1.5 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">ดีลนี้ปิดสำเร็จแล้ว</p>
                <p className="text-[11px] text-emerald-100">เอกสารลงนามครบถ้วนจากแพลตฟอร์มเว็บ</p>
              </div>
            </div>

            {/* Paper Document Mock */}
            <div className="w-full max-w-md bg-[#faf9f6] border border-slate-200 shadow-lg p-6 sm:p-8 text-slate-800 text-sm relative">
              {/* Watermark Mock */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
                <FileSignature className="w-64 h-64 -rotate-12" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="text-center space-y-1 mb-6 border-b border-slate-300 pb-4">
                  <h1 className="font-bold text-lg text-slate-900">สัญญาเช่าที่พักอาศัย</h1>
                  <p className="text-xs text-slate-500">เลขที่สัญญา: RF-202606-8801</p>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                  <p className="text-right">ทำที่: แพลตฟอร์มออนไลน์ RentFlow</p>
                  <p className="text-right">วันที่: 26 มิถุนายน 2569</p>

                  <p className="indent-8 text-justify">
                    สัญญาฉบับนี้ทำขึ้นระหว่าง <span className="font-semibold text-[#00B900]">นายสมยศ พัฒนากุล</span> (ซึ่งต่อไปนี้ในสัญญาเรียกว่า "ผู้ให้เช่า") ฝ่ายหนึ่ง 
                    กับ <span className="font-semibold text-blue-600">คุณพงศ์ศักดิ์ ใจดี</span> (ซึ่งต่อไปนี้ในสัญญาเรียกว่า "ผู้เช่า") อีกฝ่ายหนึ่ง
                  </p>

                  <p className="indent-8 text-justify">
                    คู่สัญญาทั้งสองฝ่ายตกลงทำสัญญาเช่าห้องพักโครงการ <span className="font-semibold">Lumpini Suite (C-808)</span> โดยมีข้อตกลงดังต่อไปนี้:
                  </p>

                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-semibold">ระยะเวลาการเช่า:</span> 1 ปี (เริ่มต้น 1 กรกฎาคม 2569 สิ้นสุด 30 มิถุนายน 2570)
                    </li>
                    <li>
                      <span className="font-semibold">อัตราค่าเช่า:</span> 12,000 บาท ต่อเดือน (ชำระภายในวันที่ 5 ของทุกเดือน)
                    </li>
                    <li>
                      <span className="font-semibold">เงินประกันความเสียหาย:</span> 24,000 บาท (ชำระแล้ว ณ วันทำสัญญา)
                    </li>
                  </ul>

                  <p className="indent-8 text-justify mt-4">
                    คู่สัญญาทั้งสองฝ่ายได้อ่านและเข้าใจข้อความในสัญญานี้โดยตลอดแล้ว เห็นว่าถูกต้องตรงตามเจตนา จึงได้ลงลายมือชื่อไว้เป็นหลักฐานผ่านระบบอิเล็กทรอนิกส์
                  </p>
                </div>

                {/* Signatures Section */}
                <div className="pt-8 mt-8 border-t border-slate-300 grid grid-cols-2 gap-6 text-center text-[10px] text-slate-500">
                  
                  <div className="space-y-2">
                    <div className="h-12 flex items-end justify-center">
                      <span className="font-[Caveat] text-2xl text-blue-800 -rotate-6">Somyot P.</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1 border-dashed mx-2">
                      ( นายสมยศ พัฒนากุล )<br/>ผู้ให้เช่า (E-Signature)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-12 flex items-end justify-center">
                      <span className="font-[Caveat] text-2xl text-slate-800 -rotate-3">Pongsak J.</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1 border-dashed mx-2">
                      ( คุณพงศ์ศักดิ์ ใจดี )<br/>ผู้เช่า (E-Signature)
                    </div>
                  </div>

                  <div className="col-span-2 mt-4 space-y-2">
                    <div className="h-12 flex items-end justify-center">
                      <span className="font-[Caveat] text-2xl text-[#00B900] -rotate-2">RentFlow Agent</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1 border-dashed mx-16">
                      ( บริษัท เรนท์โฟลว์ เอเจนต์ จำกัด )<br/>พยาน / ตัวแทนจัดการ
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
