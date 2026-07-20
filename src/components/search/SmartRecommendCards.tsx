'use client';

/**
 * @fileOverview Smart Recommend Cards
 * UI สำหรับแสดงรายการห้องเช่าที่ได้รับการแนะนำ (AI Recommended)
 * ดึงข้อมูลคะแนนความเหมาะสมมาจาก lib/recommendation
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, MapPin, BedDouble, Bath, Square, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Language, Property } from '@/lib/types';
import { calculateRecommendationScore, type RecommendationScore, type UserPreference } from '@/lib/recommendation';

interface SmartRecommendCardsProps {
  lang: Language;
  properties: Property[];
  userPref?: UserPreference;
}

export const SmartRecommendCards: React.FC<SmartRecommendCardsProps> = ({ lang, properties, userPref }) => {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);

  useEffect(() => {
    // Default mock preference if none provided
    const pref: UserPreference = userPref || {
      preferredZones: ['Sukhumvit', 'Asoke', 'Thong Lo'],
      minBudget: 15000,
      maxBudget: 25000,
      propertyTypes: ['condo'],
      mustHaveAmenities: ['pool', 'gym']
    };

    const scored = properties.map(p => calculateRecommendationScore(p, pref));
    const sorted = scored.filter(s => s.score > 60).sort((a, b) => b.score - a.score).slice(0, 3);
    setRecommendations(sorted);
  }, [properties, userPref]);

  if (recommendations.length === 0) return null;

  return (
    <div className="my-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">
            {lang === 'th' ? 'แนะนำสำหรับคุณ' : 'Recommended for You'}
          </h2>
          <p className="text-sm font-medium text-gray-500">
            {lang === 'th' ? 'คัดเลือกจากประวัติการค้นหาและความสนใจของคุณ' : 'Curated based on your search history and preferences'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, idx) => {
          const { property, score, matchReasons } = rec;
          
          return (
            <div key={property.id || idx} className="bg-white rounded-[24px] border-2 border-gray-100 overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all group relative cursor-pointer flex flex-col">
              
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 font-black text-primary text-xs border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                {Math.round(score)}% Match
              </div>

              <div className="relative h-48 overflow-hidden">
                <img 
                  src={property.img} 
                  alt={property.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-black text-white text-lg truncate drop-shadow-md">{property.name}</h3>
                  <div className="flex items-center gap-1 text-white/90 text-xs font-medium drop-shadow-md mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{property.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-black text-primary text-xl">฿{property.price.toLocaleString()}</div>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bed}</span>
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bath}</span>
                    <span className="flex items-center gap-1"><Square className="w-3.5 h-3.5" /> {property.sqm}m²</span>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="space-y-2 flex-1">
                  {matchReasons.slice(0, 2).map((reason, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {reason}
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-gray-400 group-hover:text-primary transition-colors">
                  {lang === 'th' ? 'ดูรายละเอียด' : 'View Details'}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
