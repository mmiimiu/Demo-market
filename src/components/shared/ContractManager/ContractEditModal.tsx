import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { ContractTemplate } from './types';
import { handleEditSave } from './handlers';

interface ContractEditModalProps {
  editMonthlyRent: string;
  setEditMonthlyRent: (v: string) => void;
  editDepositAmount: string;
  setEditDepositAmount: (v: string) => void;
  editAdvanceRentAmount: string;
  setEditAdvanceRentAmount: (v: string) => void;
  template: ContractTemplate;
  setTemplate: (t: ContractTemplate) => void;
  editStartDate: string;
  setEditStartDate: (v: string) => void;
  editEndDate: string;
  setEditEndDate: (v: string) => void;
  contractId: string;
  user: any;
  db: any;
  contract: any;
  setContract: (c: any) => void;
  setIsEditing: (editing: boolean) => void;
  setAuditLog: (log: any) => void;
  toast: any;
  lang: 'th' | 'en' | 'cn';
}

export function ContractEditModal({
  editMonthlyRent, setEditMonthlyRent, editDepositAmount, setEditDepositAmount,
  editAdvanceRentAmount, setEditAdvanceRentAmount, template, setTemplate,
  editStartDate, setEditStartDate, editEndDate, setEditEndDate,
  contractId, user, db, contract, setContract, setIsEditing, setAuditLog, toast, lang
}: ContractEditModalProps) {
  return (
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
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 font-bold">บันทึกการแก้ไข</Button>
            <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="font-bold">ยกเลิก</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
