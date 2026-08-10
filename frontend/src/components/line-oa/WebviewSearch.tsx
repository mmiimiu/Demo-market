'use client';

import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Globe, Search } from 'lucide-react';

export default function WebviewSearch() {
  const [iframeKey, setIframeKey] = useState(0); // force reload
  const targetUrl = '/';

  return (
    <div className="flex flex-col h-full space-y-0 -m-4">
      {/* Mini-browser URL bar */}
      <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0 mx-0">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
          <Globe className="w-3.5 h-3.5 text-[#06c755] shrink-0" />
          <span className="text-[10px] font-bold text-gray-600 truncate flex-1">
            rentflow.app{targetUrl}
          </span>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">LIFF</span>
        </div>
        <button
          onClick={() => setIframeKey(k => k + 1)}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          title="รีโหลด"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
        </button>
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          title="เปิดในแท็บใหม่"
        >
          <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
        </a>
      </div>

      {/* Search quick tips */}
      <div className="bg-[#06c755]/5 border-b border-[#06c755]/10 px-4 py-1.5 flex items-center gap-2">
        <Search className="w-3 h-3 text-[#06c755]" />
        <span className="text-[10px] font-bold text-[#06c755]">
          เว็บไซต์ค้นหาห้องพักเชื่อมตรงกับ LINE OA ของคุณ
        </span>
      </div>

      {/* Embedded iframe */}
      <div className="flex-1 relative" style={{ minHeight: 480 }}>
        <iframe
          key={iframeKey}
          src={targetUrl}
          title="RentFlow — ค้นหาห้องพัก"
          className="w-full h-full border-0"
          style={{ minHeight: 480 }}
          allow="geolocation"
          loading="lazy"
        />
        {/* Gradient overlay at bottom to hint scrollability */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
