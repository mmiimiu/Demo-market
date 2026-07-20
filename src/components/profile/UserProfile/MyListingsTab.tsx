'use client';

import React from 'react';
import { useListings } from '../PublicProfileModal/useListings';
import { ListingCard } from '../PublicProfileModal/ListingCard';
import { useUser, useFirestore } from '@/firebase';
import { Language } from '@/lib/types';
import { mockProperties } from '@/lib/properties';

export function MyListingsTab({ lang }: { lang: Language }) {
  const { user } = useUser();
  const db = useFirestore();
  const isTh = lang === 'th';
  const [subTab, setSubTab] = React.useState<'all' | 'published' | 'drafts' | 'templates'>('all');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteMultiple = () => {
    if (window.confirm(isTh ? 'ยืนยันการลบเทมเพลตที่เลือก?' : 'Confirm delete selected templates?')) {
      const stored = localStorage.getItem('primerent_mock_properties');
      if (stored) {
        let list = JSON.parse(stored);
        list = list.filter((p: any) => !selectedIds.includes(p.id));
        localStorage.setItem('primerent_mock_properties', JSON.stringify(list));
        window.location.reload();
      }
    }
  };

  const mockProfileData = React.useMemo(() => {
    if (!user) return null;
    return {
      uid: user.uid,
      displayName: user.displayName || 'Me',
      photoURL: user.photoURL || '',
      email: user.email || '',
      role: (user.isMock ? (localStorage.getItem('primerent_user_role') || 'owner') : 'owner') as any,
      kycStatus: 'verified' as const,
      location: '',
      bio: ''
    };
  }, [user]);

  const { displayListings } = useListings(mockProfileData, db);

  // Always show at least one listing from mockProperties as fallback
  const displayListingsWithFallback = React.useMemo(() => {
    if (displayListings.length > 0) {
      return displayListings;
    }
    return [mockProperties[0]];
  }, [displayListings]);

  const filteredListings = React.useMemo(() => {
    return displayListingsWithFallback.filter((item: any) => {
      if (subTab === 'all') return true;
      if (subTab === 'templates') return item.isTemplate === true;
      if (subTab === 'drafts') return item.status === 'draft' && !item.isTemplate;
      if (subTab === 'published') return item.status !== 'draft' && !item.isTemplate;
      return true;
    });
  }, [displayListingsWithFallback, subTab]);

  return (
    <div className="space-y-6 font-thai animate-in fade-in slide-in-from-right-4 duration-500 bg-white">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
          <h4 className="font-black text-gray-800 text-lg">
            {isTh ? 'ประวัติการลงประกาศ' : 'My Listings'}
          </h4>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            {isTh ? 'ดูแลและจัดการรายการประกาศที่พักทั้งหมดของคุณ' : 'View and manage all your posted property listings.'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto">
        <button onClick={() => setSubTab('all')} className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${subTab === 'all' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
          {isTh ? 'ทุกประกาศ' : 'All'}
        </button>
        <button onClick={() => setSubTab('published')} className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${subTab === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
          {isTh ? 'เผยแพร่แล้ว' : 'Published'}
        </button>
        <button onClick={() => setSubTab('drafts')} className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${subTab === 'drafts' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
          {isTh ? 'ฉบับร่าง' : 'Drafts'}
        </button>
        <button onClick={() => setSubTab('templates')} className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${subTab === 'templates' ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
          {isTh ? 'เทมเพลต' : 'Templates'}
        </button>
      </div>

      {subTab === 'templates' && selectedIds.length > 0 && (
        <div className="flex justify-end mb-2">
          <button 
            onClick={handleDeleteMultiple}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-lg flex items-center gap-2 transition-all"
          >
            ❌ {isTh ? 'ลบที่เลือก' : 'Delete Selected'} ({selectedIds.length})
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredListings.length > 0 ? filteredListings.map((item: any) => (
          <div key={item.id} className="relative group">
            {subTab === 'templates' && (
              <div className="absolute top-3 right-3 z-10 bg-white/80 p-1.5 rounded-lg backdrop-blur-sm shadow-sm border border-gray-100/50">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(item.id)} 
                  onChange={() => toggleSelect(item.id)} 
                  className="w-5 h-5 accent-red-500 cursor-pointer block" 
                />
              </div>
            )}
            <div className={subTab === 'templates' && selectedIds.includes(item.id) ? 'opacity-70 ring-2 ring-red-500 rounded-xl transition-all' : 'transition-all'}>
              <ListingCard item={item} lang={lang} />
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-sm font-bold text-gray-400">
              {isTh ? 'ไม่พบรายการในหมวดหมู่นี้' : 'No listings found in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
