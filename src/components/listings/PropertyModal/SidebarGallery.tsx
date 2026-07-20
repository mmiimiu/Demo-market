'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, MessageCircle, CalendarDays, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Language, Property } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface SidebarGalleryProps {
  property: Property;
  lang: Language;
  t: any;
  rating: string;
  reviewCount: number;
  subRatings: Array<{ label: string; value: number }>;
  galleryImages: string[];
  imgIdx: number;
  setImgIdx: React.Dispatch<React.SetStateAction<number>>;
  totalImages: number;
  handleLineContact: () => void;
  setShowBookingForm: (show: boolean) => void;
  setShowViewingScheduler: (show: boolean) => void;
  setShowWebChat: (show: boolean) => void;
  userRole?: string;
  currentUser?: any;
}

export const SidebarGallery: React.FC<SidebarGalleryProps> = ({
  property,
  lang,
  t,
  rating,
  reviewCount,
  subRatings,
  galleryImages,
  imgIdx,
  setImgIdx,
  totalImages,
  handleLineContact,
  setShowBookingForm,
  setShowViewingScheduler,
  setShowWebChat,
  userRole,
  currentUser,
}) => {
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // Check if there's a pending delegation request for this property
  useEffect(() => {
    if (!currentUser || userRole !== 'agent') return;
    
    const stored = localStorage.getItem('primerent_delegations');
    if (stored) {
      const delegations = JSON.parse(stored);
      const pending = delegations.find(
        (d: any) => 
          d.propertyId === property.id && 
          d.agentId === currentUser.uid && 
          d.status === 'pending_owner_signature'
      );
      setHasPendingRequest(!!pending);
    }
  }, [property.id, currentUser, userRole]);

  const handleRequestDelegation = () => {
    if (!currentUser || userRole !== 'agent') return;
    
    // Create DelegationAgreement record
    const delegation = {
      id: 'delegate-' + Date.now(),
      propertyId: property.id,
      propertyName: property.name,
      ownerId: property.ownerId || 'mock_owner_id',
      ownerName: 'เจ้าของห้อง',
      ownerSignature: null,
      agentId: currentUser.uid,
      agentName: currentUser.displayName || 'Agent',
      agentSignature: null,
      commissionRate: 5,
      status: 'pending_owner_signature',
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const existingDelegations = JSON.parse(localStorage.getItem('primerent_delegations') || '[]');
    existingDelegations.push(delegation);
    localStorage.setItem('primerent_delegations', JSON.stringify(existingDelegations));

    // Show toast
    toast({
      title: lang === 'th' ? 'ส่งคำขอสำเร็จ' : 'Request Sent',
      description: lang === 'th' 
        ? 'ส่งคำขอสิทธิ์นายหน้าไปยังเจ้าของแล้ว รอการอนุมัติ' 
        : 'Delegation request sent to owner, awaiting approval'
    });

    // Update pending state
    setHasPendingRequest(true);
  };
  return (
    <div className="lg:w-[380px] shrink-0 border-r border-gray-100 flex flex-col overflow-y-auto bg-gray-50/30">
      {/* Image Gallery */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden group">
        <img
          src={galleryImages[imgIdx]}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {/* Navigation */}
        {imgIdx > 0 && (
          <button
            onClick={() => setImgIdx(i => i - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {imgIdx < totalImages - 1 && (
          <button
            onClick={() => setImgIdx(i => i + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-black px-2 py-1 tracking-widest">
          {imgIdx + 1} / {totalImages}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2 bg-gray-200 shrink-0 p-2">
        {galleryImages.map((src, i) => (
          <button
            key={i}
            onClick={() => setImgIdx(i)}
            className={cn(
              "aspect-square overflow-hidden relative rounded-lg",
              imgIdx === i ? "ring-2 ring-inset ring-primary" : "opacity-70 hover:opacity-100"
            )}
          >
            <img src={src} className="w-full h-full object-cover" alt="" />
          </button>
        ))}
      </div>

      {/* Rating block */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-primary flex items-center justify-center text-white font-black text-xl shrink-0 rounded-xl">
            {rating}
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm uppercase tracking-wider">{t.excellent}</p>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest">
              {reviewCount.toLocaleString()} {t.reviews}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {subRatings.map((sr, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                <span>{sr.label}</span>
                <span className="text-primary">{sr.value}%</span>
              </div>
              <Progress value={sr.value} className="h-1 bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Owner + Contact */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary/8 flex items-center justify-center font-black text-primary text-sm border border-primary/10 rounded-xl">
            JD
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm leading-none mb-1">John Doe</p>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">
                {lang === 'th' ? 'เจ้าของที่ยืนยันแล้ว' : lang === 'cn' ? '已认证业主' : 'Verified Owner'}
              </span>
            </div>
          </div>
        </div>

        {/* Agent Delegation Button - Only for agents */}
        {userRole === 'agent' && (
          <button
            onClick={handleRequestDelegation}
            disabled={hasPendingRequest}
            className={cn(
              "w-full mb-5 px-4 py-2.5 text-xs font-black rounded-full transition-all",
              hasPendingRequest
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
            )}
          >
            {hasPendingRequest
              ? (lang === 'th' ? 'รอเจ้าของอนุมัติ' : lang === 'cn' ? '等待业主批准' : 'Awaiting Owner Approval')
              : (lang === 'th' ? 'ขอรับสิทธิ์นายหน้า' : lang === 'cn' ? '申请代理权' : 'Request Delegation')
            }
          </button>
        )}
        
        {/* Primary CTA Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => setShowWebChat(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white h-11 font-black text-sm gap-2 rounded-xl shadow-none"
          >
            <MessageCircle className="w-4 h-4" />
            {lang === 'th' ? 'แชท' : lang === 'cn' ? '聊天' : 'Chat'}
          </Button>
          <Button
            onClick={() => setShowBookingForm(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white h-11 font-black text-sm gap-2 rounded-xl shadow-none"
          >
            <CalendarDays className="w-4 h-4" />
            {lang === 'th' ? 'จอง' : lang === 'cn' ? '预订' : 'Book'}
          </Button>
        </div>
        
        {/* Secondary CTA Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => setShowViewingScheduler(true)}
            className="bg-white hover:bg-gray-50 text-primary border border-primary/30 h-10 font-black text-xs gap-1.5 rounded-xl shadow-none flex-col py-2"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="text-[10px] leading-tight">{lang === 'th' ? 'นัดดู' : lang === 'cn' ? '预约' : 'View'}</span>
          </Button>
          <Button
            onClick={handleLineContact}
            className="bg-[#06C755] hover:bg-[#05a948] text-white h-10 font-black text-xs gap-1.5 rounded-xl shadow-none flex-col py-2"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] leading-tight">LINE</span>
          </Button>
          <Button variant="outline" className="h-10 font-black text-xs gap-1.5 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 flex-col py-2">
            <Phone className="w-3.5 h-3.5" />
            <span className="text-[10px] leading-tight">Call</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
