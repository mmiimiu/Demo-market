import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ListingCard } from './ListingCard';
import { Language } from '@/lib/types';

interface ListingsTabProps {
  profileData: any;
  displayListings: any[];
  recommendedListings: any[];
  isTh: boolean;
  lang: Language;
}

export function ListingsTab({ profileData, displayListings, recommendedListings, isTh, lang }: ListingsTabProps) {
  return (
    <TabsContent value="listings" className="flex-1 overflow-y-auto p-5 m-0">
      {profileData.role !== 'renter' ? (
        displayListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayListings.map((item: any) => <ListingCard key={item.id} item={item} lang={lang} />)}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400 font-bold">
            {isTh ? 'ไม่มีรายการประกาศ' : 'No listings'}
          </div>
        )
      ) : (
        recommendedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedListings.map((item: any) => <ListingCard key={item.id} item={item} lang={lang} isMatch />)}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400 font-bold">
            {isTh ? 'ไม่พบห้องแนะนำที่ตรง' : 'No matching recommendations'}
          </div>
        )
      )}
    </TabsContent>
  );
}
