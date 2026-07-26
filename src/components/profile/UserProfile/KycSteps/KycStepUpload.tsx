import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, QrCode, Building, Loader2, ArrowRight, Globe, Fingerprint, Rss, Scan, CreditCard, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Language } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface KycStepUploadProps {
  lang: Language;
  kycDocType: 'id' | 'passport' | 'license' | 'deed' | 'thaid' | 'ndid';
  kycIdNumber: string;
  kycFullName: string;
  uploadedFile: string | null; // not strictly used for files anymore but kept for prop typing
  uploadProgress: number;
  isUploading: boolean;
  onIdNumberChange: (v: string) => void;
  onFullNameChange: (v: string) => void;
  onFileDrop: (e: any) => void; // kept for compatibility
  onBack: () => void;
  onSubmit: () => void;
  selectedBank?: string;
  onSelectBank?: (b: string) => void;
  ndidPushSent?: boolean;
  onSendNdidPush?: (sent: boolean) => void;
}

export function KycStepUpload({
  lang, kycDocType, kycIdNumber, kycFullName, onIdNumberChange, onFullNameChange,
  onBack, onSubmit, selectedBank = 'kbank', onSelectBank, ndidPushSent = false, onSendNdidPush
}: KycStepUploadProps) {
  const isTh = lang === 'th';
  const [localPushLoading, setLocalPushLoading] = useState(false);

  // NFC Passport states and simulator handlers
  const [passportNo, setPassportNo] = useState('AA1234567');
  const [nationality, setNationality] = useState('United States');
  const [dob, setDob] = useState('1995-05-15');
  const [expiryDate, setExpiryDate] = useState('2032-12-01');
  const [nfcState, setNfcState] = useState<'idle' | 'scanning_mrz' | 'connecting_nfc' | 'liveness' | 'success'>('idle');
  const [nfcProgress, setNfcProgress] = useState(0);

  // ID Card flow states
  const [idCardFile, setIdCardFile] = useState<string | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [idCardUploading, setIdCardUploading] = useState(false);
  const [idCardUploadProgress, setIdCardUploadProgress] = useState(0);

  // Sub-stages to enforce ID Card + Face Scan inside ThaID and NDID
  const [thaidSubStage, setThaidSubStage] = useState<'qr' | 'liveness'>('qr');
  const [ndidSubStage, setNdidSubStage] = useState<'bank_select' | 'waiting' | 'liveness'>('bank_select');

  const handleIdCardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdCardFile(file.name);
    setIdCardUploading(true);
    setIdCardUploadProgress(0);
    const reader = new FileReader();
    reader.onload = ev => setIdCardPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    const iv = setInterval(() => {
      setIdCardUploadProgress(prev => {
        if (prev >= 100) { clearInterval(iv); setIdCardUploading(false); return 100; }
        return prev + 20;
      });
    }, 150);
  };

  const handleStartIdVerify = () => {
    if (!kycIdNumber || kycIdNumber.length !== 13) {
      toast({
        variant: 'destructive',
        title: isTh ? 'หมายเลขบัตรประชาชนไม่ถูกต้อง' : 'Invalid Citizen ID',
        description: isTh ? 'กรุณากรอกหมายเลขบัตรประชาชน 13 หลัก' : 'Please input a 13-digit national ID.'
      });
      return;
    }
    if (!kycFullName.trim()) {
      toast({
        variant: 'destructive',
        title: isTh ? 'กรุณากรอกชื่อ-นามสกุลจริง' : 'Full Name Required'
      });
      return;
    }
    if (!idCardFile) {
      toast({
        variant: 'destructive',
        title: isTh ? 'กรุณาอัปโหลดรูปภาพบัตรประชาชน' : 'ID Card Photo Required'
      });
      return;
    }

    setNfcState('scanning_mrz');
    setNfcProgress(0);

    const interval = setInterval(() => {
      setNfcProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setNfcState('liveness');
          setNfcProgress(0);
          
          // Face Liveness Stage
          const faceInterval = setInterval(() => {
            setNfcProgress(fPrev => {
              if (fPrev >= 100) {
                clearInterval(faceInterval);
                setNfcState('success');
                toast({
                  title: isTh ? 'ยืนยันตัวตนสำเร็จ!' : 'Biometric Verification Passed!',
                  description: isTh ? 'ใบหน้าตรงกับบัตรประชาชน 98.8% ผ่านระบบ Liveness' : 'Liveness face matching at 98.8% match with ID photo.'
                });
                return 100;
              }
              return fPrev + 25;
            });
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };


  const triggerNfcStage3 = () => {
    const interval = setInterval(() => {
      setNfcProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setNfcState('success');
          toast({
            title: isTh ? 'ยืนยันชิป NFC สำเร็จ!' : 'NFC Verification Passed!',
            description: isTh ? 'ตรวจสอบลายเซ็นดิจิทัลและจับคู่ใบหน้า 99.2% ผ่านแล้ว' : 'Passport signature verified. Face matching at 99.2% match.'
          });
          return 100;
        }
        return prev + 33;
      });
    }, 500);
  };

  const triggerNfcStage2 = () => {
    const interval = setInterval(() => {
      setNfcProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setNfcState('liveness');
          setNfcProgress(0);
          triggerNfcStage3();
          return 100;
        }
        return prev + 25;
      });
    }, 500);
  };

  const handleStartNfcScan = () => {
    if (!passportNo.trim() || passportNo.length < 8) {
      toast({
        variant: 'destructive',
        title: isTh ? 'หมายเลขหนังสือเดินทางไม่ถูกต้อง' : 'Invalid Passport Number',
        description: isTh ? 'กรุณากรอกหมายเลขพาสปอร์ตอย่างน้อย 8 หลัก' : 'Please input a passport number of at least 8 characters'
      });
      return;
    }
    if (!kycFullName.trim()) {
      toast({
        variant: 'destructive',
        title: isTh ? 'กรุณาระบุชื่อจริงภาษาอังกฤษ' : 'English Full Name Required'
      });
      return;
    }

    setNfcState('scanning_mrz');
    setNfcProgress(0);

    const interval = setInterval(() => {
      setNfcProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setNfcState('connecting_nfc');
          setNfcProgress(0);
          triggerNfcStage2();
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const bankOptions = [
    { id: 'kbank', name: isTh ? 'ธนาคารกสิกรไทย (KBank)' : 'KASIKORNBANK', color: 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' },
    { id: 'scb', name: isTh ? 'ธนาคารไทยพาณิชย์ (SCB)' : 'Siam Commercial Bank', color: 'bg-purple-700 text-white border-purple-800 hover:bg-purple-800' },
    { id: 'bbl', name: isTh ? 'ธนาคารกรุงเทพ (BBL)' : 'Bangkok Bank', color: 'bg-blue-900 text-white border-blue-950 hover:bg-blue-950' },
    { id: 'bay', name: isTh ? 'ธนาคารกรุงศรีอยุธยา (Krungsri)' : 'Krungsri Bank', color: 'bg-amber-500 text-gray-900 border-amber-600 hover:bg-amber-600' },
  ];

  const handleSendPushRequest = () => {
    if (!kycIdNumber || kycIdNumber.length !== 13) {
      toast({
        variant: 'destructive',
        title: isTh ? 'หมายเลขบัตรประชาชนไม่ถูกต้อง' : 'Invalid Citizen ID',
        description: isTh ? 'กรุณากรอกหมายเลขบัตรประชาชน 13 หลัก' : 'Please input a 13-digit identity number'
      });
      return;
    }
    if (!kycFullName.trim()) {
      toast({
        variant: 'destructive',
        title: isTh ? 'กรุณาระบุชื่อ-นามสกุลจริง' : 'Legal Name Required'
      });
      return;
    }

    setLocalPushLoading(true);
    setTimeout(() => {
      setLocalPushLoading(false);
      if (onSendNdidPush) onSendNdidPush(true);
      toast({
        title: isTh ? 'ส่งคำขอยืนยันตัวตนสำเร็จ!' : 'Notification Sent!',
        description: isTh ? 'ส่งความต้องการ NDID ไปยังแอปโมบายแบงก์กิ้งแล้ว' : 'NDID authorization request dispatched to bank app'
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 font-sans">
      {/* ── THAID FLOW ── */}
      {kycDocType === 'thaid' && (
        <div className="w-full">
          {thaidSubStage === 'qr' ? (
            <div className="flex flex-col items-center justify-center space-y-5 text-center p-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
                <Smartphone className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-black text-gray-900 text-base">{isTh ? 'ขั้นตอนที่ 1/2: สแกนผ่านแอป ThaID' : 'Step 1/2: Scan via ThaID App'}</h4>
                <p className="text-[11px] text-gray-500 font-bold max-w-sm">
                  {isTh 
                    ? 'กรุณาเปิดแอปพลิเคชัน ThaID บนโทรศัพท์มือถือเพื่อสแกน QR Code จากนั้นทำตามขั้นตอนถ่ายรูปบัตรประชาชนและสแกนใบหน้าถัดไป' 
                    : 'Open your ThaID app and scan the QR code, then proceed to the ID upload and face scan.'}
                </p>
              </div>

              {/* Glowing Mock DOPA QR Code Box */}
              <div className="relative p-5 bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:border-[#06c755] transition-colors flex flex-col items-center justify-center w-[180px] h-[180px] group">
                <QrCode className="w-36 h-36 text-gray-800 opacity-90 group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-x-0 h-0.5 bg-green-500 animate-laser-scan shadow-[0_0_8px_rgba(34,197,94,0.8)] pointer-events-none" />
                <div className="absolute top-2 left-2 bg-[#06c755]/10 text-[#06c755] text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded-md uppercase">ThaID Secure</div>
              </div>

              <div className="w-full flex gap-3 pt-4 border-t border-gray-100">
                <Button variant="ghost" onClick={onBack} className="font-bold text-gray-500 hover:bg-gray-100 rounded-xl h-12 flex-1">
                  {isTh ? 'ย้อนกลับ' : 'Back'}
                </Button>
                <Button 
                  onClick={() => setThaidSubStage('liveness')} 
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 flex-1 font-black shadow-md shadow-orange-200/50 hover:scale-105 transition-all"
                >
                  🚀 {isTh ? 'ถัดไป: อัปโหลดบัตรและสแกนหน้า →' : 'Next: Upload ID & Face Scan →'}
                </Button>
              </div>
            </div>
          ) : (
            // Liveness sub-stage for ThaID
            <div className="space-y-4 font-sans text-left">
              {nfcState === 'idle' && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-xs text-emerald-800 font-bold leading-relaxed">
                      {isTh 
                        ? 'เชื่อมต่อแอป ThaID สำเร็จแล้ว! กรุณายืนยันข้อมูลอัตลักษณ์เพิ่มเติม (ID Card + Liveness Check) ด้านล่าง' 
                        : 'ThaID connection authorized! Please complete ID Card & Liveness verification below.'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-black text-gray-700 text-xs">{isTh ? 'ชื่อ-นามสกุลจริง (ภาษาไทย)' : 'Full Name (Thai)'}</Label>
                    <Input 
                      placeholder="เช่น นายสมชาย ใจดี" 
                      value={kycFullName} 
                      onChange={(e) => onFullNameChange(e.target.value)} 
                      className="h-11 bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-black text-gray-700 text-xs">{isTh ? 'หมายเลขบัตรประชาชน 13 หลัก' : '13-Digit National ID Number'}</Label>
                    <Input 
                      placeholder="เช่น 1100901234567" 
                      value={kycIdNumber} 
                      onChange={(e) => onIdNumberChange(e.target.value)} 
                      className="h-11 bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs" 
                    />
                  </div>

                  {/* File Upload box */}
                  <div className="space-y-1.5">
                    <Label className="font-black text-gray-700 text-xs">{isTh ? 'รูปถ่ายบัตรประชาชนด้านหน้า' : 'Front of National ID Card Photo'}</Label>
                    <div
                      onClick={() => document.getElementById('thaid-id-card-file')?.click()}
                      className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px] p-3 ${
                        idCardPreview ? 'border-emerald-400 bg-emerald-500/5' : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50/5'
                      }`}
                    >
                      {idCardPreview ? (
                        <div className="relative w-full h-28">
                          <img src={idCardPreview} alt="ID card preview" className="w-full h-full object-cover rounded-xl opacity-85" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/35 rounded-xl">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-1.5 py-4">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                          <p className="text-xs font-bold text-gray-500">{isTh ? 'อัปโหลดรูปภาพหน้าบัตรประชาชน' : 'Upload front of ID card image'}</p>
                          <p className="text-[10px] text-gray-400">JPG / PNG</p>
                        </div>
                      )}
                    </div>
                    <input 
                      id="thaid-id-card-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIdCardFileSelect}
                    />
                    
                    {idCardUploading && (
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[10px] font-black text-slate-400">
                          <span>{isTh ? 'กำลังอัปโหลด...' : 'Uploading...'}</span>
                          <span>{idCardUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1">
                          <div className="bg-orange-500 h-1 rounded-full transition-all" style={{ width: `${idCardUploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 gap-3">
                    <Button variant="ghost" onClick={() => setThaidSubStage('qr')} className="font-bold text-gray-500 hover:bg-gray-100 rounded-xl h-11 flex-1">
                      {isTh ? 'ย้อนกลับ' : 'Back'}
                    </Button>
                    <Button 
                      onClick={handleStartIdVerify}
                      disabled={idCardUploading}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 flex-1 font-black shadow-md shadow-orange-200/50 flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 animate-pulse" />
                      {isTh ? 'เริ่มสแกนใบหน้า' : 'Start Face Scan'}
                    </Button>
                  </div>
                </div>
              )}

              {nfcState !== 'idle' && nfcState !== 'success' && (
                <div className="flex flex-col items-center justify-center space-y-6 text-center p-6 bg-slate-50/50 border border-slate-100 rounded-3xl w-full">
                  <div className="relative w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-inner mx-auto">
                    {nfcState === 'scanning_mrz' && <Scan className="w-10 h-10 text-orange-500 animate-pulse" />}
                    {nfcState === 'liveness' && <Camera className="w-10 h-10 text-orange-500 animate-bounce" />}
                  </div>

                  <div className="space-y-2 w-full max-w-xs mx-auto">
                    <h4 className="font-black text-slate-800 text-sm">
                      {nfcState === 'scanning_mrz' && (isTh ? 'ขั้นตอนที่ 1/2: ตรวจสอบข้อมูลบัตรประชาชน...' : 'Step 1/2: Verifying ID Card Info...')}
                      {nfcState === 'liveness' && (isTh ? 'ขั้นตอนที่ 2/2: ตรวจจับใบหน้าจริง (Liveness Scan)...' : 'Step 2/2: Liveness Face Check...')}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {nfcState === 'scanning_mrz' && (isTh ? 'กรุณารอตรวจสอบข้อมูลหน้าบัตรสักครู่' : 'Matching OCR details from card image.')}
                      {nfcState === 'liveness' && (isTh ? 'กรุณามองกล้องและกระพริบตาเพื่อเปรียบเทียบใบหน้า' : 'Look straight and blink to verify.')}
                    </p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3 shadow-inner">
                      <div className="bg-orange-500 h-full rounded-full transition-all duration-300 shadow" style={{ width: `${nfcProgress}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {nfcState === 'success' && (
                <div className="flex flex-col items-center justify-center space-y-5 text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-black text-gray-900 text-base">{isTh ? 'ยืนยันตัวตนสำเร็จ!' : 'Verification Success!'}</h4>
                    <p className="text-[11px] text-slate-500 font-bold max-w-sm leading-relaxed mx-auto">
                      {isTh 
                        ? ` ThaID และข้อมูลชีวมาตรใบหน้าของ ${kycFullName} ได้รับการจับคู่ถูกต้อง 98.8% ตรงกัน`
                        : `ThaID and biometric face profile for ${kycFullName} successfully matched at 98.8% match.`}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 w-full text-left space-y-1 font-mono text-[10px] text-slate-500">
                    <p>• DOPA OCR AUTH: VERIFIED (ThaID)</p>
                    <p>• LIVENESS SCORE: 98.8% MATCH</p>
                    <p>• STATUS: VERIFIED</p>
                  </div>

                  <div className="w-full flex gap-3 pt-6 border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      onClick={() => setNfcState('idle')} 
                      className="font-bold text-gray-500 hover:bg-gray-100 rounded-xl h-12 flex-1"
                    >
                      {isTh ? 'ทำรายการใหม่' : 'Reset'}
                    </Button>
                    <Button 
                      onClick={onSubmit}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 flex-1 font-black shadow-md shadow-green-100 hover:scale-105 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {isTh ? 'ยื่นข้อมูลยืนยันตัวตน' : 'Submit e-KYC'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── NDID FLOW ── */}
      {kycDocType === 'ndid' && (
        <div className="space-y-4">
          {ndidSubStage !== 'liveness' ? (
            <div className="space-y-4">
              {!ndidPushSent ? (
                // Form & Bank selection
                <div className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <Label className="font-black text-gray-700 text-xs">{isTh ? 'ชื่อ-นามสกุลจริงตามบัตรประชาชน' : 'Legal Full Name'}</Label>
                    <Input 
                      placeholder={isTh ? 'เช่น สมเกียรติ มั่นคง' : 'John Doe'} 
                      value={kycFullName} 
                      onChange={(e) => onFullNameChange(e.target.value)} 
                      className="h-11 bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs" 
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label className="font-black text-gray-700 text-xs">{isTh ? 'หมายเลขบัตรประจำตัวประชาชน 13 หลัก' : '13-digit Thai Citizen ID'}</Label>
                    <Input 
                      placeholder="x-xxxx-xxxxx-xx-x" 
                      maxLength={13}
                      value={kycIdNumber} 
                      onChange={(e) => onIdNumberChange(e.target.value)} 
                      className="h-11 bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs" 
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="font-black text-gray-700 text-xs">{isTh ? 'เลือกธนาคารที่จะใช้ยืนยันตัวตน (IdP)' : 'Select Banking App (NDID Provider)'}</Label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {bankOptions.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => onSelectBank && onSelectBank(bank.id)}
                          className={`p-3 border rounded-xl flex items-center justify-between font-bold text-left transition-all ${
                            selectedBank === bank.id 
                              ? 'border-orange-500 bg-orange-50/20 ring-1 ring-orange-500' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                          }`}
                        >
                          <span className="text-[10px] text-gray-800 leading-tight">{bank.name}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selectedBank === bank.id ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                          }`}>
                            {selectedBank === bank.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 gap-3">
                    <Button variant="ghost" onClick={onBack} className="font-bold text-gray-500 hover:bg-gray-100 rounded-xl h-11 flex-1">
                      {isTh ? 'ย้อนกลับ' : 'Back'}
                    </Button>
                    <Button 
                      onClick={handleSendPushRequest}
                      disabled={localPushLoading}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 flex-1 font-black shadow-md shadow-orange-200/50 flex items-center justify-center gap-1.5"
                    >
                      {localPushLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {isTh ? 'ส่งคำขอยืนยันตัวตน' : 'Send NDID Request'} <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // Push Notification Waiting screen
                <div className="flex flex-col items-center justify-center space-y-5 text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100 relative shadow-inner">
                    <Building className="w-8 h-8 animate-pulse" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white text-[10px] font-black">15m</div>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-black text-gray-900 text-base">{isTh ? 'คำขอกำลังรอการอนุมัติบนแอปธนาคาร' : 'Pending Authorization on Bank App'}</h4>
                    <p className="text-[11px] text-gray-500 font-bold max-w-sm">
                      {isTh 
                        ? `ระบบส่งแจ้งเตือนการยืนยันตัวตนความปลอดภัยระดับชาติ (NDID) ไปยังแอปพลิเคชัน ${bankOptions.find(b => b.id === selectedBank)?.name} บนโทรศัพท์ของท่านแล้ว กรุณาเปิดแอปเพื่อกดยืนยันใบหน้า`
                        : `We sent an NDID request to your banking app. Open the app to confirm your digital identity and face scan.`}
                    </p>
                  </div>

                  <div className="w-full flex gap-3 pt-6 border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      onClick={() => onSendNdidPush && onSendNdidPush(false)} 
                      className="font-bold text-gray-500 hover:bg-gray-100 rounded-xl h-12 flex-1"
                    >
                      {isTh ? 'ย้อนกลับ' : 'Back'}
                    </Button>
                    <Button 
                      onClick={() => setNdidSubStage('liveness')}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 flex-1 font-black shadow-md shadow-green-100 hover:scale-105 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {isTh ? 'ถัดไป: อัปโหลดบัตรและสแกนหน้า →' : 'Next: Upload ID & Face Scan →'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // NDID Liveness sub-stage
            <div className="space-y-4 font-sans text-left">
              {nfcState === 'idle' && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-xs text-emerald-800 font-bold leading-relaxed">
                      {isTh 
                        ? 'ได้รับการอนุมัติคำขอ NDID จากธนาคารแล้ว! กรุณายืนยันเอกสารและข้อมูลใบหน้าเพิ่มเติมเพื่อเสร็จสิ้นขั้นตอน' 
                        : 'NDID app request approved! Please confirm ID Card & Liveness verification below.'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-black text-gray-700 text-xs">{isTh ? 'ชื่อ-นามสกุลจริง (ภาษาไทย)' : 'Full Name (Thai)'}</Label>
                    <Input 
                      placeholder="เช่น นายสมชาย ใจดี" 
                      value={kycFullName} 
                      onChange={(e) => onFullNameChange(e.target.value)} 
                      className="h-11 bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-black text-gray-700 text-xs">{isTh ? 'หมายเลขบัตรประชาชน 13 หลัก' : '13-Digit National ID Number'}</Label>
                    <Input 
                      placeholder="เช่น 1100901234567" 
                      value={kycIdNumber} 
                      onChange={(e) => onIdNumberChange(e.target.value)} 
                      className="h-11 bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs" 
                    />
                  </div>

                  {/* File Upload box */}
                  <div className="space-y-1.5">
                    <Label className="font-black text-gray-700 text-xs">{isTh ? 'รูปถ่ายบัตรประชาชนด้านหน้า' : 'Front of National ID Card Photo'}</Label>
                    <div
                      onClick={() => document.getElementById('ndid-id-card-file')?.click()}
                      className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px] p-3 ${
                        idCardPreview ? 'border-emerald-400 bg-emerald-500/5' : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50/5'
                      }`}
                    >
                      {idCardPreview ? (
                        <div className="relative w-full h-28">
                          <img src={idCardPreview} alt="ID card preview" className="w-full h-full object-cover rounded-xl opacity-85" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/35 rounded-xl">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-1.5 py-4">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                          <p className="text-xs font-bold text-gray-500">{isTh ? 'อัปโหลดรูปภาพหน้าบัตรประชาชน' : 'Upload front of ID card image'}</p>
                          <p className="text-[10px] text-gray-400">JPG / PNG</p>
                        </div>
                      )}
                    </div>
                    <input 
                      id="ndid-id-card-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIdCardFileSelect}
                    />
                    
                    {idCardUploading && (
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[10px] font-black text-slate-400">
                          <span>{isTh ? 'กำลังอัปโหลด...' : 'Uploading...'}</span>
                          <span>{idCardUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1">
                          <div className="bg-orange-500 h-1 rounded-full transition-all" style={{ width: `${idCardUploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 gap-3">
                    <Button variant="ghost" onClick={() => setNdidSubStage('waiting')} className="font-bold text-gray-500 hover:bg-gray-100 rounded-xl h-11 flex-1">
                      {isTh ? 'ย้อนกลับ' : 'Back'}
                    </Button>
                    <Button 
                      onClick={handleStartIdVerify}
                      disabled={idCardUploading}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 flex-1 font-black shadow-md shadow-orange-200/50 flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 animate-pulse" />
                      {isTh ? 'เริ่มสแกนใบหน้า' : 'Start Face Scan'}
                    </Button>
                  </div>
                </div>
              )}

              {nfcState !== 'idle' && nfcState !== 'success' && (
                <div className="flex flex-col items-center justify-center space-y-6 text-center p-6 bg-slate-50/50 border border-slate-100 rounded-3xl w-full">
                  <div className="relative w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-inner mx-auto">
                    {nfcState === 'scanning_mrz' && <Scan className="w-10 h-10 text-orange-500 animate-pulse" />}
                    {nfcState === 'liveness' && <Camera className="w-10 h-10 text-orange-500 animate-bounce" />}
                  </div>

                  <div className="space-y-2 w-full max-w-xs mx-auto">
                    <h4 className="font-black text-slate-800 text-sm">
                      {nfcState === 'scanning_mrz' && (isTh ? 'ขั้นตอนที่ 1/2: ตรวจสอบข้อมูลบัตรประชาชน...' : 'Step 1/2: Verifying ID Card Info...')}
                      {nfcState === 'liveness' && (isTh ? 'ขั้นตอนที่ 2/2: ตรวจจับใบหน้าจริง (Liveness Scan)...' : 'Step 2/2: Liveness Face Check...')}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {nfcState === 'scanning_mrz' && (isTh ? 'กรุณารอตรวจสอบข้อมูลหน้าบัตรสักครู่' : 'Matching OCR details from card image.')}
                      {nfcState === 'liveness' && (isTh ? 'กรุณามองกล้องและกระพริบตาเพื่อเปรียบเทียบใบหน้า' : 'Look straight and blink to verify.')}
                    </p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3 shadow-inner">
                      <div className="bg-orange-500 h-full rounded-full transition-all duration-300 shadow" style={{ width: `${nfcProgress}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {nfcState === 'success' && (
                <div className="flex flex-col items-center justify-center space-y-5 text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-black text-gray-900 text-base">{isTh ? 'ยืนยันตัวตนสำเร็จ!' : 'Verification Success!'}</h4>
                    <p className="text-[11px] text-slate-500 font-bold max-w-sm leading-relaxed mx-auto">
                      {isTh 
                        ? ` ยืนยันผ่านธนาคาร NDID และตรวจสอบใบหน้าของ ${kycFullName} เรียบร้อยแล้ว`
                        : `NDID profile and face biometric verify for ${kycFullName} passed successfully.`}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 w-full text-left space-y-1 font-mono text-[10px] text-slate-500">
                    <p>• NDID STATUS: VERIFIED</p>
                    <p>• BIOMETRIC MATCH SCORE: 98.8%</p>
                    <p>• STATUS: SUCCESS</p>
                  </div>

                  <div className="w-full flex gap-3 pt-6 border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      onClick={() => setNfcState('idle')} 
                      className="font-bold text-gray-500 hover:bg-gray-100 rounded-xl h-12 flex-1"
                    >
                      {isTh ? 'ทำรายการใหม่' : 'Reset'}
                    </Button>
                    <Button 
                      onClick={onSubmit}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 flex-1 font-black shadow-md shadow-green-100 hover:scale-105 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {isTh ? 'ยื่นข้อมูลยืนยันตัวตน' : 'Submit e-KYC'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── PASSPORT FLOW ── */}
      {kycDocType === 'passport' && (
        <div className="space-y-4 font-sans">
          {nfcState === 'idle' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-black text-gray-700 text-xs">{isTh ? 'ชื่อ-นามสกุลจริงภาษาอังกฤษ (ตามหนังสือเดินทาง)' : 'English Full Name (As in Passport)'}</Label>
                <Input 
                  placeholder="e.g. JOHNATHAN SMITH" 
                  value={kycFullName} 
                  onChange={(e) => onFullNameChange(e.target.value)} 
                  className="h-11 bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs uppercase" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-black text-gray-700 text-xs">{isTh ? 'หมายเลขหนังสือเดินทาง (Passport Number)' : 'Passport Number'}</Label>
                <Input 
                  placeholder="e.g. AA123456" 
                  value={passportNo} 
                  onChange={(e) => setPassportNo(e.target.value)} 
                  className="h-11 bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs uppercase" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-black text-gray-700 text-xs">{isTh ? 'วันเกิด (Date of Birth)' : 'Date of Birth'}</Label>
                  <Input 
                    type="date"
                    value={dob} 
                    onChange={(e) => setDob(e.target.value)} 
                    className="h-11 bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-black text-gray-700 text-xs">{isTh ? 'วันหมดอายุ (Expiry Date)' : 'Expiry Date'}</Label>
                  <Input 
                    type="date"
                    value={expiryDate} 
                    onChange={(e) => setExpiryDate(e.target.value)} 
                    className="h-11 bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-black text-gray-700 text-xs">{isTh ? 'สัญชาติ (Nationality)' : 'Nationality'}</Label>
                <select 
                  value={nationality} 
                  onChange={(e) => setNationality(e.target.value)} 
                  className="h-11 w-full bg-gray-50 border border-gray-200 font-bold rounded-xl text-xs px-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="United States">United States (US)</option>
                  <option value="United Kingdom">United Kingdom (GB)</option>
                  <option value="Japan">Japan (JP)</option>
                  <option value="Singapore">Singapore (SG)</option>
                  <option value="China">China (CN)</option>
                  <option value="Germany">Germany (DE)</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 gap-3">
                <Button variant="ghost" onClick={onBack} className="font-bold text-gray-500 hover:bg-gray-100 rounded-xl h-11 flex-1">
                  {isTh ? 'ย้อนกลับ' : 'Back'}
                </Button>
                <Button 
                  onClick={handleStartNfcScan}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 flex-1 font-black shadow-md shadow-orange-200/50 flex items-center justify-center gap-1.5"
                >
                  <Rss className="w-4 h-4 animate-pulse" />
                  {isTh ? 'เริ่มสแกนชิป NFC' : 'Start NFC Scan'}
                </Button>
              </div>
            </div>
          )}

          {nfcState !== 'idle' && nfcState !== 'success' && (
            <div className="flex flex-col items-center justify-center space-y-6 text-center p-6 bg-slate-50/50 border border-slate-100 rounded-3xl">
              <div className="relative w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-inner">
                {nfcState === 'scanning_mrz' && <Scan className="w-10 h-10 text-orange-500 animate-pulse" />}
                {nfcState === 'connecting_nfc' && <Rss className="w-10 h-10 text-orange-600 animate-spin" />}
                {nfcState === 'liveness' && <Fingerprint className="w-10 h-10 text-orange-500 animate-bounce" />}
              </div>

              <div className="space-y-2 w-full max-w-xs">
                <h4 className="font-black text-slate-800 text-sm">
                  {nfcState === 'scanning_mrz' && (isTh ? 'ขั้นตอนที่ 1/3: สแกน MRZ ด้วยกล้อง...' : 'Step 1/3: Scanning MRZ via Camera...')}
                  {nfcState === 'connecting_nfc' && (isTh ? 'ขั้นตอนที่ 2/3: เชื่อมต่อชิป NFC ของพาสปอร์ต...' : 'Step 2/3: Reading Passport NFC Chip...')}
                  {nfcState === 'liveness' && (isTh ? 'ขั้นตอนที่ 3/3: เปรียบเทียบภาพชีวมาตรใบหน้า...' : 'Step 3/3: Checking Face Liveness...')}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold">
                  {nfcState === 'scanning_mrz' && (isTh ? 'กรุณาวางพาสปอร์ตให้อยู่ในกรอบสแกน' : 'Please keep your passport within the camera frame.')}
                  {nfcState === 'connecting_nfc' && (isTh ? 'กรุณาแตะพาสปอร์ตไว้ที่ด้านหลังโทรศัพท์มือถือ' : 'Place passport flat against the back of your mobile device.')}
                  {nfcState === 'liveness' && (isTh ? 'กรุณามองตรงไปที่กล้องเซลฟี่เพื่อจับคู่ใบหน้า' : 'Please look straight into the camera to match portrait.')}
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3 shadow-inner">
                  <div className="bg-orange-500 h-full rounded-full transition-all duration-300 shadow" style={{ width: `${nfcProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {nfcState === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-5 text-center p-4">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-black text-gray-900 text-base">{isTh ? 'ยืนยันตัวตนหนังสือเดินทางผ่าน NFC สำเร็จ!' : 'NFC Verification Success!'}</h4>
                <p className="text-[11px] text-slate-500 font-bold max-w-sm leading-relaxed">
                  {isTh 
                    ? `พาสปอร์ตหมายเลข ${passportNo.toUpperCase()} ของประเทศ ${nationality} ได้รับการเข้ารหัสความปลอดภัยและการจับคู่ใบหน้า 99.2% ถูกต้องตรงกัน`
                    : `Passport ${passportNo.toUpperCase()} issued by ${nationality} verified. Digital credentials and selfie matching completed successfully.`}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 w-full text-left space-y-1 font-mono text-[10px] text-slate-500">
                <p>• ICAO 9303 SIGNATURE: VERIFIED</p>
                <p>• CHIP CRYPTOGRAPHY: PASS (Active Auth)</p>
                <p>• LIVENESS ASSESSMENT: 99.2% FACE MATCH</p>
              </div>

              <div className="w-full flex gap-3 pt-6 border-t border-gray-100">
                <Button 
                  variant="ghost" 
                  onClick={() => setNfcState('idle')} 
                  className="font-bold text-gray-500 hover:bg-gray-100 rounded-xl h-12 flex-1"
                >
                  {isTh ? 'ทำรายการใหม่' : 'Reset'}
                </Button>
                <Button 
                  onClick={onSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 flex-1 font-black shadow-md shadow-green-100 hover:scale-105 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> {isTh ? 'ยื่นข้อมูลยืนยันตัวตน' : 'Submit e-KYC'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simple fallback helper component since lucide icon prop naming differs
function Smartphone(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
      <path d="M12 18h.01"/>
    </svg>
  );
}
