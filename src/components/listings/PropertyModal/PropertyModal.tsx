'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Share2, X, Badge, MapPin, CreditCard, Repeat, ShieldCheck, LayoutTemplate, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useNotification } from '@/hooks/use-notification';
import { translations } from '@/lib/translations';
import { useApp } from '@/contexts/AppContext';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { AgentDelegationModal } from '@/components/agent/AgentDelegationModal';

import { BookingForm } from '../../BookingForm';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { ViewingScheduler } from './ViewingScheduler';
import { VirtualTourSection } from './VirtualTourSection';
import { ReviewSystem } from '../../shared/ReviewSystem';
import { TransactionVerificationModal } from '@/components/auth/TransactionVerificationModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { DepositCheckoutModal } from '@/components/payment/DepositCheckoutModal';

import { PropertyModalProps } from './types';
import { GalleryGrid } from './GalleryGrid';
import { SpecsSection } from './SpecsSection';
import { AmenitiesMapSection } from './AmenitiesMapSection';
import { CheckCircle2, MoreVertical, Phone, CalendarDays, MessageCircle, Image, Map } from 'lucide-react';

const getMockNearbyPlaces = (id: number): string[] => {
  const lists = [
    ["BTS อโศก (Asok)", "Terminal 21", "มหาวิทยาลัย มศว (SWU)", "Exchange Tower"],
    ["Fashion Island", "The Promenade", "โรงพยาบาลนพรัตน์ (Nopparat Hospital)", "MRT นพรัตนราชธานี"],
    ["ถนนนิมมานเหมินท์", "ห้าง MAYA Shopping Mall", "มหาวิทยาลัยเชียงใหม่ (CMU)", "One Nimman"],
    ["หาดป่าตอง (Patong Beach)", "ห้าง Jungceylon", "ถนนบางลา (Bangla Road)", "Phuket Simon Cabaret"],
    ["Central Ladprao", "Union Mall", "BTS ห้าแยกลาดพร้าว", "สวนจตุจักร (Chatuchak Park)"]
  ];
  return lists[(id - 1) % lists.length] || ["BTS สถานีใกล้เคียง", "ห้างสรรพสินค้าชั้นนำ", "มหาวิทยาลัยใกล้เคียง"];
};

const calculateNearbyDistances = (id: number, place: string) => {
  const seed = (id + place.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 100;
  const distanceKm = (0.3 + (seed % 35) / 10).toFixed(1);
  const walkMinutes = Math.round(parseFloat(distanceKm) * 12);
  const driveMinutes = Math.round(parseFloat(distanceKm) * 3) + 2;
  return {
    distance: distanceKm,
    walk: walkMinutes,
    drive: driveMinutes
  };
};

export const PropertyModal: React.FC<PropertyModalProps> = ({ 
  property, 
  onClose, 
  lang, 
  currency,
  isSaved,
  onToggleSave,
  workLocation
}) => {
  const { openChat } = useApp();
  const { user } = useUser();
  const db = useFirestore();
  const [imgIdx, setImgIdx] = useState(0);
  const [isTemplateSaved, setIsTemplateSaved] = useState(false);

  // Get user role to conditionally show/hide buttons
  const { data: profile } = useDoc<{ role: string }>(
    user && !user.isMock ? `users/${user.uid}` : null
  );
  const userRole = (
    profile?.role || 
    (typeof window !== 'undefined' ? localStorage.getItem('primerent_user_role') : null) || 
    (user as any)?.role || 
    'renter'
  );
  const isOwner = userRole === 'landlord' || userRole === 'owner';
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showKyc, setShowKyc] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'book' | 'chat' | null>(null);
  const [showViewingScheduler, setShowViewingScheduler] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showContactAccordion, setShowContactAccordion] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const notification = useNotification();

  // Check if this is a repost scenario from URL params
  const [isRepostMode, setIsRepostMode] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('repost') === 'true') {
      setIsRepostMode(true);
    }
  }, []);

  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [isDelegationActive, setIsDelegationActive] = useState(false);

  useEffect(() => {
    if (!property) return;
    setIsDelegationActive(false); // Reset to false first on property change
    const stored = localStorage.getItem('primerent_delegations');
    if (stored) {
      const delegations = JSON.parse(stored);
      const active = delegations.find(
        (d: any) => d.propertyId === property.id && d.status === 'active'
      );
      if (active) {
        setIsDelegationActive(true);
      }
    }
  }, [property]);

  const handleRepost = () => {
    if (!property) return;
    
    // Create a new property entry without owner information
    const repostId = `agent_repost_${Date.now()}`;
    const repostedProperty = {
      ...property,
      id: repostId,
      isAgentRepost: true,
      agentId: user?.uid || 'mock_agent',
      ownerId: undefined, // Remove owner information
      originalPropertyId: property.id
    };

    // Save to localStorage for mock system properties
    const stored = localStorage.getItem('primerent_mock_properties');
    const list = stored ? JSON.parse(stored) : [];
    list.push(repostedProperty);
    localStorage.setItem('primerent_mock_properties', JSON.stringify(list));

    // Update the delegation in localStorage to associate it with the repost event for reports
    const storedDels = localStorage.getItem('primerent_delegations');
    if (storedDels) {
      const delegations = JSON.parse(storedDels);
      const updatedDels = delegations.map((d: any) => {
        if (d.propertyId === property.id && d.status === 'active') {
          return {
            ...d,
            repostedAt: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
            repostId: repostId,
            monthKey: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }) // e.g. "2026-07"
          };
        }
        return d;
      });
      localStorage.setItem('primerent_delegations', JSON.stringify(updatedDels));
    }

    toast({
      title: lang === 'th' ? '📢 รีโพสประกาศสำเร็จ!' : 'Repost Successful!',
      description: lang === 'th' 
        ? 'สลับไปหน้าสัญญาเพื่อดูสรุปรายรายงานการแชร์งานและสัญญารายเดือน' 
        : 'Heading to delegation contracts report to view your monthly share performance.'
    });

    onClose();
    setTimeout(() => {
      // Redirect to Profile Page on Delegations Tab
      window.location.href = '/profile?tab=delegations';
    }, 800);
  };

  useEffect(() => {
    if (property) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [property]);

  if (!property) return null;

  const executePendingAction = (action: 'book' | 'chat') => {
    if (action === 'book') {
      if (user?.isMock) {
        setShowBookingForm(true);
      } else {
        setShowKyc(true);
      }
    }
    if (action === 'chat') {
      openChat({ id: property.id as number, name: property.name }, 'renter');
    }
  };

  const requireAuthAndOnboarding = (action: 'book' | 'chat') => {
    if (!user) {
      setPendingAction(action);
      setShowAuthModal(true);
      return;
    }
    if (user.isMock) {
      executePendingAction(action);
      return;
    }
    if (!(user as any).onboardingCompleted || !(user as any).isLineLinked) {
      setPendingAction(action);
      setShowOnboardingModal(true);
      return;
    }
    executePendingAction(action);
  };

  const t = translations[lang] || translations.th;
  const rating = (8.0 + (property.id as number % 20) / 10).toFixed(1);
  const reviewCount = 500 + (property.id as number * 157) % 5000;

  const subRatings = [
    { label: t.rating_cleanliness, value: 85 + (property.id as number % 15) },
    { label: t.rating_service,     value: 82 + (property.id as number % 12) },
    { label: t.rating_location,    value: 88 + (property.id as number % 10) },
    { label: t.rating_value,       value: 80 + (property.id as number % 18) },
  ];

  const propIdNum = typeof property.id === 'number' ? property.id : parseInt(property.id as string) || 1;

  const [commuteInfo, setCommuteInfo] = useState<{
    bts: number;
    car: number;
    moto: number;
    destination: string;
  } | null>(null);

  useEffect(() => {
    if (!workLocation || !workLocation.trim()) {
      setCommuteInfo(null);
      return;
    }

    const fetchCommute = async () => {
      const origin = property.locationEn || property.location || '';
      const destination = workLocation;

      try {
        const [carRes, btsRes] = await Promise.all([
          fetch(`/api/maps/distance-matrix?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`),
          fetch(`/api/maps/distance-matrix?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=transit`)
        ]);

        const carData = await carRes.json();
        const btsData = await btsRes.json();

        if (carData.success && btsData.success) {
          const carTime = Math.round((carData.duration?.value || 0) / 60) || 15;
          const btsTime = Math.round((btsData.duration?.value || 0) / 60) || 12;
          const motoTime = Math.round(carTime * 0.6) || 9;

          setCommuteInfo({
            bts: btsTime,
            car: carTime,
            moto: motoTime,
            destination: workLocation
          });
        } else {
          setCommuteInfo(getLocalCommuteFallback(propIdNum, workLocation));
        }
      } catch (err) {
        console.error('Error fetching commute info:', err);
        setCommuteInfo(getLocalCommuteFallback(propIdNum, workLocation));
      }
    };

    fetchCommute();
  }, [workLocation, property, propIdNum]);

  function getLocalCommuteFallback(propIdNumVal: number, destinationVal: string) {
    const cleanWork = destinationVal.trim().toLowerCase();
    const seed = (propIdNumVal + cleanWork.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 50;
    const btsTime = 8 + (seed % 15);
    const carTime = 12 + (seed % 25);
    const motoTime = Math.round(carTime * 0.6);
    return {
      bts: btsTime,
      car: carTime,
      moto: motoTime,
      destination: destinationVal
    };
  }

  const symbols = { THB: '฿', USD: '$', CNY: '¥' };
  const rates   = { THB: 1, USD: 0.028, CNY: 0.20 };
  const symbol  = symbols[currency];
  const convertedPrice      = Math.round(property.price * rates[currency]);
  const displayFloor        = (property.floor ?? (property.type === 'house' || property.type === 'townhouse' ? '1-2' : (propIdNum % 15 + 2))).toString();
  const displayDeposit      = property.deposit ?? (property.price * 2);
  const displayContract     = property.contractTerm ?? 12;
  const displayCommonFee    = property.commonFee ?? (property.sqm * 45);
  const convertedDeposit    = Math.round(displayDeposit    * rates[currency]);
  const convertedCommonFee  = Math.round(displayCommonFee  * rates[currency]);

  const displayName     = lang === 'en' ? property.nameEn     : lang === 'cn' ? property.nameCn     : property.name;
  const displayLocation = lang === 'en' ? property.locationEn : lang === 'cn' ? property.locationCn : property.location;

  const encodedLoc   = encodeURIComponent(property.locationEn + ", Thailand");
  const genericMapUrl = `https://maps.google.com/maps?q=${encodedLoc}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const galleryImages = [
    property.img,
    ...([1, 2, 3, 4].map(i => `https://picsum.photos/seed/p${property.id}g${i}/800/600`))
  ];
  const totalImages = galleryImages.length;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title:       lang === 'th' ? "คัดลอกลิงก์แล้ว" : lang === 'cn' ? "链接已复制" : "Link Copied",
      description: lang === 'th' ? "คุณสามารถส่งให้เพื่อนได้ทันที" : lang === 'cn' ? "可以立即分享给朋友" : "Ready to share with friends!",
    });
  };

  const handleLineContact = () => {
    const chatIntent = {
      propertyId: property.id,
      propertyName: displayName,
      ownerId: property.ownerId || 'mock_owner_id',
      renterId: 'mock_tenant_id'
    };
    localStorage.setItem('primerent_pending_line_chat', JSON.stringify(chatIntent));
    window.open('/chat/line-oa', '_blank');
  };

  const handleSaveAsTemplate = async () => {
    try {
      const currentOwnerId = user?.uid || 'mock_owner_id';

      // Check for duplicate template first
      if (!user || user.isMock) {
        const stored = localStorage.getItem('primerent_mock_properties');
        if (stored) {
          const list = JSON.parse(stored);
          const exists = list.some((p: any) => 
            p.isTemplate && p.ownerId === currentOwnerId && p.originalPropertyId === property.id
          );
          if (exists) {
            setIsTemplateSaved(true);
            toast({
              title: lang === 'th' ? 'มีเทมเพลตนี้อยู่แล้ว' : 'Template Already Exists',
              description: lang === 'th' ? 'คุณได้บันทึกที่พักนี้เป็นเทมเพลตไว้แล้ว' : 'You have already saved this property as a template'
            });
            return;
          }
        }
      } else if (db) {
        const q = query(
          collection(db, 'properties'), 
          where('ownerId', '==', currentOwnerId), 
          where('isTemplate', '==', true),
          where('originalPropertyId', '==', property.id)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setIsTemplateSaved(true);
          toast({
            title: lang === 'th' ? 'มีเทมเพลตนี้อยู่แล้ว' : 'Template Already Exists',
            description: lang === 'th' ? 'คุณได้บันทึกที่พักนี้เป็นเทมเพลตไว้แล้ว' : 'You have already saved this property as a template'
          });
          return;
        }
      }

      const templateData = {
        ...property,
        isTemplate: true,
        isPublicTemplate: false,
        ownerId: currentOwnerId,
        templateName: `${property.name} (Copy)`,
        originalPropertyId: property.id,
        status: 'draft',
      };
      
      // Remove fields that shouldn't be copied
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...templateDataClean } = templateData;
      const cleanTemplate = templateDataClean;

      if (!user || user.isMock) {
        const stored = localStorage.getItem('primerent_mock_properties');
        const list = stored ? JSON.parse(stored) : [];
        list.push({
          ...cleanTemplate,
          id: `mock_tpl_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        localStorage.setItem('primerent_mock_properties', JSON.stringify(list));
      } else if (db) {
        await addDoc(collection(db, 'properties'), {
          ...cleanTemplate,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      setIsTemplateSaved(true);
      
      toast({
        title: lang === 'th' ? 'บันทึกเป็นเทมเพลตแล้ว' : 'Saved as Template',
        description: lang === 'th' ? 'เพิ่มลงในเทมเพลตของคุณเรียบร้อยแล้ว' : 'Successfully added to your templates'
      });
    } catch (err) {
      console.error('Error saving template:', err);
      toast({
        variant: 'destructive',
        title: lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: lang === 'th' ? 'ไม่สามารถบันทึกเทมเพลตได้' : 'Failed to save template'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-8 overflow-hidden pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal shell */}
      <div className={cn(
        "relative bg-white w-full h-full sm:h-auto sm:max-w-6xl sm:max-h-[90vh] rounded-none",
        "overflow-hidden flex flex-col",
        "shadow-[0_40px_120px_-20px_rgba(0,0,0,0.4)]",
        "animate-in zoom-in-95 duration-300",
        lang === 'th' ? "font-thai" : lang === 'cn' ? "font-chinese" : "font-english"
      )}>

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary text-white border-none font-black text-[9px] tracking-[0.2em] px-3 py-1 rounded-xl">PRIME</Badge>
            {property.badge === 'hot' && (
              <Badge className="bg-red-500 text-white border-none font-black text-[9px] tracking-[0.2em] px-3 py-1 rounded-xl animate-pulse">HOT</Badge>
            )}
            {property.ownerId && (
              <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] tracking-[0.2em] px-3 py-1 rounded-xl">
                {lang === 'th' ? 'โพสต์โดยเจ้าของ' : lang === 'cn' ? '业主发布' : 'Owner Post'}
              </Badge>
            )}
            <span className="text-xs text-gray-400 font-bold">#{propIdNum.toString().padStart(5, '0')}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Repost Button - Shows when in repost mode */}
            {isRepostMode && (
              <button
                onClick={handleRepost}
                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 rounded-xl text-xs font-black transition-all flex items-center gap-1"
              >
                <Repeat className="w-3 h-3" />
                {lang === 'th' ? 'รีโพสประกาศ' : lang === 'cn' ? '重新发布' : 'Repost Listing'}
              </button>
            )}
            
            <button
              onClick={() => onToggleSave(property.id as number)}
              className={cn(
                "w-9 h-9 flex items-center justify-center border transition-all rounded-xl",
                isSaved ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
              )}
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
            </button>
            <button onClick={handleShare} className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-400 hover:border-gray-300 transition-all rounded-xl">
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSaveAsTemplate}
              className={cn(
                "w-9 h-9 flex items-center justify-center border transition-all rounded-xl",
                isTemplateSaved 
                  ? "bg-green-50 border-green-200 text-green-600" 
                  : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-indigo-600"
              )}
              title={lang === 'th' ? 'บันทึกเทมเพลต' : 'Save Template'}
            >
              {isTemplateSaved ? <CheckCircle className="w-4 h-4" /> : <LayoutTemplate className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all rounded-xl ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body (two columns) ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Gallery Grid */}
            <GalleryGrid
              galleryImages={galleryImages}
              imgIdx={imgIdx}
              setImgIdx={setImgIdx}
              totalImages={totalImages}
              onOpenGallery={() => setShowFullGallery(true)}
            />

            {/* Two columns layout */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left column (65-68%) */}
              <div className="flex-1 lg:w-[67%] space-y-6">
                {/* Title + Location */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight mb-2">
                    {displayName}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>{displayLocation}</span>
                  </div>
                </div>

                {/* Price + Badge */}
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex flex-col gap-0.5">
                    {/* ⭐ Show original price if there's a price drop (from Wishlist notification) */}
                    {(property as any).originalPrice && (property as any).originalPrice > property.price && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 line-through">
                          {symbol}{Math.round((property as any).originalPrice * rates[currency]).toLocaleString()}
                        </span>
                        <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                          -{Math.round((1 - property.price / (property as any).originalPrice) * 100)}% ลด
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900">
                        {symbol}{convertedPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                        /{lang === 'th' ? 'เดือน' : lang === 'cn' ? '月' : 'month'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specs icons row */}
                <div className="flex items-center gap-4 text-xs font-bold text-gray-600 border-t border-b border-gray-100 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary">🛏️</span>
                    <span>{property.bed} {lang === 'th' ? 'ห้องนอน' : lang === 'cn' ? '卧室' : 'bed'}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary">🚿</span>
                    <span>{property.bath} {lang === 'th' ? 'ห้องน้ำ' : lang === 'cn' ? '卫生间' : 'bath'}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary">📐</span>
                    <span>{property.sqm} {lang === 'th' ? 'ตร.ม.' : lang === 'cn' ? '平米' : 'sqm'}</span>
                  </div>
                </div>

                {/* Commute info */}
                {commuteInfo && (
                  <div className="p-3 bg-green-50 border border-green-200 text-xs font-bold text-gray-700 flex items-center justify-between flex-wrap gap-2 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <span className="text-green-600">📍 {lang === 'th' ? 'ไปที่' : lang === 'cn' ? '至' : 'To'} {commuteInfo.destination}</span>
                    </div>
                    <div className="flex items-center gap-3 font-black">
                      <span className="flex items-center gap-0.5">🚗 {commuteInfo.car} {lang === 'th' ? 'นาที' : 'm'}</span>
                      <span className="flex items-center gap-0.5">🏍️ {commuteInfo.moto} {lang === 'th' ? 'นาที' : 'm'}</span>
                      <span className="flex items-center gap-0.5">🚇 {commuteInfo.bts} {lang === 'th' ? 'นาที' : 'm'}</span>
                    </div>
                  </div>
                )}

                {/* Nearby places distance calculation */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    📍 {lang === 'th' ? 'การเดินทางและสถานที่ใกล้เคียง' : lang === 'cn' ? '周边地标与交通' : 'Nearby Landmarks & Commute'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(property.nearbyPlaces || getMockNearbyPlaces(propIdNum)).map((place: string) => {
                      const calc = calculateNearbyDistances(propIdNum, place);
                      return (
                        <div key={place} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm flex flex-col justify-between gap-1 hover:border-primary/20 transition-all">
                          <span className="font-bold text-xs text-gray-800 flex items-center gap-1">
                            <span className="text-primary text-[10px]">🏢</span>
                            {place}
                          </span>
                          <div className="flex items-center gap-3 text-[10px] font-black text-gray-500">
                            <span>📏 {calc.distance} กม.</span>
                            <span>🚗 {calc.drive} นาที</span>
                            <span>🚶 {calc.walk} นาที</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Image + Map buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFullGallery(true)}
                    className="flex-1 flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <Image className="w-5 h-5 text-gray-600" />
                    <span className="text-xs font-bold text-gray-700">{lang === 'th' ? 'รูปภาพ' : lang === 'cn' ? '图片' : 'Images'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const mapSection = document.getElementById('amenities-map');
                      if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <Map className="w-5 h-5 text-gray-600" />
                    <span className="text-xs font-bold text-gray-700">{lang === 'th' ? 'แผนที่' : lang === 'cn' ? '地图' : 'Map'}</span>
                  </button>
                </div>

                {/* Property details grid */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-black text-gray-900 mb-3">{lang === 'th' ? 'รายละเอียดทรัพย์สิน' : lang === 'cn' ? '房产详情' : 'Property Details'}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                      <span className="text-primary">🏢</span>
                      <span>{lang === 'th' ? 'ชั้น' : lang === 'cn' ? '楼层' : 'Floor'}: {displayFloor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                      <span className="text-primary">💰</span>
                      <span>{lang === 'th' ? 'เงินประกัน' : lang === 'cn' ? '押金' : 'Deposit'}: {symbol}{convertedDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                      <span className="text-primary">📋</span>
                      <span>{lang === 'th' ? 'ระยะสัญญา' : lang === 'cn' ? '租期' : 'Contract'}: {displayContract} {lang === 'th' ? 'เดือน' : lang === 'cn' ? '月' : 'mo'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                      <span className="text-primary">🏢</span>
                      <span>{lang === 'th' ? 'ค่าส่วนกลาง' : lang === 'cn' ? '物业费' : 'Common Fee'}: {symbol}{convertedCommonFee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Rating section */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-black text-gray-900 mb-3">{lang === 'th' ? 'คะแนนรีวิว' : lang === 'cn' ? '评分' : 'Rating'}</h4>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 bg-primary flex items-center justify-center text-white font-black text-2xl rounded-xl">
                      {rating}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">{lang === 'th' ? 'ยอดเยี่ยม' : lang === 'cn' ? '优秀' : 'Excellent'}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{reviewCount.toLocaleString()} {lang === 'th' ? 'รีวิว' : lang === 'cn' ? '评价' : 'reviews'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {subRatings.map((sr, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          <span>{sr.label}</span>
                          <span className="text-primary">{sr.value}%</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${sr.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-black text-gray-900 mb-3">{lang === 'th' ? 'รายละเอียดเพิ่มเติม' : lang === 'cn' ? '其他说明' : 'Additional Information'}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    {property.description}
                  </p>
                </div>

                {/* Amenities Map */}
                <div id="amenities-map">
                  <AmenitiesMapSection
                    property={property}
                    lang={lang}
                    t={t}
                    genericMapUrl={genericMapUrl}
                    encodedLoc={encodedLoc}
                  />
                </div>

                {/* Virtual Tour */}
                {(property.tour360Url || (property as any).virtualTourUrl) && (
                  <VirtualTourSection
                    tourUrl={(property as any).virtualTourUrl || property.tour360Url || ''}
                    lang={lang}
                  />
                )}

                {/* Reviews */}
                <ReviewSystem propertyId={property.id} lang={lang} />
              </div>

              {/* Right column (30-32%) */}
              <div className="lg:w-[31%] lg:sticky lg:top-0 space-y-4">
                <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                  
                  {/* Action buttons row */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleSave(property.id as number)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 p-2 border rounded-lg transition-all text-xs font-bold",
                        isSaved ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
                      {lang === 'th' ? 'บันทึก' : lang === 'cn' ? '收藏' : 'Save'}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-xs font-bold text-gray-600"
                    >
                      <Share2 className="w-4 h-4" />
                      {lang === 'th' ? 'แชร์' : lang === 'cn' ? '分享' : 'Share'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAsTemplate}
                      className={cn(
                        "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 border rounded-lg transition-all text-[11px] sm:text-xs font-bold relative z-10 cursor-pointer pointer-events-auto",
                        isTemplateSaved
                          ? "bg-green-50 border-green-200 text-green-600"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {isTemplateSaved ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-center">{lang === 'th' ? 'บันทึกแล้ว' : 'Saved'}</span>
                        </>
                      ) : (
                        <>
                          <LayoutTemplate className="w-4 h-4" />
                          <span className="text-center">{lang === 'th' ? 'บันทึกเทมเพลต' : 'Save Template'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Owner card - hide if it's an agent repost */}
                  {!(property.isAgentRepost || property.agentId || isRepostMode) ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="w-10 h-10 bg-blue-600 flex items-center justify-center font-black text-white text-sm rounded-xl">
                        MA
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm leading-none mb-1">Mock Agent</p>
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-blue-500" />
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                            {lang === 'th' ? 'นายหน้าดูแลแบบ 1:1' : '1:1 Authorized Agent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                   {/* Action Buttons Row - Compact & Simple UI */}
                    <div className="flex gap-2 w-full mt-4">
                      {/* Agent Delegation / Repost Button (Purple/Green) - ONLY FOR AGENTS */}
                      {userRole === 'agent' && (
                        isDelegationActive ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRepost();
                            }}
                            className="flex-1 px-2 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer pointer-events-auto"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            {lang === 'th' ? 'รีโพสต์' : lang === 'cn' ? '重新发布' : 'Repost'}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowDelegationModal(true);
                            }}
                            className="flex-1 px-2 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer pointer-events-auto"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {lang === 'th' ? 'ขอสิทธิ์นายหน้า' : lang === 'cn' ? '申请代理权' : 'Agent Rights'}
                          </button>
                        )
                      )}

                      {/* Private Chat button (Blue) - Stretches to full-width if user is not an agent */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          requireAuthAndOnboarding('chat');
                        }}
                        className={`py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer pointer-events-auto ${
                          userRole === 'agent' ? 'flex-1 px-2' : 'w-full px-4'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {lang === 'th' ? 'ทักแชท' : lang === 'cn' ? '私信聊天' : 'Chat'}
                      </button>
                    </div>

                   {/* Find Agent Button - For Admin role only */}
                   {userRole === 'admin' && (
                     <button
                       onClick={() => {
                         onClose();
                         window.location.href = '/owner/dashboard?tab=matching';
                       }}
                       className="w-full mt-2 px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-[11px] font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5"
                     >
                       🤝 {lang === 'th' ? 'หานายหน้าหรือรับสมัครตัวแทน' : lang === 'cn' ? '寻找/招聘托管中介' : 'Find or Recruit Agent'}
                     </button>
                   )}

                  {/* Contact accordion */}
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      onClick={() => setShowContactAccordion(!showContactAccordion)}
                      className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-gray-900"
                    >
                      <span>{lang === 'th' ? 'ช่องทางติดต่ออื่น ๆ' : lang === 'cn' ? '其他联系方式' : 'Other Contact Methods'}</span>
                      <span className="text-gray-400">{showContactAccordion ? '−' : '+'}</span>
                    </button>
                    {showContactAccordion && (
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={() => setShowViewingScheduler(true)}
                          className="w-full flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-xs font-bold text-gray-700"
                        >
                          <CalendarDays className="w-4 h-4" />
                          {lang === 'th' ? 'นัดดูห้อง' : lang === 'cn' ? '预约看房' : 'Schedule Viewing'}
                        </button>
                        <button
                          onClick={() => requireAuthAndOnboarding('book')}
                          className="w-full flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-xs font-bold text-gray-700"
                        >
                          <CalendarDays className="w-4 h-4" />
                          {lang === 'th' ? 'จอง' : lang === 'cn' ? '预订' : 'Book'}
                        </button>
                        <button
                          onClick={() => requireAuthAndOnboarding('chat')}
                          className="w-full flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-xs font-bold text-gray-700"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {lang === 'th' ? 'แชท' : lang === 'cn' ? '聊天' : 'Chat'}
                        </button>
                        <button className="w-full flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-xs font-bold text-gray-700">
                          <Phone className="w-4 h-4" />
                          {lang === 'th' ? 'โทร' : lang === 'cn' ? '电话' : 'Call'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom padding for mobile bar */}
            <div className="h-4 sm:h-0" />
          </div>
        </div>

        {/* ── Mobile bottom bar ── */}
        <div className="sm:hidden shrink-0 bg-white border-t border-gray-100 p-3 flex gap-2 safe-area-bottom">
          <Button onClick={() => requireAuthAndOnboarding('chat')} className="flex-1 bg-primary text-white h-12 font-black text-sm rounded-xl shadow-none flex items-center justify-center gap-1.5"><MessageCircle className="w-4 h-4" />{lang === 'th' ? 'แชทส่วนตัว' : lang === 'cn' ? '私信' : 'Chat'}</Button>
          <Button onClick={() => requireAuthAndOnboarding('book')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12 font-black text-sm rounded-xl shadow-none flex items-center justify-center gap-1.5"><CalendarDays className="w-4 h-4" />{lang === 'th' ? 'จองห้องพัก' : lang === 'cn' ? '预订' : 'Book'}</Button>
        </div>
      </div>

      <TransactionVerificationModal
        open={showKyc}
        onClose={() => setShowKyc(false)}
        onVerify={() => {
          setShowBookingForm(true);
        }}
        transactionType="booking"
      />

      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // After auth, they might need onboarding
          if (pendingAction) {
            requireAuthAndOnboarding(pendingAction);
          }
        }}
      />

      <OnboardingModal
        open={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={() => {
          if (pendingAction) {
            executePendingAction(pendingAction);
          }
        }}
      />

      <DepositCheckoutModal
        open={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        property={property}
        lang={lang}
        currency={currency}
      />

      {showBookingForm && (
        <BookingForm
          property={{ id: property.id as number, name: property.name, price: property.price, type: property.type }}
          onClose={() => setShowBookingForm(false)}
          lang={lang}
          currency={currency}
        />
      )}

      {showViewingScheduler && (
        <ViewingScheduler
          property={property}
          lang={lang}
          onClose={() => setShowViewingScheduler(false)}
        />
      )}

      {/* Agent Delegation Modal — e-sign before repost */}
      <AgentDelegationModal
        open={showDelegationModal}
        onClose={() => setShowDelegationModal(false)}
        property={property}
        lang={lang}
        viewOnly={false}
        onSignComplete={() => {
          setIsDelegationActive(true);
          toast({
            title: lang === 'th' ? '✅ เซ็นสัญญาสำเร็จ' : 'Signed Successfully',
            description: lang === 'th'
              ? 'คุณได้รับสิทธิ์นายหน้า 1:1 แล้ว — กดรีโพสต์ประกาศนี้ได้ทันที'
              : 'You now have 1:1 agent rights — you can repost this listing now'
          });
        }}
      />
    </div>
  );
};
