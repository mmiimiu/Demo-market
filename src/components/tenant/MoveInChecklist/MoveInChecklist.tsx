'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, ArrowRight, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ChecklistItem, MoveInChecklistProps } from './types';
import { CategoryGroup } from './CategoryGroup';

export const MoveInChecklist: React.FC<MoveInChecklistProps> = ({ lang, propertyId, contractId, onComplete }) => {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', category: lang === 'th' ? 'ประตู/หน้าต่าง' : 'Doors/Windows', name: lang === 'th' ? 'กุญแจและลูกบิดประตู' : 'Keys & Knobs', status: null, remark: '', photos: [] },
    { id: '2', category: lang === 'th' ? 'ประตู/หน้าต่าง' : 'Doors/Windows', name: lang === 'th' ? 'หน้าต่างและมุ้งลวด' : 'Windows & Screens', status: null, remark: '', photos: [] },
    { id: '3', category: lang === 'th' ? 'เครื่องใช้ไฟฟ้า' : 'Appliances', name: lang === 'th' ? 'เครื่องปรับอากาศ' : 'Air Conditioner', status: null, remark: '', photos: [] },
    { id: '4', category: lang === 'th' ? 'เครื่องใช้ไฟฟ้า' : 'Appliances', name: lang === 'th' ? 'ตู้เย็น' : 'Refrigerator', status: null, remark: '', photos: [] },
    { id: '5', category: lang === 'th' ? 'ห้องน้ำ' : 'Bathroom', name: lang === 'th' ? 'ก๊อกน้ำและฝักบัว' : 'Faucets & Shower', status: null, remark: '', photos: [] },
    { id: '6', category: lang === 'th' ? 'ห้องน้ำ' : 'Bathroom', name: lang === 'th' ? 'ชักโครก (ไม่มีรอยรั่ว)' : 'Toilet (No Leaks)', status: null, remark: '', photos: [] },
    { id: '7', category: lang === 'th' ? 'เฟอร์นิเจอร์' : 'Furniture', name: lang === 'th' ? 'เตียงและฟูกที่นอน' : 'Bed & Mattress', status: null, remark: '', photos: [] },
    { id: '8', category: lang === 'th' ? 'เฟอร์นิเจอร์' : 'Furniture', name: lang === 'th' ? 'ตู้เสื้อผ้า' : 'Wardrobe', status: null, remark: '', photos: [] },
  ]);

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contractActive, setContractActive] = useState<boolean | null>(null);
  const [loadingContract, setLoadingContract] = useState(true);

  const db = useFirestore();
  const isThai = lang === 'th';

  // Check contract status
  useEffect(() => {
    async function checkStatus() {
      if (db && contractId && contractId !== 'mock_contract') {
        try {
          const docRef = doc(db, 'contracts', contractId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().status === 'active') {
            setContractActive(true);
            setLoadingContract(false);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
      const localActive = contracts.some((c: any) => c.id === contractId && c.status === 'active') ||
                           contractId === 'mock_contract';
      setContractActive(localActive);
      setLoadingContract(false);
    }
    checkStatus();
  }, [db, contractId]);

  const updateItemStatus = (id: string, status: 'good' | 'damaged' | 'untested') => {
    setItems(items.map(item => item.id === id ? { ...item, status } : item));
  };

  const updateRemark = (id: string, remark: string) => {
    setItems(items.map(item => item.id === id ? { ...item, remark } : item));
  };

  const handleMockUploadPhoto = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, photos: [...item.photos, 'https://placehold.co/150'] } : item));
  };

  const removePhoto = (id: string, photoIndex: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newPhotos = [...item.photos];
        newPhotos.splice(photoIndex, 1);
        return { ...item, photos: newPhotos };
      }
      return item;
    }));
  };

  const handleSubmit = async () => {
    const incomplete = items.find(item => item.status === null);
    if (incomplete) {
      alert(isThai ? 'กรุณาตรวจสอบให้ครบทุกรายการ' : 'Please check all items');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, contractId, items })
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        if (onComplete) setTimeout(onComplete, 2000);
      } else {
        alert(data.error || 'Failed to submit checklist');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  if (loadingContract) return <div className="text-center p-10">Loading...</div>;

  if (!contractActive) {
    return (
      <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-lg my-12 space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-gray-900">{isThai ? 'แบบประเมินห้องพักถูกล็อก' : 'Checklist Locked'}</h3>
        <p className="text-sm text-gray-500 font-semibold leading-relaxed">
          {isThai 
            ? 'แบบประเมินสภาพห้องพัก จะเปิดให้เข้าทำได้หลังจากคู่สัญญาลงนามครบทุกฝ่ายและสัญญามีผลบังคับใช้แล้วเท่านั้น'
            : 'The Move-in Checklist will unlock once the digital contract is fully signed by all parties.'}
        </p>
        <Button className="w-full bg-gray-900 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2">
          <FileText className="w-5 h-5" /> {isThai ? 'ดูสถานะสัญญาเช่า' : 'View Contract Status'}
        </Button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto mt-8">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">{isThai ? 'ส่งแบบประเมินเรียบร้อย' : 'Checklist Submitted'}</h2>
        <p className="text-gray-500 font-medium">{isThai ? 'ข้อมูลถูกบันทึกเพื่อใช้เป็นหลักฐานประกอบสัญญาเช่า' : 'Recorded as lease evidence.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 max-w-3xl mx-auto mt-8">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
          <CheckSquare className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">{isThai ? 'ตรวจสภาพห้องก่อนย้ายเข้า' : 'Move-in Checklist'}</h2>
          <p className="text-gray-500 font-medium mt-1">{isThai ? 'ตรวจสอบและถ่ายรูปจุดที่มีปัญหา เพื่อป้องกันการหักเงินประกันในอนาคต' : 'Inspect and photograph damages to protect your deposit.'}</p>
        </div>
      </div>

      <div className="space-y-8 mb-10">
        {Object.entries(groupedItems).map(([category, catItems]) => (
          <CategoryGroup 
            key={category} lang={lang} category={category} catItems={catItems}
            updateItemStatus={updateItemStatus} updateRemark={updateRemark}
            handleMockUploadPhoto={handleMockUploadPhoto} removePhoto={removePhoto}
          />
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black font-black text-lg text-white shadow-xl gap-2">
        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
          <>{isThai ? 'ยืนยันและส่งแบบประเมิน' : 'Confirm & Submit Checklist'} <ArrowRight className="w-5 h-5" /></>
        )}
      </Button>
    </div>
  );
};
