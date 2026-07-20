'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { PlusCircle, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyOwnershipVerification } from '@/lib/types/property';
import { AddPropertyModal } from './AddPropertyModal';

interface OwnerPropertiesTabProps {
  lang: 'th' | 'en' | 'cn';
}

export function OwnerPropertiesTab({ lang }: OwnerPropertiesTabProps) {
  const { user } = useUser();
  const [properties, setProperties] = useState<PropertyOwnershipVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchProperties = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, 'properties_verification'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const propsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PropertyOwnershipVerification[];
      setProperties(propsData);
    } catch (error) {
      console.error('Error fetching property verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; bg: string; icon: React.ReactNode; text: string }> = {
      approved: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: lang === 'en' ? 'Approved' : lang === 'cn' ? '已批准' : 'อนุมัติแล้ว' },
      rejected: { color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle className="w-3.5 h-3.5" />, text: lang === 'en' ? 'Rejected' : lang === 'cn' ? '已拒绝' : 'ถูกปฏิเสธ' },
      default: { color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock className="w-3.5 h-3.5" />, text: lang === 'en' ? 'Pending' : lang === 'cn' ? '待审核' : 'รอตรวจสอบ' }
    };
    const b = badges[status] || badges.default;
    return (
      <span className={`flex items-center gap-1 text-xs font-bold ${b.color} ${b.bg} px-2.5 py-1 rounded-lg`}>
        {b.icon} {b.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {lang === 'en' ? 'Manage Ownership' : lang === 'cn' ? '所有权管理' : 'จัดการกรรมสิทธิ์'}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {lang === 'en' ? 'Verify your properties to start posting listings securely.' 
             : lang === 'cn' ? '验证您的房产以安全地开始发布房源。'
             : 'ยืนยันกรรมสิทธิ์ของทรัพย์สินเพื่อลงประกาศอย่างปลอดภัย (ข้อมูลส่วนตัวนี้จะไม่ถูกเปิดเผย)'}
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {lang === 'en' ? 'Add New Property' : lang === 'cn' ? '添加新房产' : 'เพิ่มทรัพย์สินใหม่'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Loading...</div>
        ) : properties.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h4 className="text-gray-900 font-bold mb-2">
              {lang === 'en' ? 'No Properties Found' : lang === 'cn' ? '未找到房产' : 'ยังไม่มีทรัพย์สิน'}
            </h4>
            <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto">
              {lang === 'en' ? 'Add your first property ownership claim to get started.' : 'คลิกปุ่ม "เพิ่มทรัพย์สินใหม่" เพื่ออัปโหลดโฉนดและยืนยันกรรมสิทธิ์'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {properties.map((prop) => (
              <div key={prop.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">
                      {lang === 'en' ? 'Deed No: ' : 'เลขที่โฉนด: '} {prop.deedNumber}
                    </span>
                    {getStatusBadge(prop.status)}
                  </div>
                  <div className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    {lang === 'en' ? 'Land Office: ' : 'สำนักงานที่ดิน/เขตพื้นที่: '} {prop.landOffice}
                  </div>
                  {prop.status === 'rejected' && prop.rejectionReason && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mt-2 inline-block font-medium">
                      <span className="font-bold">Reason:</span> {prop.rejectionReason}
                    </div>
                  )}
                </div>
                {prop.deedFileUrl && (
                  <a href={prop.deedFileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg shrink-0">
                    {lang === 'en' ? 'View Document' : 'ดูเอกสารโฉนด'}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddPropertyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} lang={lang} onSuccess={fetchProperties} />
      )}
    </div>
  );
}

