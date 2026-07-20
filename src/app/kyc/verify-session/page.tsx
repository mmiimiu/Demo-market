'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function KYCVerifySessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || '';
  const returnUrl = searchParams.get('returnUrl') || '/profile';

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(true);
  
  // Verification steps state
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  const steps = [
    { label: 'มองตรงที่หน้าจอ (Look Straight)', duration: 1500 },
    { label: 'กรุณากระพริบตา 2 ครั้ง (Blink twice)', duration: 1500 },
    { label: 'หันหน้าไปทางขวาช้าๆ (Turn right slowly)', duration: 1500 },
    { label: 'หันหน้ามาสบตากับกล้องอีกครั้ง (Look back to camera)', duration: 1000 },
  ];

  // 1. Request camera stream on mount
  useEffect(() => {
    async function startCamera() {
      try {
        setCameraLoading(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 480, height: 480 }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);
        setStatus('scanning');
      } catch (err: any) {
        console.error('Failed to open camera:', err);
        setError('ไม่สามารถเข้าถึงกล้องถ่ายภาพของคุณได้ กรุณาอนุญาตสิทธิ์การใช้งานกล้อง');
        setStatus('failed');
      } finally {
        setCameraLoading(false);
      }
    }
    
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Play scanning steps
  useEffect(() => {
    if (status !== 'scanning') return;

    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);
      return () => clearTimeout(timer);
    } else {
      // Completed all scanning checks -> send PUT callback webhook
      completeVerification();
    }
  }, [status, currentStep]);

  const completeVerification = async () => {
    try {
      // Trigger callback PUT /api/kyc/verify simulating e-KYC provider
      const response = await fetch('/api/kyc/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status: 'verified'
        })
      });

      if (response.ok) {
        setStatus('success');
        // Stop stream tracks
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        // Redirect back after 2 seconds
        setTimeout(() => {
          router.push(returnUrl);
        }, 2000);
      } else {
        setError('เกิดข้อผิดพลาดในการส่งข้อมูลยืนยันตัวตนไปยังระบบเซิร์ฟเวอร์');
        setStatus('failed');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-thai">
      <Card className="w-full max-w-lg rounded-none border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="text-center border-b border-gray-100 p-6">
          <CardTitle className="text-2xl font-black text-gray-900">🛡️ PrimeRent Secure e-KYC</CardTitle>
          <CardDescription className="text-sm font-bold text-gray-400 mt-1">
            การสแกนใบหน้าเพื่อความปลอดภัยในการเข้าพัก (Liveness Check Session)
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 flex flex-col items-center gap-6">
          {/* Camera Frame */}
          <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-primary bg-black flex items-center justify-center">
            {cameraLoading && (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            )}
            
            {error ? (
              <div className="text-center p-6 text-red-500 flex flex-col items-center gap-2">
                <AlertCircle className="w-12 h-12" />
                <p className="text-xs font-bold leading-relaxed">{error}</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}

            {/* Glowing Laser Scan Bar */}
            {status === 'scanning' && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-laser-scan shadow-[0_0_8px_rgba(26,86,219,0.8)]" />
            )}

            {/* Scanning Overlay Ring */}
            {status === 'scanning' && (
              <div className="absolute inset-0 border-8 border-primary/20 animate-pulse rounded-full" />
            )}

            {/* Success Overlay */}
            {status === 'success' && (
              <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                <CheckCircle2 className="w-20 h-20 animate-bounce" />
                <p className="font-black text-lg mt-2">สแกนใบหน้าสำเร็จ</p>
                <p className="text-xs font-semibold text-white/80">ระบบกำลังนำทางคุณกลับ...</p>
              </div>
            )}
          </div>

          {/* Guidelines / Steps */}
          {status === 'scanning' && currentStep < steps.length && (
            <div className="w-full text-center space-y-3 bg-primary/5 border border-primary/10 p-5 rounded-none animate-in fade-in duration-300">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">คำแนะนำการสแกน</p>
              <h3 className="text-lg font-black text-primary animate-pulse">{steps[currentStep].label}</h3>
              <div className="flex justify-center gap-2 mt-2">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      idx === currentStep 
                        ? "bg-primary w-6" 
                        : idx < currentStep 
                          ? "bg-green-500" 
                          : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Failed Fallback actions */}
          {status === 'failed' && (
            <div className="w-full space-y-4">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-primary hover:bg-primary/95 text-white font-black text-sm h-12 rounded-none"
              >
                ลองใหม่อีกครั้ง (Retry)
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(returnUrl)}
                className="w-full border-gray-200 text-gray-600 font-bold h-12 rounded-none"
              >
                ยกเลิกและกลับ (Go Back)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function KYCVerifySessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <KYCVerifySessionContent />
    </Suspense>
  );
}
