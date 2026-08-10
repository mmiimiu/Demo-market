'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bed, Bath, Move, Heart, MapPin, Star, MessageCircle, Edit3, GitCompareArrows } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { translations } from '@/lib/translations';

import { PropertyCardProps } from './types';
import { PropertyStats } from './PropertyStats';
import { CommuteBadge } from './CommuteBadge';

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  lang, 
  currency,
  onViewDetails,
  isSaved,
  onToggleSave,
  onQuickChat,
  workLocation,
  onCompare,
  isInCompare,
  canCompare,
}) => {
  const t = translations[lang] || translations.th;

  const numericId = typeof property.id === 'string' ? parseInt(property.id.replace(/\D/g, '')) || 0 : property.id;
  const rating = (8.2 + (numericId % 18) / 10).toFixed(1);
  
  // Commute Calculation
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
          setCommuteInfo(getLocalCommuteFallback(numericId, workLocation));
        }
      } catch (err) {
        console.error('Error fetching commute info:', err);
        setCommuteInfo(getLocalCommuteFallback(numericId, workLocation));
      }
    };

    fetchCommute();
  }, [workLocation, property, numericId]);

  function getLocalCommuteFallback(idVal: number, destinationVal: string) {
    const cleanWork = destinationVal.trim().toLowerCase();
    const seed = (idVal + cleanWork.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 50;
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

  const rates = { THB: 1, USD: 0.028, CNY: 0.20 };
  const symbols = { THB: '฿', USD: '$', CNY: '¥' };
  const convertedPrice = Math.round(property.price * rates[currency]);
  const symbol = symbols[currency];

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(numericId);
  };

  const handleQuickChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickChat) {
      onQuickChat(property);
    }
  };

  const displayName = lang === 'en' ? property.nameEn : lang === 'cn' ? property.nameCn : property.name;
  const displayLocation = lang === 'en' ? property.locationEn : lang === 'cn' ? property.locationCn : property.location;

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors duration-200 cursor-pointer flex flex-col h-full shadow-none hover:shadow-sm"
      onClick={() => onViewDetails(property)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image 
          src={property.img} 
          alt={property.nameEn}
          fill
          data-ai-hint={property.imageHint}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <button
          onClick={handleToggleSave}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-colors backdrop-blur-md z-20",
            isSaved ? "bg-[#E51D53] text-white" : "bg-white/90 text-gray-600 hover:bg-white"
          )}
        >
          <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
        </button>

        {onQuickChat && (
          <button
            onClick={handleQuickChat}
            className="absolute top-3 left-3 p-2 rounded-full bg-[#E51D53] text-white transition-colors backdrop-blur-md z-20 hover:bg-[#D41B4D] touch-target"
          >
            <MessageCircle className="w-4 h-4 sm:w-4 sm:h-4 fill-current" />
          </button>
        )}

        <div className="absolute bottom-3 left-3">
          <Badge className="bg-gray-900/70 text-white border-none font-medium text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-wider">
            {property.type}
          </Badge>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-orange-400 fill-current" />
              <span className="text-gray-900 font-semibold text-xs">{rating}</span>
            </div>
            {property.contractStatus === 'pending_signature' && (
              <Badge className="text-[9px] font-medium text-[#E55B3C] border-[#FFE2DA] bg-[#FFF5F2] uppercase px-2 rounded-full border">
                {t.pending_sign_badge || "Pending Sign"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {property.isVerified && (
              <Badge variant="outline" className="text-[9px] font-medium text-[#1E854A] border-[#D1F7E2] bg-[#EAFDF3] uppercase px-2 rounded-full">Verified</Badge>
            )}
            {(property as any).isAgentRepost && (
              <Badge className="text-[9px] font-medium text-purple-700 border-purple-300 bg-purple-100 uppercase px-2 rounded-full border">
                Agent Verified
              </Badge>
            )}
          </div>
        </div>

        <h3 className={cn(
          "font-semibold text-base mb-2 text-gray-900 line-clamp-1 leading-tight group-hover:text-gray-700 transition-colors",
          lang === 'th' ? "font-thai" : lang === 'cn' ? "font-chinese" : "font-english"
        )}>
          {displayName}
        </h3>

        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="truncate">{displayLocation}</span>
        </div>

        <PropertyStats bed={property.bed} bath={property.bath} sqm={property.sqm} t={t} />

        <CommuteBadge commuteInfo={commuteInfo} lang={lang} />

        <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-gray-100">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold text-gray-900">{symbol}{convertedPrice.toLocaleString()}</span>
            <span className="text-[10px] font-medium text-gray-400 uppercase">{t.per_month}</span>
          </div>
          <div className="flex items-center gap-2">
            {onCompare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare(property);
                }}
                title={isInCompare ? 'นำออกจากการเปรียบเทียบ' : 'เพิ่มเพื่อเปรียบเทียบ'}
                disabled={!isInCompare && !canCompare}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed',
                  isInCompare
                    ? 'bg-[#E51D53] text-white border-[#E51D53]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
                {isInCompare
                  ? (lang === 'th' ? 'เปรียบอยู่' : 'In Compare')
                  : (lang === 'th' ? 'เปรียบ' : 'Compare')
                }
              </button>
            )}
            {property.contractStatus === 'pending_signature' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/liff/sign?contractId=contract_prop_${numericId}`;
                }}
                className="px-4 py-2 bg-[#E51D53] hover:bg-[#D41B4D] text-white font-medium text-xs rounded-full shrink-0 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {t.sign_contract_btn || "Sign Contract"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
