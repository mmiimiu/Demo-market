"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Language, Property } from '@/lib/types';
import { useUser } from '@/firebase';
import { mockProperties } from '@/lib/properties';
import { CheckCircle2, MapPin, Bed, Bath, Maximize, Building, Share2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function RepostContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const router = useRouter();
  const { user } = useUser();
  const [property, setProperty] = useState<Property | null>(null);
  const [reposted, setReposted] = useState(false);
  const [lang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('primerent_lang') as Language) || 'th';
    }
    return 'th';
  });

  useEffect(() => {
    if (!propertyId) return;

    let found: Property | null = null;

    // Try localStorage first
    const stored = localStorage.getItem('primerent_mock_properties');
    if (stored) {
      const props = JSON.parse(stored);
      found = props.find((p: any) => p.id === propertyId || p.id === Number(propertyId)) || null;
    }

    // Fallback to hardcoded mock data
    if (!found) {
      found = mockProperties.find((p: any) => p.id === propertyId || p.id === Number(propertyId)) || null;
    }

    setProperty(found);
  }, [propertyId]);

  const handleRepost = () => {
    if (!property) return;

    // Create agent repost in localStorage
    const repostEntry = {
      ...property,
      id: `agent_repost_${Date.now()}`,
      originalPropertyId: property.id,
      isAgentRepost: true,
      agentId: user?.uid || 'mock_agent',
      agentName: user?.displayName || 'Agent',
      ownerId: undefined, // ลบข้อมูลเจ้าของ
      status: 'active',
      repostedAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('primerent_agent_reposts') || '[]');
    existing.push(repostEntry);
    localStorage.setItem('primerent_agent_reposts', JSON.stringify(existing));

    // Also add to mock properties so it appears in listings
    const mockList = JSON.parse(localStorage.getItem('primerent_mock_properties') || '[]');
    mockList.push(repostEntry);
    localStorage.setItem('primerent_mock_properties', JSON.stringify(mockList));

    setReposted(true);
    toast({
      title: 'รีโพสประกาศสำเร็จ!',
      description: `ประกาศ "${property.name}" ถูกรีโพสในชื่อนายหน้าของคุณแล้ว ผู้เช่าจะติดต่อคุณโดยตรง`,
    });
  };

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="text-6xl">🏠</div>
          <p className="text-gray-500 font-bold">ไม่พบข้อมูลทรัพย์สิน</p>
          <button onClick={() => router.push('/agent/dashboard/jobs')} className="text-primary font-bold underline">
            กลับไปที่หน้างาน
          </button>
        </div>
      </div>
    );
  }

  const displayName = lang === 'th' ? property.name : lang === 'cn' ? property.nameCn : property.nameEn;
  const displayLocation = lang === 'th' ? property.location : lang === 'cn' ? property.locationCn : property.locationEn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>
          <h1 className="text-sm font-black text-gray-900">รีโพสประกาศจากเจ้าของ</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="font-black text-green-800 text-base mb-1">เจ้าของอนุมัติสิทธิ์นายหน้าแล้ว!</h2>
            <p className="text-sm text-green-700 font-medium">
              คุณได้รับอนุมัติให้เป็นนายหน้าสำหรับทรัพย์สินนี้แล้ว สามารถรีโพสประกาศเพื่อหาผู้เช่าได้ทันที
              ผู้เช่าจะติดต่อคุณโดยตรงแบบ 1:1
            </p>
          </div>
        </div>

        {/* Property Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Property Image */}
          <div className="relative h-64 sm:h-80 overflow-hidden">
            <img
              src={property.img}
              alt={displayName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full">
              <span className="text-xs font-black text-primary">
                {property.type === 'condo' ? '🏢 คอนโด' : property.type === 'house' ? '🏠 บ้าน' : '🏬 อพาร์ทเมนท์'}
              </span>
            </div>
            {property.badge && (
              <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black">
                ⭐ {property.badge === 'featured' ? 'แนะนำ' : property.badge === 'hot' ? 'ยอดนิยม' : 'คัดสรร'}
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">{displayName}</h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                {displayLocation}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">฿{property.price.toLocaleString()}</span>
              <span className="text-sm font-bold text-gray-400">/เดือน</span>
            </div>

            {/* Specs */}
            <div className="flex items-center gap-4 text-sm font-bold text-gray-600 border-t border-b border-gray-100 py-3">
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-primary" />
                <span>{property.bed} ห้องนอน</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-primary" />
                <span>{property.bath} ห้องน้ำ</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4 text-primary" />
                <span>{property.sqm} ตร.ม.</span>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                    {a === 'air' ? '❄️ แอร์' : a === 'parking' ? '🅿️ ที่จอดรถ' : a === 'furnished' ? '🛋️ เฟอร์ฯ' : a === 'gym' ? '🏋️ ฟิตเนส' : a === 'pool' ? '🏊 สระว่ายน้ำ' : a === 'bts_mrt' ? '🚇 ใกล้ BTS/MRT' : a === 'pet' ? '🐾 เลี้ยงสัตว์' : a === 'garden' ? '🌳 สวน' : a}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="text-sm text-gray-500 leading-relaxed">
                {property.description}
              </div>
            )}

            {/* Agent Info Banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <p className="text-xs font-black text-indigo-700 mb-1">📋 เมื่อรีโพสแล้ว:</p>
              <ul className="text-xs text-indigo-600 font-medium space-y-1">
                <li>• ประกาศจะถูกโพสใหม่ในชื่อของคุณ (นายหน้า)</li>
                <li>• ผู้เช่าจะติดต่อแชทกับคุณโดยตรง แบบ 1:1</li>
                <li>• ข้อมูลเจ้าของจะไม่แสดงให้ผู้เช่าเห็น</li>
                <li>• ค่าคอมมิชชั่นจะถูกคิดตามข้อตกลงกับเจ้าของ</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 -mx-4 rounded-t-2xl shadow-lg">
          {!reposted ? (
            <button
              onClick={handleRepost}
              className="w-full bg-primary hover:bg-primary/90 text-white h-14 font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Share2 className="w-5 h-5" />
              รีโพสประกาศนี้ในชื่อนายหน้า
            </button>
          ) : (
            <div className="space-y-3">
              <div className="w-full bg-green-500 text-white h-14 font-black text-base rounded-2xl flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                รีโพสสำเร็จแล้ว!
              </div>
              <button
                onClick={() => router.push('/agent/dashboard/jobs')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 h-12 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                กลับไปที่หน้างาน
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgentRepostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <RepostContent />
    </Suspense>
  );
}
