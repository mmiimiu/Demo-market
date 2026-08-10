'use client';

import React from 'react';
import { Building2, Search, Filter, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ManagedPropertyItem {
  id: string | number;
  name: string;
  roomNo?: string;
  tenantName?: string;
  ownerName?: string;
  agentName?: string;
  statusStep: 'showing' | 'booking' | 'checklist' | 'active';
  statusLabel: string;
  statusColor: string;
}

interface MultiPropertySelectorProps {
  lang: 'th' | 'en' | 'cn';
  role: 'tenant' | 'agent' | 'owner';
  properties: ManagedPropertyItem[];
  selectedPropertyId: string | number;
  onSelectProperty: (id: string | number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStep: string;
  onFilterStepChange: (step: string) => void;
}

export function MultiPropertySelector({
  lang, role, properties, selectedPropertyId, onSelectProperty,
  searchTerm, onSearchChange, filterStep, onFilterStepChange
}: MultiPropertySelectorProps) {
  const isThai = lang === 'th';
  
  const filtered = properties.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.roomNo && p.roomNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.tenantName && p.tenantName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchFilter = filterStep === 'all' || p.statusStep === filterStep;
    return matchSearch && matchFilter;
  });

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h4 className="font-bold text-gray-900 text-sm">
            {isThai ? `เลือกห้องที่ต้องการติดตาม (${properties.length} รายการ)` : `Select Managed Unit (${properties.length})`}
          </h4>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={isThai ? "ค้นหาเลขห้อง, ชื่อ..." : "Search room/name..."}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={filterStep}
            onChange={(e) => onFilterStepChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white text-gray-700"
          >
            <option value="all">{isThai ? 'ทุกสถานะ' : 'All Status'}</option>
            <option value="showing">{isThai ? 'นัดดูห้อง' : 'Showing'}</option>
            <option value="booking">{isThai ? 'จอง/มัดจำ' : 'Booking'}</option>
            <option value="checklist">{isThai ? 'ตรวจรับห้อง' : 'Checklist'}</option>
            <option value="active">{isThai ? 'เช่าอยู่ปัจจุบัน' : 'Active Lease'}</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {filtered.map((item) => {
          const isSelected = item.id === selectedPropertyId;
          return (
            <button
              key={item.id}
              onClick={() => onSelectProperty(item.id)}
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border",
                isSelected
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-white text-gray-700 border-slate-200 hover:border-primary/40 hover:bg-slate-50"
              )}
            >
              <div className="text-left">
                <p className="font-extrabold line-clamp-1">{item.roomNo ? `ห้อง ${item.roomNo}` : item.name}</p>
                <p className={cn("text-[10px] font-normal", isSelected ? "text-blue-100" : "text-gray-400")}>
                  {role === 'agent' ? `ผู้เช่า: ${item.tenantName || 'N/A'}` : role === 'owner' ? `Agent: ${item.agentName || 'ดูแลเอง'}` : item.name}
                </p>
              </div>
              <Badge className={cn("text-[9px] px-1.5 py-0.5 font-bold border-none", item.statusColor)}>
                {item.statusLabel}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
