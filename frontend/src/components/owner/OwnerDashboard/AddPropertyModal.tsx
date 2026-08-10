'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import { db, storage } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'th' | 'en' | 'cn';
  onSuccess: () => void;
}

export function AddPropertyModal({ isOpen, onClose, lang, onSuccess }: AddPropertyModalProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [landOffice, setLandOffice] = useState('');
  const [deedNumber, setDeedNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!landOffice || !deedNumber || !file) {
      toast({
        title: lang === 'en' ? 'Missing Fields' : 'ข้อมูลไม่ครบ',
        description: lang === 'en' ? 'Please fill all required fields.' : 'กรุณากรอกข้อมูลให้ครบถ้วนและแนบไฟล์โฉนด',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Upload deed file
      const fileRef = ref(storage, `deeds/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const deedFileUrl = await getDownloadURL(fileRef);

      // Save to Firestore
      await addDoc(collection(db, 'properties_verification'), {
        uid: user.uid,
        landOffice,
        deedNumber,
        deedFileUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast({
        title: lang === 'en' ? 'Submitted Successfully' : 'ส่งข้อมูลสำเร็จ',
        description: lang === 'en' ? 'Your property is waiting for admin approval.' : 'คำขอเพิ่มกรรมสิทธิ์ของคุณกำลังรอการอนุมัติ',
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding property:', error);
      toast({
        title: lang === 'en' ? 'Error' : 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{lang === 'en' ? 'Add Property Ownership' : lang === 'cn' ? '添加房产所有权' : 'เพิ่มและยืนยันกรรมสิทธิ์ใหม่'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="landOffice">{lang === 'en' ? 'Land Office' : 'สำนักงานที่ดิน/เขตพื้นที่'}</Label>
            <Input 
              id="landOffice" 
              value={landOffice} 
              onChange={(e) => setLandOffice(e.target.value)} 
              placeholder={lang === 'en' ? 'e.g., Huai Khwang' : 'เช่น ห้วยขวาง, บางเขน'}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deedNumber">{lang === 'en' ? 'Deed Number' : 'เลขที่โฉนดที่ดินหลักทรัพย์'}</Label>
            <Input 
              id="deedNumber" 
              value={deedNumber} 
              onChange={(e) => setDeedNumber(e.target.value)} 
              placeholder="e.g., 12345"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>{lang === 'en' ? 'Deed Document' : 'ไฟล์โฉนดที่ดิน'}</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 font-bold">
                    {file ? file.name : (lang === 'en' ? 'Click to upload' : 'คลิกเพื่ออัปโหลด')}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">PNG, JPG or PDF</p>
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, application/pdf"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  disabled={loading}
                />
              </label>
            </div>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === 'en' ? 'Submit for Verification' : 'ส่งข้อมูลเพื่อตรวจสอบ')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
