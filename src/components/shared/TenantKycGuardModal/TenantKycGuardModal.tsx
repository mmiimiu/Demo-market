'use client';

/**
 * TenantKycGuardModal
 *
 * ป๊อปอัพ KYC ที่แสดงขึ้นมา **เฉพาะตอนผู้เช่ากดทำธุรกรรมจริง**
 * (เช่น จองห้อง / แชทกับเจ้าของ / นัดดูห้อง / เซ็นสัญญา)
 *
 * ✅ ดูห้องเฉยๆ ไม่ต้องยืนยัน
 * 🔒 จะทำธุรกรรม ต้องอัปโหลดบัตร + สแกนหน้าก่อน
 *
 * Dev notes:
 * - ใช้ sessionStorage → รีเฟรชหน้าแล้วรีเซ็ตเป็น unverified ทุกครั้ง (ทดสอบซ้ำได้ไม่จำกัด)
 * - มีปุ่ม [DEV] skip ใน development mode
 * - เมื่อยืนยันแล้ว onVerified() จะถูกเรียก → ระบบดำเนินการต่อ (จอง/แชท/ฯลฯ)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Camera, CreditCard,
  Upload, CheckCircle2, Loader2, X, Zap, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Language } from '@/lib/types';

const SESSION_KEY = 'primerent_session_kyc';

type KycStep = 'intro' | 'id_upload' | 'liveness' | 'processing' | 'done';

interface TenantKycGuardModalProps {
  isOpen: boolean;
  lang: Language;
  /** Called after the user completes (or dev-skips) verification */
  onVerified: () => void;
  /** Called when user dismisses the modal without verifying */
  onClose: () => void;
  /** Label shown in the intro, e.g. "จองห้อง" or "ส่งข้อความ" */
  actionLabel?: string;
}

/** Check current session KYC status */
export function isSessionKycPassed(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_KEY) === 'passed';
}

/** Mark session as KYC passed */
export function markSessionKycPassed(): void {
  if (typeof window !== 'undefined') sessionStorage.setItem(SESSION_KEY, 'passed');
}

// ── Live camera hook ────────────────────────────────────────────────────────
function useLiveCamera(active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camError, setCamError] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!active) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      return;
    }
    setCamError(false);
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => {
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setCamError(true));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [active]);

  return { videoRef, camError };
}

// ── Main component ──────────────────────────────────────────────────────────
export function TenantKycGuardModal({
  isOpen, lang, onVerified, onClose, actionLabel
}: TenantKycGuardModalProps) {
  const isTh = lang === 'th';

  const [step, setStep] = useState<KycStep>('intro');
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [idUploading, setIdUploading] = useState(false);
  const [idProgress, setIdProgress] = useState(0);
  const [camActive, setCamActive] = useState(false);
  const [livenessCapturing, setLivenessCapturing] = useState(false);
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [livenessScore, setLivenessScore] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { videoRef, camError } = useLiveCamera(camActive);

  // Reset internal state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setIdFileName(null);
      setIdPreview(null);
      setIdProgress(0);
      setLivenessProgress(0);
      setLivenessScore(0);
      setCamActive(false);
      setLivenessCapturing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFileName(file.name);
    setIdUploading(true);
    setIdProgress(0);
    const reader = new FileReader();
    reader.onload = ev => setIdPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    const iv = setInterval(() => {
      setIdProgress(prev => {
        if (prev >= 100) { clearInterval(iv); setIdUploading(false); return 100; }
        return prev + 20;
      });
    }, 180);
  };

  const handleIdNext = () => {
    if (!idFileName) {
      toast({ variant: 'destructive', title: isTh ? 'กรุณาอัปโหลดบัตรประชาชน' : 'Please upload your ID card' });
      return;
    }
    setCamActive(true);
    setStep('liveness');
  };

  const handleStartLiveness = () => {
    setLivenessCapturing(true);
    setLivenessProgress(0);
    const score = Math.floor(Math.random() * 10) + 88;
    let prog = 0;
    const iv = setInterval(() => {
      prog += 8;
      setLivenessProgress(Math.min(prog, 100));
      if (prog >= 100) {
        clearInterval(iv);
        setLivenessScore(score);
        setLivenessCapturing(false);
        setCamActive(false);
        setStep('processing');
        setTimeout(() => setStep('done'), 1600);
      }
    }, 200);
  };

  const handleComplete = () => {
    markSessionKycPassed();
    toast({
      title: isTh ? '🎉 ยืนยันตัวตนสำเร็จ!' : '🎉 Identity Verified!',
      description: isTh
        ? 'บัตรประชาชนและสแกนใบหน้าผ่านแล้ว — ดำเนินการต่อได้เลย'
        : 'ID card and liveness scan verified — proceeding now.',
    });
    onVerified();
  };

  const handleDevSkip = () => {
    markSessionKycPassed();
    toast({ title: isTh ? '[DEV] ข้ามการยืนยัน KYC' : '[DEV] KYC bypassed' });
    onVerified();
  };

  const handleClose = () => {
    setCamActive(false);
    onClose();
  };

  // ── Step labels for progress indicator ───────────────────────────────────
  const steps: KycStep[] = ['intro', 'id_upload', 'liveness', 'done'];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* DEV toolbar */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex justify-end mb-2 gap-2">
            <button
              onClick={handleDevSkip}
              id="kyc-guard-dev-skip"
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg border border-emerald-600 transition-all shadow"
            >
              <Zap className="w-3 h-3" />
              {isTh ? 'DEV: ข้าม KYC' : 'DEV: Skip KYC'}
            </button>
          </div>
        )}

        {/* Card */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              {step === 'done' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-orange-400" />
              )}
              <span className="font-black text-white text-sm">
                {step === 'done'
                  ? (isTh ? 'ยืนยันตัวตนสำเร็จ' : 'Verified')
                  : (isTh ? 'ยืนยันตัวตนก่อนดำเนินการ' : 'Verify Identity to Proceed')}
              </span>
            </div>
            <button
              onClick={handleClose}
              id="kyc-guard-close-btn"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step progress dots */}
          <div className="flex items-center gap-1.5 px-6 py-3">
            {steps.map((s, i) => (
              <div key={s} className={cn(
                'h-1 rounded-full transition-all duration-300',
                step === s ? 'bg-orange-400 flex-1' :
                steps.indexOf(step) > i ? 'bg-emerald-500 flex-1' : 'bg-white/10 w-6'
              )} />
            ))}
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-5">
            {/* ── INTRO ── */}
            {step === 'intro' && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-400/20 rounded-2xl p-4">
                  <p className="text-xs text-amber-300 font-bold leading-relaxed">
                    {isTh
                      ? `🔒 การ${actionLabel || 'ดำเนินการ'}นี้ต้องยืนยันตัวตนก่อน เพื่อป้องกันการผิดนัดชำระและปกป้องทุกฝ่ายในแพลตฟอร์ม`
                      : `🔒 ${actionLabel || 'This action'} requires identity verification to prevent defaults and protect all parties.`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: CreditCard, label: isTh ? 'บัตรประชาชน' : 'ID Card', desc: isTh ? 'ด้านหน้าบัตร' : 'Front of national ID' },
                    { icon: Camera, label: isTh ? 'สแกนใบหน้า' : 'Liveness', desc: isTh ? 'ตรวจจับใบหน้าจริง' : 'Real-time face check' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
                      <Icon className="w-5 h-5 text-orange-400" />
                      <p className="text-xs font-black text-white">{label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setStep('id_upload')}
                  id="kyc-guard-start-btn"
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl text-sm shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {isTh ? 'เริ่มยืนยันตัวตน →' : 'Start Verification →'}
                </Button>
                <button
                  onClick={handleClose}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-300 font-bold transition-colors"
                >
                  {isTh ? 'ยกเลิก — กลับไปดูห้องก่อน' : 'Cancel — continue browsing'}
                </button>
              </div>
            )}

            {/* ── ID UPLOAD ── */}
            {step === 'id_upload' && (
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-300">
                  {isTh ? 'ขั้นตอน 1/2 — อัปโหลดรูปบัตรประชาชน' : 'Step 1/2 — Upload ID Card photo'}
                </p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-2xl cursor-pointer transition-all min-h-[130px] flex flex-col items-center justify-center',
                    idPreview ? 'border-emerald-400/50 bg-emerald-500/5' : 'border-white/20 hover:border-orange-400/50 hover:bg-orange-500/5'
                  )}
                >
                  {idPreview ? (
                    <div className="relative w-full">
                      <img src={idPreview} alt="ID" className="w-full h-32 object-cover rounded-xl opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-400">
                        {isTh ? 'คลิกเพื่อเลือกรูปบัตรประชาชน' : 'Click to upload ID card image'}
                      </p>
                      <p className="text-[10px] text-slate-500">JPG / PNG</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                  id="kyc-guard-id-input"
                />
                {idUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>{isTh ? 'กำลังอัปโหลด...' : 'Uploading...'}</span>
                      <span>{idProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div className="bg-orange-500 h-1 rounded-full transition-all" style={{ width: `${idProgress}%` }} />
                    </div>
                  </div>
                )}
                {idFileName && !idUploading && (
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />{idFileName}
                  </p>
                )}
                <Button
                  onClick={handleIdNext}
                  disabled={!idFileName || idUploading}
                  id="kyc-guard-id-next-btn"
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black rounded-2xl text-sm transition-all active:scale-95"
                >
                  {isTh ? 'ถัดไป: สแกนใบหน้า →' : 'Next: Face Scan →'}
                </Button>
              </div>
            )}

            {/* ── LIVENESS ── */}
            {step === 'liveness' && (
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-300">
                  {isTh ? 'ขั้นตอน 2/2 — สแกนใบหน้า (Liveness Check)' : 'Step 2/2 — Liveness Scan'}
                </p>
                <div className="relative w-full h-44 bg-slate-800 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                  {camError ? (
                    <div className="text-center space-y-2 p-4">
                      <div className="w-20 h-20 border-4 border-orange-400/40 rounded-full mx-auto flex items-center justify-center animate-pulse">
                        <Eye className="w-9 h-9 text-orange-400/50" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {isTh ? 'กำลังใช้ Face Simulator' : 'Using Face Simulator'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className={cn(
                          'w-28 h-36 border-4 rounded-full transition-colors',
                          livenessCapturing ? 'border-orange-400 shadow-lg shadow-orange-500/30' : 'border-white/30'
                        )} />
                      </div>
                    </>
                  )}
                  {livenessCapturing && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 rounded-full px-3 py-1">
                      <Loader2 className="w-3 h-3 text-orange-400 animate-spin" />
                      <span className="text-[10px] font-black text-orange-300">{livenessProgress}%</span>
                    </div>
                  )}
                </div>
                {livenessCapturing && (
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <div className="bg-orange-500 h-1 rounded-full transition-all duration-200" style={{ width: `${livenessProgress}%` }} />
                  </div>
                )}
                <Button
                  onClick={handleStartLiveness}
                  disabled={livenessCapturing}
                  id="kyc-guard-liveness-btn"
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black rounded-2xl text-sm transition-all active:scale-95"
                >
                  {livenessCapturing
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{isTh ? 'กำลังสแกน...' : 'Scanning...'}</>
                    : <>{isTh ? '📸 เริ่มสแกนใบหน้า' : '📸 Start Face Scan'}</>}
                </Button>
              </div>
            )}

            {/* ── PROCESSING ── */}
            {step === 'processing' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                  <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
                </div>
                <div>
                  <p className="font-black text-white">{isTh ? 'กำลังตรวจสอบข้อมูล...' : 'Verifying...'}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    {isTh ? 'วิเคราะห์บัตรและเปรียบเทียบใบหน้า' : 'Matching ID against liveness capture'}
                  </p>
                </div>
              </div>
            )}

            {/* ── DONE ── */}
            {step === 'done' && (
              <div className="space-y-4">
                <div className="py-2 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/30 rounded-3xl flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="font-black text-white">{isTh ? 'ยืนยันตัวตนสำเร็จ!' : 'Identity Verified!'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-emerald-400">{livenessScore}%</p>
                    <p className="text-[10px] text-slate-400 font-black">{isTh ? 'Liveness Score' : 'Liveness Score'}</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <p className="text-[10px] text-slate-400 font-black">{isTh ? 'บัตรผ่านแล้ว' : 'ID Passed'}</p>
                  </div>
                </div>
                <Button
                  onClick={handleComplete}
                  id="kyc-guard-complete-btn"
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {isTh ? `✓ ดำเนินการ${actionLabel ? ` "${actionLabel}"` : ''} ต่อ` : `✓ Proceed${actionLabel ? ` with "${actionLabel}"` : ''}`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
