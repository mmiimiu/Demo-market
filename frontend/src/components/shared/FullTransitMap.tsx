"use client";

import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { MapPin, Search, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Input } from '@/components/ui/input';

const HOTSPOTS = [
  { id: 'siam', name: 'Siam (CEN)', x: 48, y: 52, lines: ['Sukhumvit', 'Silom'] },
  { id: 'asok', name: 'Asok (E4)', x: 58, y: 55, lines: ['Sukhumvit', 'MRT Blue'] },
  { id: 'mochit', name: 'Mo Chit (N8)', x: 45, y: 35, lines: ['Sukhumvit', 'MRT Blue'] },
  { id: 'phayathai', name: 'Phaya Thai (N2)', x: 45, y: 48, lines: ['Sukhumvit', 'Airport Link'] },
];

export function FullTransitMap() {
  const [search, setSearch] = useState('');

  return (
    <div className="relative w-full h-[600px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
      {/* Map Controls & Search overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-white p-2 rounded-xl shadow-lg flex items-center gap-2 pointer-events-auto w-full max-w-sm border border-slate-100">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stations (e.g. Asok, Siam)..." 
            className="border-none shadow-none focus-visible:ring-0 px-2"
          />
        </div>
      </div>

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <>
            {/* Zoom Controls Overlay */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 pointer-events-auto">
              <button onClick={() => zoomIn()} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                <ZoomIn className="w-5 h-5" />
              </button>
              <button onClick={() => zoomOut()} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                <ZoomOut className="w-5 h-5" />
              </button>
              <button onClick={() => resetTransform()} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors mt-2">
                <Maximize className="w-5 h-5" />
              </button>
            </div>

            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
              <div className="relative w-[1200px] h-[1200px] bg-[#f8f9fa] flex items-center justify-center">
                {/* 
                  In a real app, this would be: 
                  <img src="/transit-map-highres.jpg" alt="Bangkok Mass Transit" className="w-full h-auto" /> 
                */}
                <div className="absolute inset-0 bg-[url('https://www.bkk-guide.com/wp-content/uploads/2022/01/Bangkok-Mass-Transit-Map-1.jpg')] bg-contain bg-no-repeat bg-center opacity-80" />
                
                {/* Example Hotspots overlaid on the map */}
                {HOTSPOTS.filter(h => h.name.toLowerCase().includes(search.toLowerCase())).map((hotspot) => (
                  <div 
                    key={hotspot.id}
                    className="absolute group cursor-pointer"
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                  >
                    <div className="w-6 h-6 bg-white rounded-full shadow-md border-4 border-blue-500 flex items-center justify-center animate-bounce-slow">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                      <p className="font-bold">{hotspot.name}</p>
                      <p className="text-slate-300 text-[10px]">{hotspot.lines.join(' • ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
