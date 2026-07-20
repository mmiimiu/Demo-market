"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  Building2, 
  Mail, 
  ArrowRight, 
  Globe, 
  Key,
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const auth = useAuth();
  
  const [email, setEmail] = useState('');
  const [lang, setLang] = useState<'th' | 'en'>('th');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isThai = lang === 'th';

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(isThai 
        ? 'ไม่สามารถส่งลิงก์กู้คืนรหัสผ่านได้ กรุณาตรวจสอบความถูกต้องของอีเมล' 
        : 'Failed to send password reset email. Please verify the email address.');
    } finally {
      setLoading(false);
    }
  };

  const leftImage = PlaceHolderImages.find(i => i.id === 'hero-3')?.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Column: Visual Tagline (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 select-none">
        <img 
          src={leftImage} 
          alt="Premium Real Estate"
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply transition-transform duration-10000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a56db]/40 via-slate-900/60 to-slate-950/90" />
        
        {/* Logo and Branding */}
        <div className="absolute top-12 left-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-white to-blue-200 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
            <Building2 className="w-5 h-5 text-[#1a56db]" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            PrimeRent<span className="text-blue-400">.</span>
          </span>
        </div>

        {/* Contents & Tagline */}
        <div className="absolute inset-x-12 bottom-16 flex flex-col justify-end text-white max-w-lg">
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight drop-shadow-sm">
              {isThai 
                ? 'ระบบรักษาความปลอดภัยบัญชีขั้นสูง' 
                : 'Advanced Account Security'}
            </h2>
            <p className="text-slate-200 font-medium">
              {isThai 
                ? 'หากลืมรหัสผ่าน เพียงระบุอีเมลผู้ใช้งานของคุณ ระบบจะส่งลิงก์เพื่อกู้คืนรหัสผ่านใหม่อย่างปลอดภัยทันที' 
                : 'Forgot your password? Enter your email address to receive a secure link to set a new password.'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-16 bg-slate-50/30 overflow-y-auto">
        {/* Language selector & Back Link */}
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs font-bold text-slate-600"
          >
            <Globe className="w-3.5 h-3.5" />
            {isThai ? 'English' : 'ไทย'}
          </button>

          <Link href="/?auth=login" className="flex items-center gap-2 text-sm font-bold text-[#1a56db] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            {isThai ? 'กลับไปที่หน้าเข้าสู่ระบบ' : 'Back to Login'}
          </Link>
        </div>

        {/* Main form block */}
        <div className="max-w-md w-full mx-auto space-y-8 my-auto">
          {success ? (
            <div className="text-center space-y-6 py-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">
                  {isThai ? 'ส่งลิงก์สำเร็จแล้ว!' : 'Link Sent Successfully!'}
                </h2>
                <p className="text-slate-500 font-semibold text-sm max-w-sm mx-auto">
                  {isThai 
                    ? `เราได้ส่งอีเมลคำแนะนำในการตั้งรหัสผ่านใหม่ไปยัง ${email} เรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ` 
                    : `We have sent instruction email to reset password to ${email}. Please check your inbox.`}
                </p>
              </div>
              <Button 
                onClick={() => router.push('/?auth=login')}
                className="w-full h-13 rounded-xl bg-[#1a56db] hover:bg-[#1546b5] text-white font-extrabold text-base shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all"
              >
                {isThai ? 'กลับไปลงชื่อเข้าใช้งาน' : 'Return to Login'}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 text-[#1a56db]">
                  <Key className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {isThai ? 'ลืมรหัสผ่าน' : 'Forgot Password'}
                </h1>
                <p className="text-slate-500 font-semibold text-sm">
                  {isThai 
                    ? 'ระบุอีเมลที่คุณใช้สมัครสมาชิกเพื่อขอรับลิงก์ตั้งรหัสผ่านใหม่' 
                    : 'Enter the email address associated with your account to receive a reset link.'}
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                {error && (
                  <div className="flex gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 items-center">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 px-1 uppercase tracking-wide">
                    {isThai ? 'อีเมลผู้ใช้งาน' : 'Account Email'}
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <Input 
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-11 h-12 rounded-xl border-slate-200 focus:border-[#1a56db] focus:ring-2 focus:ring-blue-50 font-semibold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-13 rounded-xl bg-[#1a56db] hover:bg-[#1546b5] text-white font-extrabold text-base shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
                >
                  {loading ? (isThai ? 'กำลังส่งคำขอ...' : 'Sending request...') : (
                    <span className="flex items-center justify-center gap-2">
                      {isThai ? 'ส่งลิงก์รีเซ็ตรหัสผ่าน' : 'Send Reset Link'} <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Footer spacing */}
        <div className="text-center text-xs font-semibold text-slate-400">
          PrimeRent Customer Support
        </div>
      </div>
    </div>
  );
}
