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

  const handle = (field: keyof Contract, val: string) => {
    if (field === 'rentAmount' || field === 'deposit') {
      onChange({ [field]: Number(val.replace(/[^0-9]/g, '')) || 0 });
    } else {
      onChange({ [field]: val });
    }
  };

  return (
    <div className="text-gray-700 text-sm leading-9 space-y-4">
      <h2 className="text-center text-xl font-black text-gray-900 tracking-wide mb-8 pb-4 border-b border-gray-100">
        สัญญาเช่าที่พัก
      </h2>

      <p>
        สัญญานี้ทำขึ้นเมื่อวันที่{' '}
        <EditableField value={contract.startDate} field="startDate" isEditable={canEdit} onChange={handle} />
        {' '}ระหว่าง{' '}
        <span className="font-semibold text-gray-900">{contract.ownerName}</span>
        {' '}(ผู้ให้เช่า) กับ{' '}
        <span className="font-semibold text-gray-900">{contract.tenantName}</span>
        {' '}(ผู้เช่า)
      </p>

      <p>
        คู่สัญญาตกลงให้เช่าทรัพย์สิน{' '}
        <span className="font-semibold text-gray-900">«{contract.propertyName}»</span>
        {' '}ตั้งอยู่ที่{' '}
        <span className="font-semibold text-gray-900">{contract.propertyAddress}</span>
      </p>

      <p>
        ระยะเวลาเช่า ตั้งแต่{' '}
        <EditableField value={contract.startDate} field="startDate" isEditable={canEdit} onChange={handle} />
        {' '}ถึง{' '}
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

      <p className="text-xs text-gray-400 border-t border-gray-100 pt-4 mt-2">
        {canEdit
          ? '✏️ คลิกที่ข้อความที่ขีดเส้นใต้เพื่อแก้ไขเนื้อหาสัญญา'
          : '📄 ท่านรับทราบสัญญาในฐานะผู้เช่า — เนื้อหาเป็น read-only'}
      </p>
    </div>
  );
}
