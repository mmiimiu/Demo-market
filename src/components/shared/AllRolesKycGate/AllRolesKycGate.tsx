'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, ShieldAlert, Camera, CreditCard, Upload,
  CheckCircle2, Loader2, RefreshCcw, Zap, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Language } from '@/lib/types';

interface AllRolesKycGateProps {
  lang: Language;
  children: React.ReactNode;
  /** Override: skip gate (e.g. for admin role) */
  bypass?: boolean;
}

type KycStep = 'intro' | 'id_upload' | 'liveness' | 'processing' | 'done';

const SESSION_KEY = 'primerent_session_kyc'; // sessionStorage: resets on refresh

function useLiveCamera(active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camError, setCamError] = useState(false);

  useEffect(() => {
    if (!active) {
      stream?.getTracks().forEach(t => t.stop());
      setStream(null);
      return;
    }
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setCamError(true));

    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return { videoRef, camError };
}

export function AllRolesKycGate({ lang, children, bypass = false }: AllRolesKycGateProps) {
  const isTh = lang === 'th';

  // ── sessionStorage: resets every page refresh ──────────────────────────────
  const [kycPassed, setKycPassed] = useState(false);
  const [step, setStep] = useState<KycStep>('intro');

  // ID card upload state
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [idUploading, setIdUploading] = useState(false);
  const [idProgress, setIdProgress] = useState(0);

  // Liveness state
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [livenessCapturing, setLivenessCapturing] = useState(false);
  const [livenessScore, setLivenessScore] = useState(0);
  const [camActive, setCamActive] = useState(false);
  const { videoRef, camError } = useLiveCamera(camActive);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // On mount: read sessionStorage (resets on page refresh automatically)
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'passed') setKycPassed(true);
  }, []);

  if (bypass || kycPassed) return <>{children}</>;

  // ── Handlers ────────────────────────────────────────────────────────────────

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
    const score = Math.floor(Math.random() * 10) + 88; // 88-97
    let prog = 0;
    const iv = setInterval(() => {
      prog += 7;
      setLivenessProgress(Math.min(prog, 100));
      if (prog >= 100) {
        clearInterval(iv);
        setLivenessScore(score);
        setLivenessCapturing(false);
        setCamActive(false);
        setStep('processing');
        setTimeout(() => {
          setStep('done');
        }, 1800);
      }
    }, 200);
  };

  const handleComplete = () => {
    sessionStorage.setItem(SESSION_KEY, 'passed');
    setKycPassed(true);
    toast({
      title: isTh ? '🎉 ยืนยันตัวตนสำเร็จ!' : '🎉 Identity Verified!',
      description: isTh
        ? 'ระบบได้ยืนยันบัตรประชาชนและสแกนใบหน้าของคุณเรียบร้อยแล้ว'
        : 'Your ID card and liveness scan have been verified successfully.',
    });
  };

  /** Dev fast-pass: skip the full flow */
  const handleDevSkip = () => {
    sessionStorage.setItem(SESSION_KEY, 'passed');
    setKycPassed(true);
    toast({ title: isTh ? '[DEV] ข้ามการยืนยัน KYC' : '[DEV] KYC bypassed' });
  };

  /** Dev reset: force unverified again (same as page refresh) */
  const handleDevReset = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setStep('intro');
    setIdFileName(null);
    setIdPreview(null);
    setIdProgress(0);
    setLivenessProgress(0);
    setLivenessScore(0);
    setCamActive(false);
    toast({ title: isTh ? '[DEV] รีเซ็ต KYC แล้ว' : '[DEV] KYC reset' });
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Dev toolbar (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={handleDevReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-black rounded-lg border border-slate-600 transition-all"
          >
            <RefreshCcw className="w-3 h-3" />
            {isTh ? 'DEV: รีเซ็ต' : 'DEV: Reset'}
          </button>
          <button
            onClick={handleDevSkip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg border border-emerald-600 transition-all"
          >
            <Zap className="w-3 h-3" />
            {isTh ? 'DEV: ข้าม KYC' : 'DEV: Skip KYC'}
          </button>
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        {/* ── STEP: INTRO ── */}
        {step === 'intro' && <IntroStep isTh={isTh} onStart={() => setStep('id_upload')} />}

        {/* ── STEP: ID CARD UPLOAD ── */}
        {step === 'id_upload' && (
          <IdUploadStep
            isTh={isTh}
            idFileName={idFileName}
            idPreview={idPreview}
            idUploading={idUploading}
            idProgress={idProgress}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            onNext={handleIdNext}
          />
        )}

        {/* ── STEP: LIVENESS SCAN ── */}
        {step === 'liveness' && (
          <LivenessStep
            isTh={isTh}
            videoRef={videoRef}
            camError={camError}
            livenessCapturing={livenessCapturing}
            livenessProgress={livenessProgress}
            onStart={handleStartLiveness}
          />
        )}

        {/* ── STEP: PROCESSING ── */}
        {step === 'processing' && <ProcessingStep isTh={isTh} />}

        {/* ── STEP: DONE ── */}
        {step === 'done' && (
          <DoneStep isTh={isTh} score={livenessScore} onComplete={handleComplete} />
        )}
      </div>

      {/* Step indicator dots */}
      <div className="mt-8 flex gap-2 relative z-10">
        {(['intro', 'id_upload', 'liveness', 'done'] as const).map((s, i) => (
          <div
            key={s}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              step === s ? 'bg-orange-400 w-4' :
              (['intro', 'id_upload', 'liveness', 'done'].indexOf(step) > i)
                ? 'bg-emerald-400' : 'bg-slate-600'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function IntroStep({ isTh, onStart }: { isTh: boolean; onStart: () => void }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white space-y-6">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-orange-500/20 border border-orange-400/30 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
          <ShieldAlert className="w-10 h-10 text-orange-400" />
        </div>
        <h2 className="text-2xl font-black">
          {isTh ? 'ยืนยันตัวตนก่อนใช้งาน' : 'Identity Verification Required'}
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          {isTh
            ? 'เพื่อความปลอดภัยของทุกฝ่าย ทุกบทบาทต้องยืนยันตัวตนด้วยบัตรประชาชนและการสแกนใบหน้า (Liveness Check) ก่อนเข้าใช้งานแพลตฟอร์ม'
            : 'For the safety of all parties, every user must verify their identity with an ID card and a liveness scan before accessing the platform.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: CreditCard, label: isTh ? 'ถ่ายบัตรประชาชน' : 'ID Card Upload', desc: isTh ? 'หน้าตรงและด้านหน้าบัตร' : 'Front of your national ID' },
          { icon: Camera, label: isTh ? 'สแกนใบหน้า' : 'Liveness Scan', desc: isTh ? 'ระบบตรวจจับใบหน้าจริง' : 'Real-time face detection' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5">
            <Icon className="w-6 h-6 text-orange-400" />
            <p className="text-xs font-black">{label}</p>
            <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-400/20 rounded-2xl p-4">
        <p className="text-xs text-amber-300 font-bold leading-relaxed">
          {isTh
            ? '🔒 ข้อมูลของคุณถูกเข้ารหัส AES-256 และไม่ถูกส่งต่อให้บุคคลที่สาม เราใช้เพื่อป้องกันการผิดนัดชำระและการละทิ้งทรัพย์สินเท่านั้น'
            : '🔒 Your data is AES-256 encrypted and never shared with third parties. Used solely to prevent payment defaults and property abandonment.'}
        </p>
      </div>

      <Button
        onClick={onStart}
        id="kyc-gate-start-btn"
        className="w-full h-13 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl text-sm shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95"
      >
        {isTh ? 'เริ่มยืนยันตัวตน →' : 'Start Verification →'}
      </Button>
    </div>
  );
}

function IdUploadStep({
  isTh, idFileName, idPreview, idUploading, idProgress,
  fileInputRef, onFileSelect, onNext
}: {
  isTh: boolean;
  idFileName: string | null;
  idPreview: string | null;
  idUploading: boolean;
  idProgress: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500/20 rounded-2xl flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="font-black text-base">{isTh ? 'ขั้นตอน 1: อัปโหลดบัตรประชาชน' : 'Step 1: Upload ID Card'}</h3>
          <p className="text-[10px] text-slate-400 font-medium">{isTh ? 'ถ่ายรูปหรืออัปโหลดไฟล์รูปบัตร' : 'Take a photo or upload image of your ID card'}</p>
        </div>
      </div>

      {/* Drop zone / preview */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px]',
          idPreview ? 'border-emerald-400/50 bg-emerald-500/5' : 'border-white/20 hover:border-orange-400/50 hover:bg-orange-500/5'
        )}
      >
        {idPreview ? (
          <div className="relative w-full">
            <img src={idPreview} alt="ID" className="w-full h-40 object-cover rounded-xl opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
        ) : (
          <div className="py-10 text-center space-y-2">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-400">
              {isTh ? 'คลิกเพื่อเลือกรูปบัตรประชาชน' : 'Click to select ID card image'}
            </p>
            <p className="text-[10px] text-slate-500">{isTh ? 'รองรับ JPG, PNG ขนาดไม่เกิน 10MB' : 'JPG, PNG – max 10MB'}</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileSelect}
        id="kyc-id-card-file-input"
      />

      {/* Upload progress */}
      {idUploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-black text-slate-400">
            <span>{isTh ? 'กำลังอัปโหลด...' : 'Uploading...'}</span>
            <span>{idProgress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${idProgress}%` }}
            />
          </div>
        </div>
      )}

      {idFileName && !idUploading && (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          {idFileName}
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={!idFileName || idUploading}
        id="kyc-id-next-btn"
        className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-black rounded-2xl text-sm shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95"
      >
        {isTh ? 'ถัดไป: สแกนใบหน้า →' : 'Next: Face Scan →'}
      </Button>
    </div>
  );
}

function LivenessStep({
  isTh, videoRef, camError, livenessCapturing, livenessProgress, onStart
}: {
  isTh: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  camError: boolean;
  livenessCapturing: boolean;
  livenessProgress: number;
  onStart: () => void;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500/20 rounded-2xl flex items-center justify-center">
          <Camera className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="font-black text-base">{isTh ? 'ขั้นตอน 2: สแกนใบหน้า' : 'Step 2: Liveness Scan'}</h3>
          <p className="text-[10px] text-slate-400 font-medium">{isTh ? 'วางใบหน้าตรงกลางกรอบ แล้วกดเริ่มสแกน' : 'Center your face in the frame then press scan'}</p>
        </div>
      </div>

      {/* Camera view */}
      <div className="relative w-full h-52 bg-slate-900 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
        {camError ? (
          <div className="text-center space-y-2 p-4">
            <Eye className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400 font-bold">
              {isTh ? 'ไม่สามารถเปิดกล้องได้\n(ใช้ Simulator แทน)' : 'Camera unavailable\n(Using face simulator)'}
            </p>
            <div className="w-24 h-24 border-4 border-orange-400/50 rounded-full mx-auto flex items-center justify-center animate-pulse">
              <Camera className="w-10 h-10 text-orange-400/50" />
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {/* Face frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={cn(
                'w-36 h-44 border-4 rounded-full transition-colors duration-300',
                livenessCapturing ? 'border-orange-400 shadow-lg shadow-orange-500/40' : 'border-white/30'
              )} />
            </div>
          </>
        )}

        {/* Progress ring overlay during capture */}
        {livenessCapturing && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 rounded-full px-4 py-1.5">
            <Loader2 className="w-3 h-3 text-orange-400 animate-spin" />
            <span className="text-[10px] font-black text-orange-300">{livenessProgress}%</span>
          </div>
        )}
      </div>

      {livenessCapturing && (
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-orange-500 h-1.5 rounded-full transition-all duration-200"
            style={{ width: `${livenessProgress}%` }}
          />
        </div>
      )}

      <Button
        onClick={onStart}
        disabled={livenessCapturing}
        id="kyc-liveness-start-btn"
        className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black rounded-2xl text-sm shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95"
      >
        {livenessCapturing
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{isTh ? 'กำลังสแกน...' : 'Scanning...'}</>
          : <>{isTh ? '📸 เริ่มสแกนใบหน้า' : '📸 Start Face Scan'}</>
        }
      </Button>
    </div>
  );
}

function ProcessingStep({ isTh }: { isTh: boolean }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-white text-center space-y-6">
      <div className="w-20 h-20 bg-orange-500/20 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
        <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black">{isTh ? 'กำลังตรวจสอบข้อมูล...' : 'Verifying identity...'}</h3>
        <p className="text-xs text-slate-400 font-medium">
          {isTh ? 'ระบบกำลังวิเคราะห์บัตรและเปรียบเทียบใบหน้า' : 'Matching ID card data against liveness capture'}
        </p>
      </div>
    </div>
  );
}

function DoneStep({ isTh, score, onComplete }: { isTh: boolean; score: number; onComplete: () => void }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white space-y-6">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-400/30 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black">{isTh ? 'ยืนยันตัวตนสำเร็จ!' : 'Verification Complete!'}</h2>
        <p className="text-sm text-slate-300 font-medium">
          {isTh ? 'ระบบตรวจสอบใบหน้าและบัตรประชาชนของคุณผ่านแล้ว' : 'Your face and ID card have been successfully verified.'}
        </p>
      </div>

      {/* Score display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">{score}%</p>
          <p className="text-[10px] text-slate-400 font-black mt-1">{isTh ? 'คะแนน Liveness' : 'Liveness Score'}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-4 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="text-[10px] text-slate-400 font-black mt-2">{isTh ? 'บัตรประชาชนผ่านแล้ว' : 'ID Card Passed'}</p>
        </div>
      </div>

      <Button
        onClick={onComplete}
        id="kyc-gate-complete-btn"
        className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95"
      >
        {isTh ? '✓ เข้าใช้งานแพลตฟอร์ม' : '✓ Enter Platform'}
      </Button>
    </div>
  );
}
