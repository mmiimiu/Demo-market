"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Building, GraduationCap, Stethoscope, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lang } from "./types";

interface MetroMapSectionProps {
  lang: Lang;
}

const STATIONS = [
  { id: "siam", name: "Siam", nameTh: "สยาม", line: "BTS-Silom/Sukhumvit", x: 50, y: 50, listings: 342, price: "฿25k" },
  { id: "asok", name: "Asok", nameTh: "อโศก", line: "BTS-Sukhumvit", x: 70, y: 50, listings: 512, price: "฿20k" },
  { id: "phrom-phong", name: "Phrom Phong", nameTh: "พร้อมพงษ์", line: "BTS-Sukhumvit", x: 80, y: 50, listings: 430, price: "฿35k" },
  { id: "silom", name: "Silom", nameTh: "สีลม", line: "MRT-Blue", x: 50, y: 70, listings: 210, price: "฿22k" },
  { id: "sukhumvit", name: "Sukhumvit", nameTh: "สุขุมวิท", line: "MRT-Blue", x: 70, y: 50, listings: 280, price: "฿20k" },
  { id: "rama9", name: "Phra Ram 9", nameTh: "พระราม 9", line: "MRT-Blue", x: 70, y: 20, listings: 410, price: "฿15k" },
  { id: "ari", name: "Ari", nameTh: "อารีย์", line: "BTS-Sukhumvit", x: 50, y: 20, listings: 150, price: "฿18k" },
];

export default function MetroMapSection({ lang }: MetroMapSectionProps) {
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState(15000);
  const [selectedType, setSelectedType] = useState<string>("condo");
  const [locationType, setLocationType] = useState<string>("bts");

  const topStations = STATIONS.sort((a, b) => b.listings - a.listings).slice(0, 3);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Map Area */}
      <div className="flex-1 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden relative min-h-[400px] flex items-center justify-center p-4">
        
        {/* Abstract Metro Lines SVG */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-80" preserveAspectRatio="xMidYMid meet">
          {/* BTS Line (Green) */}
          <path d="M 10,50 L 90,50" stroke="#16a34a" strokeWidth="1.5" fill="none" className="animate-[pulse_3s_ease-in-out_infinite]" />
          <path d="M 50,10 L 50,90" stroke="#16a34a" strokeWidth="1.5" fill="none" />
          {/* MRT Line (Blue) */}
          <path d="M 30,70 L 70,70 L 70,20" stroke="#2563eb" strokeWidth="1.5" fill="none" className="animate-[pulse_4s_ease-in-out_infinite]" />
          
          {/* Station Markers */}
          {STATIONS.map((st) => (
            <g 
              key={st.id} 
              className="cursor-pointer transition-transform hover:scale-125"
              onMouseEnter={() => setHoveredStation(st.id)}
              onMouseLeave={() => setHoveredStation(null)}
            >
              <circle cx={st.x} cy={st.y} r="2.5" fill="white" stroke={st.line.includes("BTS") ? "#16a34a" : "#2563eb"} strokeWidth="1" />
              {hoveredStation === st.id && (
                <g>
                  <rect x={st.x - 12} y={st.y - 12} width="24" height="8" rx="2" fill="white" className="shadow-lg" />
                  <text x={st.x} y={st.y - 6} fontSize="3.5" textAnchor="middle" fill="#1e293b" fontWeight="bold">
                    {lang === 'th' ? st.nameTh : st.name}
                  </text>
                  <text x={st.x} y={st.y - 2.5} fontSize="2.5" textAnchor="middle" fill="#64748b">
                    {st.listings} units
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="flex items-center text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5" /> BTS
          </span>
          <span className="flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" /> MRT
          </span>
        </div>
      </div>

      {/* Filter & Controls Area */}
      <div className="w-full lg:w-[320px] shrink-0 space-y-4">
        
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-xl p-5 space-y-6">
          
          {/* Quick Search */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Quick Filters</h3>
            
            {/* Location Type */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "bts", label: "Near BTS", icon: MapPin },
                { id: "mrt", label: "Near MRT", icon: MapPin },
                { id: "uni", label: "University", icon: GraduationCap },
                { id: "work", label: "Office Zone", icon: Briefcase }
              ].map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setLocationType(loc.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    locationType === loc.id 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <loc.icon className={`w-4 h-4 mb-1.5 ${locationType === loc.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{loc.label}</span>
                </button>
              ))}
            </div>

            {/* Price Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Max Price</span>
                <span className="text-sm font-bold text-slate-900">฿{priceRange.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="5000" max="50000" step="1000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            
            {/* Search Action */}
            <Link href={`/listings?type=${selectedType}&locType=${locationType}&maxPrice=${priceRange}`} className="block pt-2">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20">
                <Search className="w-4 h-4 mr-2" /> Show 100+ Results
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Stations */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-xl p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Popular Stations</h3>
          <div className="space-y-2">
            {topStations.map((st) => (
              <Link 
                key={st.id} 
                href={`/listings?station=${st.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
              >
                <div>
                  <div className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">
                    {lang === 'th' ? st.nameTh : st.name}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building className="w-3 h-3" /> {st.listings} units
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-blue-600">{st.price}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Avg</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
