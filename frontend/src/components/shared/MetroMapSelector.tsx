'use client';

import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { MapPin, Search, ZoomIn, ZoomOut, Maximize, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
  lines: string[];
}

const STATIONS: Station[] = [
  { id: 'siam', name: 'Siam (CEN)', x: 48, y: 52, lines: ['Sukhumvit', 'Silom'] },
  { id: 'asok', name: 'Asok (E4)', x: 58, y: 55, lines: ['Sukhumvit', 'MRT Blue'] },
  { id: 'mochit', name: 'Mo Chit (N8)', x: 45, y: 35, lines: ['Sukhumvit', 'MRT Blue'] },
  { id: 'phayathai', name: 'Phaya Thai (N2)', x: 45, y: 48, lines: ['Sukhumvit', 'Airport Link'] },
  { id: 'phromphong', name: 'Phrom Phong (E5)', x: 62, y: 56, lines: ['Sukhumvit'] },
  { id: 'thonglo', name: 'Thong Lo (E6)', x: 65, y: 58, lines: ['Sukhumvit'] },
];

interface MetroMapSelectorProps {
  mode: 'search' | 'define_zone';
  selectedStations: string[];
  onChange: (stations: string[]) => void;
  lang?: 'th' | 'en' | 'cn';
}

export function MetroMapSelector({ mode, selectedStations, onChange, lang = 'th' }: MetroMapSelectorProps) {
  const [search, setSearch] = useState('');

  const toggleStation = (id: string) => {
    if (selectedStations.includes(id)) {
      onChange(selectedStations.filter(s => s !== id));
    } else {
      onChange([...selectedStations, id]);
    }
  };

  const filteredStations = STATIONS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-gray-900">
            {mode === 'define_zone' 
              ? (lang === 'th' ? 'เลือกโซนทำการของคุณ' : 'Select Your Coverage Zone')
              : (lang === 'th' ? 'ค้นหาตามแนวรถไฟฟ้า' : 'Search by Transit Map')
            }
          </h3>
          <p className="text-sm font-medium text-gray-500">
            {mode === 'define_zone'
              ? (lang === 'th' ? 'คลิกที่สถานีเพื่อระบุพื้นที่ที่คุณรับงาน' : 'Click stations to define your working areas.')
              : (lang === 'th' ? 'คลิกเลือกสถานีที่ต้องการหาห้อง' : 'Click stations to search for rooms.')
            }
          </p>
        </div>
        {selectedStations.length > 0 && (
          <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {selectedStations.length} {lang === 'th' ? 'สถานีที่เลือก' : 'Stations Selected'}
          </div>
        )}
      </div>

      <div className="relative w-full h-[500px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
        {/* Map Controls & Search */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="bg-white p-1.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-auto w-full max-w-xs border border-slate-100">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'th' ? 'ค้นหาสถานี...' : 'Search stations...'}
              className="border-none shadow-none focus-visible:ring-0 px-2 h-8 text-sm font-bold"
            />
          </div>
        </div>

        <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit={true}>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                <div className="relative w-[800px] h-[600px] bg-slate-100/50 rounded-3xl m-8">
                  {/* Mock transit lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
                    <path d="M 360 210 L 360 312 L 464 330 L 520 348" stroke="#78d64b" strokeWidth="6" fill="none" />
                    <path d="M 360 210 L 464 330" stroke="#000" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.1" />
                  </svg>

                  {/* Stations */}
                  {filteredStations.map((station) => {
                    const isSelected = selectedStations.includes(station.id);
                    return (
                      <button
                        key={station.id}
                        type="button"
                        onClick={() => toggleStation(station.id)}
                        className={cn(
                          "absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group transition-all",
                          isSelected ? "scale-110 z-20" : "hover:scale-110 z-10"
                        )}
                        style={{ left: `${station.x}%`, top: `${station.y}%` }}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full border-4 flex items-center justify-center transition-colors shadow-sm",
                          isSelected 
                            ? "bg-primary border-white" 
                            : "bg-white border-slate-300 group-hover:border-primary"
                        )}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-black whitespace-nowrap shadow-sm backdrop-blur-sm",
                          isSelected 
                            ? "bg-primary text-white" 
                            : "bg-white/90 text-slate-700 group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          {station.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </TransformComponent>

              <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 pointer-events-auto">
                <Button variant="secondary" size="icon" className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-100 text-slate-700 hover:text-primary hover:bg-slate-50" onClick={() => zoomIn()}>
                  <ZoomIn className="w-5 h-5" />
                </Button>
                <Button variant="secondary" size="icon" className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-100 text-slate-700 hover:text-primary hover:bg-slate-50" onClick={() => zoomOut()}>
                  <ZoomOut className="w-5 h-5" />
                </Button>
                <Button variant="secondary" size="icon" className="w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-100 text-slate-700 hover:text-primary hover:bg-slate-50" onClick={() => resetTransform()}>
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
