'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { mockProperties } from '@/lib/properties';
import { PropertyCard } from '@/components/listings';
import { PropertyModal } from '@/components/PropertyModal';
import type { Property } from '@/lib/types';

export function SavedPropertiesTab() {
  const { lang, currency, savedIds, toggleSave, workLocation } = useApp();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const isTh = lang === 'th';

  // Filter properties that are saved
  const savedProperties = mockProperties.filter((p) => savedIds.includes(p.id as number));

  return (
    <div className="space-y-6 font-thai animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <div>
          <h4 className="font-black text-gray-800 text-lg">
            {isTh ? 'ที่พักที่บันทึกไว้' : 'Saved Properties'}
          </h4>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            {isTh
              ? 'รายการที่พักทั้งหมดที่คุณกดถูกใจไว้'
              : 'All properties you have favorited.'}
          </p>
        </div>
      </div>

      {savedProperties.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-none text-gray-400 font-bold space-y-4">
          <Heart className="w-12 h-12 mx-auto text-gray-300" />
          <p className="text-sm">
            {isTh ? 'ยังไม่มีที่พักที่บันทึกไว้' : 'No saved properties yet'}
          </p>
          <p className="text-xs text-gray-400 leading-normal max-w-xs mx-auto">
            {isTh
              ? 'คุณสามารถบันทึกที่พักได้โดยการคลิกไอคอนหัวใจที่มุมของรูปภาพที่พักที่คุณสนใจ'
              : 'Click the heart icon on any property to save it to your wishlist.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              lang={lang}
              currency={currency}
              isSaved={true}
              onToggleSave={toggleSave}
              onViewDetails={(prop) => setSelectedProperty(prop)}
              workLocation={workLocation}
            />
          ))}
        </div>
      )}

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          lang={lang}
          currency={currency}
          isSaved={savedIds.includes(selectedProperty.id as number)}
          onToggleSave={toggleSave}
          workLocation={workLocation}
        />
      )}
    </div>
  );
}
