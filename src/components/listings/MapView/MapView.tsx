/**
 * MapView Component
 * Renders a visually rich mock map showing properties and nearby BTS/MRT stations.
 * Includes interactive pins that open a mini property card details.
 */

'use client';

import React, { useState } from 'react';
import { Property, Language } from '@/lib/types';
import { MapPin, ZoomIn, ZoomOut, Compass, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MapViewProps {
  properties: Property[];
  lang: Language;
  currency: 'THB' | 'USD' | 'CNY';
  onViewDetails: (property: Property) => void;
}

export function MapView({ properties, lang, currency, onViewDetails }: MapViewProps) {
  const isTh = lang === 'th';
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [zoomLevel, setZoomLevel] = useState(13);

  const symbols = { THB: '฿', USD: '$', CNY: '¥' };
  const rates = { THB: 1, USD: 0.028, CNY: 0.20 };
  const symbol = symbols[currency];

  // Simulated BTS/MRT stations nearby
  const stations = [
    { name: isTh ? 'BTS อโศก' : 'BTS Asoke', x: 45, y: 52 },
    { name: isTh ? 'MRT สุขุมวิท' : 'MRT Sukhumvit', x: 47, y: 48 },
    { name: isTh ? 'BTS สยาม' : 'BTS Siam', x: 22, y: 35 },
    { name: isTh ? 'BTS อารีย์' : 'BTS Ari', x: 30, y: 15 },
    { name: isTh ? 'BTS พระราม 9' : 'BTS Rama 9', x: 65, y: 28 },
  ];

  // Helper to map properties to positions (deterministic mock layout)
  const getPosition = (id: string | number) => {
    const numId = typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) || 5 : id;
    const x = 15 + ((numId * 17) % 70);
    const y = 20 + ((numId * 13) % 60);
    return { x, y };
  };

  return (
    <div className="relative w-full h-[650px] bg-slate-50 border border-slate-200 overflow-hidden rounded-2xl shadow-inner group">
      {/* ── Mock Vector Grid Map (Visual Canvas) ─────────────────────────────────── */}
      <div className="absolute inset-0 select-none bg-[#F1F5F9] transition-transform duration-300" style={{ transform: `scale(${1 + (zoomLevel - 13) * 0.1})` }}>
        {/* Roads & Blocks */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Mock Roads */}
        <div className="absolute left-[45%] top-0 bottom-0 w-8 bg-white border-x border-slate-200" />
        <div className="absolute left-0 right-0 top-[50%] h-8 bg-white border-y border-slate-200" />
        <div className="absolute left-0 right-0 top-[25%] h-6 bg-white opacity-80 border-y border-slate-200" />
        <div className="absolute left-[20%] top-0 bottom-0 w-6 bg-white opacity-80 border-x border-slate-200" />

        {/* River/Canal */}
        <div className="absolute left-0 right-0 top-[80%] h-12 bg-sky-100 border-y border-sky-200 flex items-center justify-center">
          <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">{isTh ? 'คลองแสนแสบ' : 'Khlong Saen Saep'}</span>
        </div>

        {/* Green Parks */}
        <div className="absolute left-[5%] top-[5%] w-32 h-32 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{isTh ? 'สวนสาธารณะ' : 'Park'}</span>
        </div>

        {/* ── BTS Stations ── */}
        {stations.map((st, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
            style={{ left: `${st.x}%`, top: `${st.y}%` }}
          >
            <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow flex items-center justify-center text-[8px] font-black text-white">
              🚇
            </div>
            <span className="bg-white/90 border border-green-200 px-1.5 py-0.5 rounded text-[8px] font-black text-green-700 shadow-sm whitespace-nowrap">
              {st.name}
            </span>
          </div>
        ))}

        {/* ── Property Pins ── */}
        {properties.map((p) => {
          const { x, y } = getPosition(p.id);
          const isSelected = selectedProp?.id === p.id;
          const displayPrice = Math.round(p.price * rates[currency]);

          return (
            <button
              key={p.id}
              onClick={() => setSelectedProp(p)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group/pin z-20 flex flex-col items-center gap-0.5 cursor-pointer transition-all active:scale-95"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Tooltip price bubble */}
              <div className={`px-2 py-1 rounded-xl text-[10px] font-black shadow-md border transition-all ${
                isSelected 
                  ? 'bg-blue-600 border-blue-600 text-white scale-110 z-30'
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 group-hover/pin:scale-105'
              }`}>
                {symbol}{displayPrice.toLocaleString()}
              </div>
              <MapPin className={`w-5 h-5 transition-colors ${
                isSelected ? 'text-blue-600 fill-blue-100' : 'text-rose-500 fill-rose-100 group-hover/pin:text-rose-600'
              }`} />
            </button>
          );
        })}
      </div>

      {/* ── Map Navigation Controls (Top Right) ─────────────────────────────── */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-40 bg-white p-1 rounded-xl shadow-lg border border-slate-200">
        <Button size="icon" variant="ghost" onClick={() => setZoomLevel(prev => Math.min(18, prev + 1))} className="w-8 h-8 rounded-lg">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setZoomLevel(prev => Math.max(10, prev - 1))} className="w-8 h-8 rounded-lg">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg">
          <Compass className="w-4 h-4 animate-spin-slow text-slate-400" />
        </Button>
      </div>

      {/* ── Mini Card Preview (Bottom Left) ─────────────────────────────────── */}
      {selectedProp && (
        <div className="absolute bottom-4 left-4 z-40 w-80 animate-in slide-in-from-bottom-4 duration-300">
          <Card className="rounded-2xl border-none shadow-2xl overflow-hidden relative bg-white">
            <button
              onClick={() => setSelectedProp(null)}
              className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white text-xs font-black"
            >
              ✕
            </button>
            <div className="relative h-32 bg-slate-200">
              <img
                src={selectedProp.img || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'}
                alt={selectedProp.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                {symbol}{Math.round(selectedProp.price * rates[currency]).toLocaleString()} / {isTh ? 'เดือน' : 'mo'}
              </div>
            </div>
            <CardContent className="p-3.5 space-y-1 bg-white">
              <h5 className="font-black text-xs text-slate-800 line-clamp-1">
                {isTh ? selectedProp.name : selectedProp.nameEn}
              </h5>
              <p className="text-[10px] text-slate-400 font-bold line-clamp-1">
                📍 {isTh ? selectedProp.location : selectedProp.locationEn}
              </p>
              <div className="flex gap-2 text-[9px] text-slate-500 font-bold pt-1.5 border-t border-dashed">
                <span>🛏️ {selectedProp.bed} {isTh ? 'ห้องนอน' : 'Bed'}</span>
                <span>🛁 {selectedProp.bath} {isTh ? 'ห้องน้ำ' : 'Bath'}</span>
                <span>📐 {selectedProp.sqm} ตร.ม.</span>
              </div>
              <Button
                onClick={() => onViewDetails(selectedProp)}
                className="w-full mt-2 h-8 text-[10px] font-black rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                {isTh ? 'ดูรายละเอียดประกาศ' : 'View Details'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
