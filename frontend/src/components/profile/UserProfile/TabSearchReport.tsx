'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface SearchItem {
  id: string;
  query: string;
  priceMin: number;
  priceMax: number;
  savedAt: string;
}

export function TabSearchReport({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const [history, setHistory] = useState<SearchItem[]>([]);
  const router = useRouter();
  const isTh = lang === 'th';

  useEffect(() => {
    try {
      const raw = localStorage.getItem('primerent_saved_searches');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistory(parsed.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));
        }
      }
    } catch (e) { console.error(e); }
  }, []);

  const handleClearAll = () => {
    localStorage.setItem('primerent_saved_searches', JSON.stringify([]));
    setHistory([]);
    toast({ title: isTh ? 'ล้างประวัติทั้งหมดสำเร็จ' : 'Cleared all history' });
  };

  const handleDeleteItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem('primerent_saved_searches', JSON.stringify(updated));
    setHistory(updated);
    toast({ title: isTh ? 'ลบรายการสำเร็จ' : 'Item deleted' });
  };

  const handleRunSearch = (item: SearchItem) => {
    const params = new URLSearchParams();
    if (item.query) params.set('q', item.query);
    if (item.priceMin > 0) params.set('priceMin', String(item.priceMin));
    if (item.priceMax < 150000) params.set('priceMax', String(item.priceMax));
    router.push(`/listings?${params.toString()}`);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543} ${d.toTimeString().slice(0, 5)}`;
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed rounded-2xl text-gray-400 space-y-3 bg-white">
        <Clock className="w-12 h-12 mx-auto text-gray-300" />
        <p className="text-sm font-bold">{isTh ? 'ยังไม่มีประวัติการค้นหา' : 'No search history yet'}</p>
        <p className="text-xs text-gray-400 max-w-xs mx-auto">
          {isTh ? 'เริ่มค้นหาห้องพักบนหน้าหลักเพื่อให้ประวัติปรากฏที่นี่' : 'Search properties from the homepage to see history here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base">
            {isTh ? 'ประวัติการค้นหา' : 'Search History'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {isTh ? 'ประวัติคำค้นหาล่าสุดของคุณที่เคยค้นหาบนระบบ' : 'Your recent search queries on the platform'}
          </p>
        </div>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 text-xs font-bold text-red-500 border border-red-200 bg-red-50/60 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {isTh ? 'ล้างประวัติทั้งหมด' : 'Clear all'}
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between gap-4 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-medium text-sm text-gray-900 truncate">
                {item.query || (isTh ? 'ค้นหาทั้งหมด' : 'All')}
              </span>
              <span className="text-xs text-gray-400 shrink-0">
                {formatDate(item.savedAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleRunSearch(item)}
                className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {isTh ? 'ค้นหาอีกครั้ง' : 'Search again'}
              </button>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title={isTh ? 'ลบ' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
