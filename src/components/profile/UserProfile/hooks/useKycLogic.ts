import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import type { Language } from '@/lib/types';

export function useKycLogic(user: any, lang: Language, formDataDisplayName: string) {
  const [isOpenKycModal, setIsOpenKycModal] = useState(false);
  const [kycStep, setKycStep] = useState(1);
  const [kycDocType, setKycDocType] = useState<'id' | 'passport' | 'license' | 'deed' | 'thaid' | 'ndid'>('thaid');
  const [kycIdNumber, setKycIdNumber] = useState('1100901234567');
  const [kycFullName, setKycFullName] = useState(formDataDisplayName || 'คุณทัตเทพ แสนสุข');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [mockKycStatus, setMockKycStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [selectedBank, setSelectedBank] = useState<string>('kbank');
  const [ndidPushSent, setNdidPushSent] = useState(false);

  // Handle Return from KYC callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('kyc_callback') === 'true') {
        toast({
          title: lang === 'th' ? 'ยืนยันตัวตนสำเร็จ!' : 'Verification Success!',
          description: lang === 'th' ? 'บัญชีของคุณได้รับการยืนยันตัวตน (e-KYC) เรียบร้อยแล้ว' : 'Your account is now verified.'
        });
        if (user?.isMock) {
          setMockKycStatus('verified');
          localStorage.setItem('primerent_mock_kyc', 'verified');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [lang, user]);

  // For Dev Test: Force KYC status to reset to 'unverified' upon page refresh/load
  useEffect(() => {
    if (user?.isMock) {
      localStorage.setItem('primerent_mock_kyc', 'unverified');
      setMockKycStatus('unverified');
    }
  }, [user]);

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0].name);
      setIsUploading(true);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    }
  };

  const handleSubmitKyc = async () => {
    // If NDID is selected, require 13-digit ID check and full name
    if (kycDocType === 'ndid' && (!kycIdNumber || kycIdNumber.length !== 13)) {
      toast({ 
        variant: 'destructive', 
        title: lang === 'th' ? 'ข้อมูลไม่ถูกต้อง' : 'Invalid Info',
        description: lang === 'th' ? 'กรุณากรอกหมายเลขบัตรประชาชน 13 หลัก' : 'Please enter a valid 13-digit citizen ID.'
      });
      return;
    }
    if (kycDocType === 'ndid' && !kycFullName) {
      toast({ 
        variant: 'destructive', 
        title: lang === 'th' ? 'กรุณากรอกชื่อจริง' : 'Please enter name'
      });
      return;
    }

    if (kycDocType === 'passport' && !kycFullName.trim()) {
      toast({ 
        variant: 'destructive', 
        title: lang === 'th' ? 'กรุณากรอกชื่อภาษาอังกฤษตามพาสปอร์ต' : 'Please enter English legal name'
      });
      return;
    }

    try {
      // Simulate digital verification success
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setMockKycStatus('verified');
        localStorage.setItem('primerent_mock_kyc', 'verified');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('primerent_session_kyc', 'passed');
        }
        toast({
          title: lang === 'th' ? 'ยืนยันตัวตนสำเร็จ!' : 'Verification Success!',
          description: lang === 'th' 
            ? 'บัญชีของคุณได้รับการยืนยันระดับความปลอดภัยสูงสุดเรียบร้อยแล้ว' 
            : 'Your identity has been verified with maximum security.'
        });
        setKycStep(3);
      }, 1000);
    } catch (err: any) {
      console.error('e-KYC error:', err);
      toast({
        variant: 'destructive',
        title: lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: err.message
      });
    }
  };

  const handleDevInstantVerify = () => {
    if (user?.isMock) {
      setMockKycStatus('verified');
      localStorage.setItem('primerent_mock_kyc', 'verified');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('primerent_session_kyc', 'passed');
      }
      toast({ title: lang === 'th' ? 'ยืนยันตัวตนสำเร็จ (Dev)' : 'Verified (Dev)' });
      setIsOpenKycModal(false);
    }
  };

  const openKycModal = () => {
    setKycStep(1);
    setUploadedFile(null);
    setKycIdNumber('1100901234567');
    setKycFullName(formDataDisplayName || 'คุณทัตเทพ แสนสุข');
    setNdidPushSent(false);
    setIsOpenKycModal(true);
  };

  return {
    isOpenKycModal, setIsOpenKycModal,
    kycStep, setKycStep,
    kycDocType, setKycDocType,
    kycIdNumber, setKycIdNumber,
    kycFullName, setKycFullName,
    uploadedFile, setUploadedFile,
    uploadProgress, setUploadProgress,
    isUploading, setIsUploading,
    mockKycStatus, setMockKycStatus,
    selectedBank, setSelectedBank,
    ndidPushSent, setNdidPushSent,
    handleFileDrop,
    handleSubmitKyc,
    handleDevInstantVerify,
    openKycModal
  };
}
