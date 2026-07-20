'use client';

import React from 'react';
import { WarningData } from './types';

interface NoticePaperProps {
  warningData: WarningData;
  signatureUrl: string | null;
  thaiDateString: string;
  thaiDueDateString: string;
  isTh: boolean;
}

export const NoticePaper = React.forwardRef<HTMLDivElement, NoticePaperProps>(({
  warningData, signatureUrl, thaiDateString, thaiDueDateString, isTh
}, ref) => (
  <div
    ref={ref}
    className="w-full max-w-[210mm] min-h-[297mm] bg-white p-12 shadow-lg border border-gray-300 relative text-gray-900 font-serif text-sm leading-relaxed"
    style={{ fontFamily: "'Sarabun', 'Noto Sans Thai', serif" }}
  >
    <div className="flex justify-center mb-6">
      <div className="w-12 h-12 rounded-full border-2 border-[#1C2030] flex items-center justify-center text-[#1C2030] font-bold text-xs uppercase tracking-widest">
        PRIME
      </div>
    </div>

    <div className="text-right mb-4">
      <p className="font-bold">{isTh ? 'เขียนที่: ระบบบริหารจัดการ PrimeRent' : 'Written at: PrimeRent System'}</p>
      <p className="text-gray-600">{thaiDateString}</p>
    </div>

    <div className="space-y-1.5 mb-6">
      <p><span className="font-bold">{isTh ? 'เรื่อง:' : 'Subject:'}</span> {isTh ? 'ขอให้ชำระหนี้ค้างชำระค่าเช่า และส่งมอบพื้นที่คืน' : 'Payment Demand & Lease Arrears Notification'}</p>
      <p><span className="font-bold">{isTh ? 'เรียน:' : 'To:'}</span> คุณ{warningData.tenantName} ({isTh ? 'ผู้เช่า' : 'Tenant'})</p>
      <p><span className="font-bold">{isTh ? 'อ้างถึง:' : 'Reference:'}</span> สัญญาเช่าทรัพย์สินโครงการ {warningData.propertyName} ห้องเลขที่ {warningData.roomNo}</p>
    </div>

    <div className="space-y-4">
      <p className="indent-12">
        {isTh
          ? `ตามที่ท่านได้ทำสัญญาเช่าทรัพย์สินอสังหาริมทรัพย์ ตามสัญญาเช่าอ้างถึง ตกลงเช่าห้องพักเลขที่ ${warningData.roomNo} ในโครงการ ${warningData.propertyName} โดยมีกำหนดชำระค่าเช่าและค่าบริการส่วนควบรายเดือน ภายในวันที่ 25 ของทุกเดือน นั้น`
          : `According to the lease agreement referenced above, you agreed to lease Room No. ${warningData.roomNo} at ${warningData.propertyName}, with monthly rent and utility payments due by the 25th of each month.`
        }
      </p>

      <p className="indent-12">
        {isTh
          ? `บัดนี้ ปรากฏว่าท่านยังไม่ได้ชำระเงินค่าเช่า ค่าน้ำ ค่าไฟ และค่าส่วนกลาง ประจำรอบบิลเดือน ${warningData.billingMonth} ซึ่งมีกำหนดชำระวันที่ ${thaiDueDateString} ทำให้มียอดค้างชำระเกินกำหนดมาแล้วเป็นเวลา ${warningData.daysOverdue} วัน รวมเป็นหนี้ค้างชำระทั้งสิ้น จำนวน ฿${warningData.total.toLocaleString()} โดยมีรายละเอียดดังต่อไปนี้:`
          : `As of today, you have failed to pay the monthly rent, common fees, water, and electricity charges for the period of ${warningData.billingMonth}, which was due on ${warningData.dueDate}. Payment is now overdue by ${warningData.daysOverdue} days, totaling ฿${warningData.total.toLocaleString()}, as broken down below:`
        }
      </p>

      <table className="w-full text-xs font-sans my-4 border border-gray-200">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 font-bold">
            <th className="p-2 border-r">{isTh ? 'รายการค้างชำระ' : 'Description'}</th>
            <th className="p-2 text-right">{isTh ? 'จำนวนเงิน (บาท)' : 'Amount (THB)'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 font-medium">
          <tr>
            <td className="p-2 border-r">{isTh ? 'ค่าเช่าห้องหลัก' : 'Monthly Rent'}</td>
            <td className="p-2 text-right">฿{warningData.rent.toLocaleString()}</td>
          </tr>
          <tr>
            <td className="p-2 border-r">{isTh ? 'ค่าบริการส่วนกลางรายเดือน' : 'Common Fee'}</td>
            <td className="p-2 text-right">฿{warningData.commonFee.toLocaleString()}</td>
          </tr>
          <tr>
            <td className="p-2 border-r">{isTh ? 'ค่าน้ำประปา' : 'Water Charge'}</td>
            <td className="p-2 text-right">฿{warningData.water.toLocaleString()}</td>
          </tr>
          <tr>
            <td className="p-2 border-r">{isTh ? 'ค่าไฟฟ้า' : 'Electricity Charge'}</td>
            <td className="p-2 text-right">฿{warningData.electricity.toLocaleString()}</td>
          </tr>
          <tr className="bg-slate-50 font-bold border-t-2 border-gray-300">
            <td className="p-2 border-r">{isTh ? 'ยอดเงินค้างชำระรวมสุทธิ' : 'Total Net Arrears'}</td>
            <td className="p-2 text-right text-[#E55B3C]">฿{warningData.total.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <p className="indent-12">
        {isTh
          ? `ดังนั้น ข้าพเจ้าในฐานะผู้ให้เช่า/ผู้รับมอบอำนาจ จึงขอบอกกล่าวทวงถามมายังท่านเพื่อโปรดนำเงินจำนวนค้างชำระดังกล่าวไปชำระให้เสร็จสิ้นเรียบร้อยภายในเวลา 7 (เจ็ด) วัน นับตั้งแต่วันที่ได้รับหนังสือฉบับนี้เป็นต้นไป`
          : `Therefore, as the landlord, I hereby demand that you pay the full outstanding balance of ฿${warningData.total.toLocaleString()} within 7 (seven) days of receipt of this formal letter.`
        }
      </p>

      <p className="indent-12">
        {isTh
          ? `หากพ้นกำหนดเวลาดังกล่าวแล้ว ท่านยังคงเพิกเฉยไม่ชำระ ข้าพเจ้ามีความจำเป็นต้องขอใช้สิทธิบอกเลิกสัญญาเช่าทรัพย์สิน และขอให้ท่านพร้อมบริวารขนย้ายออกจากทรัพย์สินเช่าทันที อีกทั้งข้าพเจ้าขอสงวนสิทธิ์ในการดำเนินคดีเรียกร้องค่าเช่าค้างชำระ ค่าขาดประโยชน์ และค่าเสียหายทางกฎหมายจนกว่าจะเสร็จสิ้นกระบวนการต่อไป`
          : `Should you fail to clear this balance within the specified period, I shall be forced to immediately terminate the lease agreement, request that you vacate the property, and pursue legal proceedings to recover all outstanding rents, late penalties, and legal expenses.`
        }
      </p>

      <p className="text-right mt-8 mr-12">{isTh ? 'ขอแสดงความนับถือ' : 'Sincerely yours,'}</p>

      <div className="flex flex-col items-end mt-4 mr-10 relative">
        <div className="w-40 h-16 border-b border-gray-400 border-dashed flex items-center justify-center overflow-hidden">
          {signatureUrl ? (
            <img src={signatureUrl} alt="Landlord Signature" className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-xs text-gray-400 italic font-sans">{isTh ? '(ยังไม่ได้ลงนาม)' : '(Unsigned)'}</span>
          )}
        </div>
        <p className="text-xs font-bold text-gray-500 mt-2 mr-6">( {isTh ? 'ผู้ให้เช่า / เจ้าของกรรมสิทธิ์' : 'Landlord / Owner'} )</p>
      </div>
    </div>
  </div>
));

NoticePaper.displayName = 'NoticePaper';
