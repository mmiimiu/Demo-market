'use client';

import React from 'react';
import type { Contract } from './constants';
import type { UserRole } from '@/lib/types';

interface Props {
  contract: Contract;
  userRole: UserRole;
  onChange: (patch: Partial<Contract>) => void;
}

interface FieldProps {
  value: string;
  field: keyof Contract;
  isEditable: boolean;
  onChange: (field: keyof Contract, val: string) => void;
  suffix?: string;
}

function EditableField({ value, field, isEditable, onChange, suffix = '' }: FieldProps) {
  if (!isEditable) {
    return <span className="font-semibold text-gray-900">{value}{suffix}</span>;
  }
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      className="font-semibold text-blue-700 border-b border-dashed border-blue-400 px-0.5 min-w-[60px] inline-block focus:outline-none focus:border-blue-600 cursor-text"
      onBlur={(e) => onChange(field, e.currentTarget.textContent || value)}
    >
      {value}{suffix}
    </span>
  );
}

export function ContractDocument({ contract, userRole, onChange }: Props) {
  const canEdit = userRole === 'owner' || userRole === 'agent' || userRole === 'landlord';
  const isAuthorizationDoc = contract.propertyName.includes('มอบอำนาจ') || contract.propertyName.includes('แต่งตั้ง');

  const handle = (field: keyof Contract, val: string) => {
    if (field === 'rentAmount' || field === 'deposit') {
      onChange({ [field]: Number(val.replace(/[^0-9]/g, '')) || 0 });
    } else {
      onChange({ [field]: val });
    }
  };

  if (isAuthorizationDoc) {
    return (
      <div className="text-gray-700 text-sm leading-9 space-y-4 font-sans">
        <h2 className="text-center text-xl font-black text-gray-900 tracking-wide mb-8 pb-4 border-b border-gray-100">
          หนังสือแต่งตั้งและมอบอำนาจตัวแทนนายหน้า (Agent Authorization & Power of Attorney)
        </h2>

        <p>
          ทำขึ้นเมื่อวันที่{' '}
          <EditableField value={contract.startDate} field="startDate" isEditable={canEdit} onChange={handle} />
          {' '}โดย ข้าพเจ้า (เจ้าของห้อง/ผู้มอบอำนาจ):{' '}
          <EditableField value={contract.ownerName} field="ownerName" isEditable={canEdit} onChange={handle} />
          {' '}เป็นเจ้าของกรรมสิทธิ์ห้องพักโครงการ:{' '}
          <EditableField value={contract.propertyName} field="propertyName" isEditable={canEdit} onChange={handle} />
          {' '}โซน:{' '}
          <EditableField value={contract.zone || 'โซนทั่วไป'} field="zone" isEditable={canEdit} onChange={handle} />
          {' '}ห้องเลขที่:{' '}
          <EditableField value={contract.unitNo || 'ไม่ระบุ'} field="unitNo" isEditable={canEdit} onChange={handle} />
        </p>

        <p>
          ข้าพเจ้าขอมอบอำนาจให้ นายหน้าผู้รับแต่งตั้ง (Agent):{' '}
          <span className="font-semibold text-blue-700">คุณสมชาย (นายหน้าแต่งตั้งประจำแพลตฟอร์ม)</span>
          {' '}มีอำนาจเป็นตัวแทนในการดำเนินการหาผู้เช่า นำผู้เช่าเข้าชมทรัพย์สิน จัดทำและเจรจาสัญญาเช่า รวมถึงรับเงินมัดจำและค่าเช่าล่วงหน้าแทนข้าพเจ้า
        </p>

        <p>
          หนังสือมอบอำนาจฉบับนี้มีผลบังคับใช้ตั้งแต่วันที่{' '}
          <EditableField value={contract.startDate} field="startDate" isEditable={canEdit} onChange={handle} />
          {' '}ถึงวันที่{' '}
          <EditableField value={contract.endDate} field="endDate" isEditable={canEdit} onChange={handle} />
          {' '}หรือจนกว่าจะมีการทำหนังสือยกเลิกเป็นลายลักษณ์อักษร
        </p>

        <div className="mt-6 pt-4 border-t border-dashed border-gray-200 space-y-3">
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">📎 เอกสารแนบท้าย & เงื่อนไขการมอบอำนาจ:</h4>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
            <p className="font-bold text-slate-900">• สำเนาบัตรประชาชน / โฉนดที่ดินเจ้าของห้องพัก (แนบประกอบ)</p>
            <p className="font-bold text-slate-900">• อัตราค่าบริการนายหน้า 1 เดือน สำหรับสัญญาเช่ารายปี</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-700 text-sm leading-9 space-y-4 font-sans">
      <h2 className="text-center text-xl font-black text-gray-900 tracking-wide mb-8 pb-4 border-b border-gray-100">
        สัญญาเช่าที่พักอาศัยดิจิทัล (Digital Residential Lease Agreement)
      </h2>
      <p>
        สัญญานี้ทำขึ้นเมื่อวันที่{' '}
        <EditableField value={contract.startDate} field="startDate" isEditable={canEdit} onChange={handle} />
        {' '}ระหว่าง ผู้ให้เช่า (เจ้าของห้อง):{' '}
        <EditableField value={contract.ownerName} field="ownerName" isEditable={canEdit} onChange={handle} />
        {' '}ร่วมกับ นายหน้าดูแล (Agent):{' '}
        <span className="font-semibold text-blue-700">คุณสมชาย (นายหน้าประจำโซน)</span>
        {' '}กับ ผู้เช่า:{' '}
        <EditableField value={contract.tenantName} field="tenantName" isEditable={canEdit} onChange={handle} />
      </p>

      <p>
        คู่สัญญาตกลงทำสัญญาเช่าอสังหาริมทรัพย์ โครงการ/ทรัพย์สิน:{' '}
        <EditableField value={contract.propertyName} field="propertyName" isEditable={canEdit} onChange={handle} />
        {' '}โซน:{' '}
        <EditableField value={contract.zone || 'โซนทั่วไป'} field="zone" isEditable={canEdit} onChange={handle} />
        {' '}ห้องเลขที่:{' '}
        <EditableField value={contract.unitNo || 'ไม่ระบุ'} field="unitNo" isEditable={canEdit} onChange={handle} />
        {' '}ตั้งอยู่ที่:{' '}
        <EditableField value={contract.propertyAddress} field="propertyAddress" isEditable={canEdit} onChange={handle} />
      </p>

      <p>
        ระยะเวลาเช่า (หรือการต่ออายุสัญญา) ตั้งแต่วันที่{' '}
        <EditableField value={contract.startDate} field="startDate" isEditable={canEdit} onChange={handle} />
        {' '}ถึงวันที่{' '}
        <EditableField value={contract.endDate} field="endDate" isEditable={canEdit} onChange={handle} />
      </p>

      <p>
        ผู้เช่าตกลงชำระค่าเช่าเดือนละ{' '}
        <EditableField
          value={contract.rentAmount.toLocaleString()}
          field="rentAmount"
          isEditable={canEdit}
          onChange={handle}
          suffix=" บาท"
        />
        {' '}ภายในวันที่ 5 ของทุกเดือน
      </p>

      <p>
        ผู้เช่าวางเงินมัดจำจำนวน{' '}
        <EditableField
          value={contract.deposit.toLocaleString()}
          field="deposit"
          isEditable={canEdit}
          onChange={handle}
          suffix=" บาท"
        />
        {' '}ซึ่งจะคืนเมื่อครบสัญญาหากไม่มีความเสียหาย
      </p>

      {/* เอกสารแนบท้ายสัญญาและจุดลงนาม */}
      <div className="mt-6 pt-4 border-t border-dashed border-gray-200 space-y-3">
        <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">📎 เอกสารแนบท้ายสัญญา & ข้อตกลงเพิ่มเติม (Attachments & Signatures):</h4>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
          <p className="font-bold text-slate-900">• รายการแนบท้าย 1: รายการทรัพย์สิน อุปกรณ์ไฟฟ้า และสภาพห้องพัก ณ วันส่งมอบ</p>
          <p className="font-bold text-slate-900">• รายการแนบท้าย 2: ข้อตกลงระเบียบการต่ออายุสัญญาเช่าและข้อบังคับอาคารชุด</p>
          <p className="text-[11px] text-gray-500 italic">ทุกใบเอกสารแนบท้ายถูกผูกกับลายมือชื่อดิจิทัลและตรายางรับรองของคู่สัญญาและเอเจ้นท์โดยสมบูรณ์</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 border-t border-gray-100 pt-4 mt-2">
        {canEdit
          ? '✏️ สามารถคลิกที่ตัวหนังสือสีฟ้าเพื่อพิมพ์แก้ไข ชื่อโครงการ, ชื่อเจ้าของ, ผู้เช่า, วันเริ่ม/สิ้นสุดสัญญา ได้ตลอดเวลา'
          : '📄 ท่านรับทราบสัญญาในฐานะผู้เช่า — เนื้อหาเป็น read-only'}
      </p>
    </div>
  );
}
