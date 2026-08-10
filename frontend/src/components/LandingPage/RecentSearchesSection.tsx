'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Search } from 'lucide-react';
import { Lang } from './types';

interface SavedSearchAlert {
  id: string;
  query: string;
  categories: string[];
  priceMin: number;
  priceMax: number;
  savedAt: string;
}

interface Props {
  lang: Lang;
}

export default function RecentSearchesSection({ lang }: Props) {
  const [recent, setRecent] = useState<SavedSearchAlert[]>([]);
  const router = useRouter();
  const isTh = lang === 'th';

  useEffect(() => {
    try {
      const raw = localStorage.getItem('primerent_saved_searches');
      if (!raw) return;
      const parsed: SavedSearchAlert[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      const sorted = [...parsed]
        .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        .slice(0, 4);

      setRecent(sorted);
    } catch {
      // silently skip malformed data
    }
  }, []);

  if (recent.length === 0) return null;

  const handleClick = (item: SavedSearchAlert) => {
    const params = new URLSearchParams();
    if (item.query) params.set('q', item.query);
    if (item.categories?.length > 0 && item.categories[0] !== 'all') {
      params.set('type', item.categories[0]);
    }
    if (item.priceMin > 0) params.set('priceMin', String(item.priceMin));
    if (item.priceMax < 150000) params.set('priceMax', String(item.priceMax));
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
      <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs font-bold">{isTh ? 'ค้นหาล่าสุด:' : 'Recent:'}</span>
      </div>
      {recent.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
        >
          <Search className="w-3 h-3 shrink-0 opacity-60" />
          <span className="truncate max-w-[120px]">{item.query || (isTh ? 'ค้นหาทั้งหมด' : 'All')}</span>
          {item.priceMax < 150000 && (
            <span className="text-gray-400 font-medium">฿{(item.priceMax / 1000).toFixed(0)}K</span>
          )}
        </button>
      ))}
    </div>
  );
}
