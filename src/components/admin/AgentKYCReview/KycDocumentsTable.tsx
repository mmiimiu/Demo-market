import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface KycDocumentsTableProps {
  kycDocs: any[];
}

export function KycDocumentsTable({ kycDocs }: KycDocumentsTableProps) {
  return (
    <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-base font-black text-slate-800">📑 เอกสาร KYC ที่เก็บในระบบ</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto border rounded-xl divide-y divide-slate-100">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="font-black text-slate-400 text-[10px] uppercase">
              <th className="p-4">ชื่อเอกสาร</th>
              <th className="p-4 text-center">ประเภท</th>
              <th className="p-4 text-center">สถานะ</th>
              <th className="p-4 text-center">อัปเดตล่าสุด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
            {kycDocs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-black text-slate-900">{doc.propertyName}</td>
                <td className="p-4 text-center">
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-100 font-bold text-[9px]">
                    KYC
                  </Badge>
                </td>
                <td className="p-4 text-center font-bold text-indigo-700">{doc.status}</td>
                <td className="p-4 text-center text-slate-500">{doc.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
