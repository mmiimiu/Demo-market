'use client';

import React, { useState, useRef } from 'react';
import { Award, UploadCloud, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentVerificationCardProps {
  isTh: boolean;
  isVerified: boolean;
  onVerified: () => void;
}

export function AgentVerificationCard({ isTh, isVerified, onVerified }: AgentVerificationCardProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      // Mock: save verified.agent = true to localStorage
      const stored = localStorage.getItem('prime_mock_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.verified = { ...(parsed.verified ?? {}), agent: true };
        localStorage.setItem('prime_mock_user', JSON.stringify(parsed));
      } else {
        localStorage.setItem('primerent_agent_verified', 'true');
      }
      setUploading(false);
      onVerified();
    }, 1500);
  };

  if (isVerified) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-sm shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-black text-teal-900 text-base">
              {isTh ? '✓ ยืนยันตัวแทนแล้ว' : '✓ Verified Agent'}
            </h4>
            <p className="text-sm text-teal-700 font-medium mt-0.5">
              {isTh ? 'โปรไฟล์ของคุณได้รับป้าย Verified Agent เรียบร้อยแล้ว' : 'Your profile now displays the Verified Agent badge.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-black text-orange-950 text-base">
              {isTh ? 'เอกสารยืนยันการเป็นเอเจนต์ (Agent Verification)' : 'Agent Verification'}
            </h4>
            <p className="text-sm text-orange-800 font-medium mt-1 leading-relaxed">
              {isTh
                ? 'อัปโหลดนามบัตร หรือใบประกอบวิชาชีพ เพื่อรับป้าย "Verified Agent" เพิ่มความน่าเชื่อถือให้โปรไฟล์ของคุณ (ไม่บังคับ)'
                : 'Upload your business card or license to receive a "Verified Agent" badge on your profile (optional).'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 bg-white">
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
            dragging ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
          }`}
        >
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
            onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-orange-700">
              <FileText className="w-5 h-5" />
              <span className="font-bold text-sm truncate max-w-[200px]">{file.name}</span>
            </div>
          ) : (
            <>
              <UploadCloud className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-700 text-sm">{isTh ? 'คลิกหรือลากไฟล์มาวางที่นี่' : 'Click or drag file here'}</p>
              <p className="text-xs text-gray-400 mt-1">{isTh ? 'รองรับไฟล์ JPG, PNG หรือ PDF ขนาดไม่เกิน 5MB' : 'JPG, PNG or PDF, max 5MB'}</p>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleUpload} disabled={!file || uploading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl px-6">
            {uploading ? (isTh ? 'กำลังอัปโหลด...' : 'Uploading...') : (isTh ? 'อัปโหลดเอกสาร' : 'Upload Document')}
          </Button>
        </div>
      </div>
    </div>
  );
}
