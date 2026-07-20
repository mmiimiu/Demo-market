'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Download, Lock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ChecklistItem, MoveInChecklistProps } from './types';
import { ChecklistItemsList } from './ChecklistItemsList';
import { ChecklistSignaturePad } from './ChecklistSignaturePad';
import { generateChecklistPDF } from './pdfUtils';

export function MoveInChecklist({ lang, propertyName, contractId = 'mock_contract' }: MoveInChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', name: lang === 'th' ? 'แอร์ (Air Conditioner)' : 'Air Conditioner', status: 'good', note: '' },
    { id: '2', name: lang === 'th' ? 'ผนังห้อง (Walls)' : 'Walls', status: 'good', note: '' },
    { id: '3', name: lang === 'th' ? 'พื้นห้อง (Floors)' : 'Floors', status: 'good', note: '' },
    { id: '4', name: lang === 'th' ? 'เตียงและที่นอน (Bed & Mattress)' : 'Bed & Mattress', status: 'good', note: '' },
  ]);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [contractActive, setContractActive] = useState<boolean | null>(null);
  const [loadingContract, setLoadingContract] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const isThai = lang === 'th';

  useEffect(() => {
    async function checkStatus() {
      if (db && contractId && contractId !== 'mock_contract') {
        try {
          const docSnap = await getDoc(doc(db, 'contracts', contractId));
          if (docSnap.exists() && docSnap.data().status === 'active') { setContractActive(true); setLoadingContract(false); return; }
        } catch (e) {}
      }
      const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
      setContractActive(contracts.some((c: any) => c.id === contractId && c.status === 'active') || contractId === 'mock_contract');
      setLoadingContract(false);
    }
    checkStatus();
  }, [db, contractId]);

  const addItem = () => setItems([...items, { id: Math.random().toString(36).substr(2, 9), name: '', status: 'good', note: '' }]);
  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));
  const updateItem = (id: string, field: keyof ChecklistItem, value: any) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handlePhotoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateItem(id, 'photo', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChecklist = async () => {
    if (!auth.currentUser || !db) return;
    const checklistId = `chk-${Date.now()}`;
    await setDoc(doc(db, 'checklists', checklistId), {
      id: checklistId, propertyName, tenantId: auth.currentUser.uid,
      items: items.map(({ id, ...rest }) => rest), signature: signatureImage, createdAt: serverTimestamp()
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const ev = e as any;
    ctx.beginPath();
    ctx.moveTo((ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left, (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top);
    ctx.lineWidth = 2; ctx.strokeStyle = '#111827';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ev = e as any;
    ctx.lineTo((ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left, (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top);
    ctx.stroke();
  };

  const saveSignature = () => {
    if (canvasRef.current) { setSignatureImage(canvasRef.current.toDataURL()); toast({ title: isThai ? 'บันทึกลายเซ็นเสร็จสิ้น' : 'Signature Confirmed' }); }
  };

  if (loadingContract) return <div className="text-center p-10 font-bold text-gray-400">Loading...</div>;

  if (!contractActive) {
    return (
      <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-lg my-12 space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto"><Lock className="w-8 h-8" /></div>
        <h3 className="text-xl font-black text-gray-900">{isThai ? 'เข้าใช้งานแบบประเมินห้องพักถูกล็อก' : 'Inspection Checklist Locked'}</h3>
        <p className="text-sm text-gray-500 font-semibold">{isThai ? 'แบบประเมินสภาพห้องพัก (Move-in Checklist) จะปลดล็อกหลังจากคู่สัญญาเซ็นชื่อครบถ้วนแล้วเท่านั้น' : 'Unlocked after contract is active.'}</p>
        <Button className="w-full bg-gray-900 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2"><FileText className="w-5 h-5" /> {isThai ? 'ดูสถานะสัญญาเช่า' : 'View Contract Status'}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">
      <div className="bg-primary/5 rounded-none p-8 border border-primary/10 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-primary rounded-none flex items-center justify-center text-white shrink-0 shadow-lg"><ShieldCheck className="w-8 h-8" /></div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{isThai ? 'รายการตรวจสอบก่อนเข้าพัก' : 'Move-in Checklist'}</h2>
          <p className="text-muted-foreground font-medium">{isThai ? 'บันทึกหลักฐานสภาพห้องพักเพื่อความโปร่งใสและเป็นธรรม' : 'Capture room evidence for transparency.'}</p>
        </div>
      </div>
      <ChecklistItemsList lang={lang} items={items} addItem={addItem} removeItem={removeItem} updateItem={updateItem} handlePhotoUpload={handlePhotoUpload} />
      <ChecklistSignaturePad lang={lang} signatureImage={signatureImage} canvasRef={canvasRef} isDrawing={isDrawing} startDrawing={startDrawing} draw={draw} stopDrawing={() => setIsDrawing(false)} clearCanvas={() => { if (canvasRef.current) canvasRef.current.getContext('2d')?.clearRect(0, 0, 400, 150); setSignatureImage(null); }} saveSignature={saveSignature} />
      <Button onClick={() => generateChecklistPDF(propertyName, items, signatureImage, handleSaveChecklist)} className="w-full h-14 rounded-none bg-primary font-black text-lg shadow-xl gap-2 text-white"><Download className="w-6 h-6" /> {isThai ? 'บันทึกเช็คลิสต์และดาวน์โหลด PDF' : 'Save & Download PDF'}</Button>
    </div>
  );
}
