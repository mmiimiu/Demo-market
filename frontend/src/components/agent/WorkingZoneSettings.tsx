'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Clock, Crosshair, Map, CheckCircle2 } from 'lucide-react';

interface WorkingZone {
  id: string;
  name: string;
  type: 'bts_mrt' | 'district' | 'custom_radius';
  radiusKm: number;
  isActive: boolean;
  schedule: {
    days: string[]; // 'Mon', 'Tue', etc.
    timeStart: string;
    timeEnd: string;
  };
}

export function WorkingZoneSettings({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const isThai = lang === 'th';
  
  const [zones, setZones] = useState<WorkingZone[]>([
    {
      id: 'z1',
      name: 'BTS อโศก (Asok)',
      type: 'bts_mrt',
      radiusKm: 3,
      isActive: true,
      schedule: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        timeStart: '09:00',
        timeEnd: '18:00'
      }
    },
    {
      id: 'z2',
      name: 'เขตบางนา (Bangna)',
      type: 'district',
      radiusKm: 5,
      isActive: true,
      schedule: {
        days: ['Sat', 'Sun'],
        timeStart: '10:00',
        timeEnd: '20:00'
      }
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(5);

  const toggleZoneStatus = (id: string) => {
    setZones(zones.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));
  };

  const deleteZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const handleAddZone = () => {
    if (!newZoneName.trim()) return;
    
    setZones([...zones, {
      id: `z${Date.now()}`,
      name: newZoneName,
      type: 'custom_radius',
      radiusKm: newZoneRadius,
      isActive: true,
      schedule: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        timeStart: '09:00',
        timeEnd: '18:00'
      }
    }]);
    
    setNewZoneName('');
    setNewZoneRadius(5);
    setShowAddForm(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto py-2 font-thai">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: List of Zones */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" /> โซนของคุณ ({zones.length})
            </h2>
            <button 
              onClick={() => setShowAddForm(true)}
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {zones.map((zone) => (
              <div 
                key={zone.id} 
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer shadow-sm relative overflow-hidden group
                  ${zone.isActive ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50'}`}
              >
                {/* Active Indicator Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${zone.isActive ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                
                <div className="pl-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-black text-sm sm:text-base ${zone.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {zone.name}
                    </h3>
                    
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => toggleZoneStatus(zone.id)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${zone.isActive ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${zone.isActive ? 'left-5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                  
                  <div className={`flex items-center gap-3 text-xs font-medium mt-1.5 ${zone.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                    <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-md text-[10.5px]">
                      <Crosshair className="w-3.5 h-3.5 text-blue-500" /> รัศมี {zone.radiusKm} km
                    </span>
                  </div>
                  
                  <div className={`flex items-start gap-1.5 mt-2 text-xs font-medium ${zone.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                    <Clock className="w-3.5 h-3.5 mt-0.5 text-orange-500" /> 
                    <div>
                      <div className="flex flex-wrap gap-0.5 mb-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                          <span key={d} className={`text-[8px] sm:text-[9px] uppercase font-bold px-1 py-0.5 rounded ${zone.schedule.days.includes(d) ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-400'}`}>
                            {d}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px]">{zone.schedule.timeStart} - {zone.schedule.timeEnd}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteZone(zone.id)}
                    className="absolute bottom-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Map & Form */}
        <div className="lg:col-span-2">
          {showAddForm ? (
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-150 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-gray-900">เพิ่มโซนรับงานใหม่</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ค้นหาสถานที่ (เช่น ชื่อเขต, BTS, โครงการ)</label>
                  <input 
                    type="text" 
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-xs"
                    placeholder="เช่น BTS เอกมัย, เขตวัฒนา"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    กำหนดรัศมีการรับงาน (กิโลเมตร): <span className="text-blue-600 text-sm font-black">{newZoneRadius} km</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" max="50" 
                    value={newZoneRadius}
                    onChange={(e) => setNewZoneRadius(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                    <span>1 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>
                
                {/* Visual Map Placeholder */}
                <div className="w-full h-44 bg-slate-100 rounded-xl border-2 border-slate-200 border-dashed flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20 mix-blend-multiply"></div>
                  
                  {/* Mock Radar Animation */}
                  {newZoneName.trim() && (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 relative z-20">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-400/20 rounded-full animate-ping" style={{ width: `${newZoneRadius * 8}px`, height: `${newZoneRadius * 8}px`, transition: 'all 0.3s ease' }}></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-400/10 border border-blue-400/30 rounded-full" style={{ width: `${newZoneRadius * 8}px`, height: `${newZoneRadius * 8}px`, transition: 'all 0.3s ease' }}></div>
                    </div>
                  )}
                  
                  {!newZoneName.trim() && (
                    <div className="text-center text-slate-400 font-bold flex flex-col items-center text-xs">
                      <Map className="w-6 h-6 mb-1 opacity-50" />
                      กรุณาค้นหาสถานที่เพื่อแสดงแผนที่
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2 justify-end">
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg font-bold text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    onClick={handleAddZone}
                    disabled={!newZoneName.trim()}
                    className="px-4 py-2 rounded-lg font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> บันทึกโซนรับงาน
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[280px] bg-slate-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1.5">คุณมี {zones.length} โซนที่ใช้งานอยู่</h3>
              <p className="text-gray-400 text-xs font-medium max-w-sm mb-4">
                การตั้งค่าโซนรับงานหลายๆ ที่ จะช่วยให้ระบบจับคู่งานที่ใกล้ตัวคุณที่สุดได้อย่างแม่นยำ เพิ่มโอกาสในการรับงานจาก Owner มากขึ้น
              </p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md shadow-blue-600/20 transition-all text-xs hover:-translate-y-0.5"
              >
                + เพิ่มโซนรับงานใหม่
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
