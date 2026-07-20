'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Building2, Plus, Edit, RefreshCcw, Trash2, Clock, ShieldCheck, Rocket, Pin, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { translations } from '@/lib/translations';
import type { Property } from '@/lib/types';
import { SmartPricingTool } from '@/components/shared/SmartPricingTool';

interface OwnerListingsProps {
  lang: 'th' | 'en' | 'cn';
  properties: Property[];
  loading: boolean;
  onRenew: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (prop: Property) => void;
  onCreateClick: () => void;
  onBoost: (id: string) => void;
  onPin: (id: string) => void;
}

export function OwnerListings({
  lang, properties, loading, onRenew, onDelete, onEdit, onCreateClick, onBoost, onPin,
}: OwnerListingsProps) {
  const t = translations[lang] || translations.th;
  const isThai = lang === 'th';
  const [expandedPropId, setExpandedPropId] = useState<string | null>(null);

  const formatPropDate = (updatedAt: any) => {
    if (!updatedAt) return 'N/A';
    if (typeof updatedAt.toDate === 'function') return format(updatedAt.toDate(), 'dd MMM yyyy');
    if (typeof updatedAt === 'string') {
      try { return format(new Date(updatedAt), 'dd MMM yyyy'); } catch (e) { return 'N/A'; }
    }
    return format(new Date(), 'dd MMM yyyy');
  };

  return (
    <Card className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-black flex items-center gap-3">
          {t.my_listings}
          <Badge className="bg-[#E51D53] text-white font-black rounded-full px-3">{properties.length}</Badge>
        </CardTitle>
        <Button onClick={onCreateClick} className="bg-[#E51D53] hover:bg-[#D41B4D] font-black rounded-xl shadow-lg shadow-[#E51D53]/20 hover:scale-[1.02] transition-transform gap-2">
          <Plus className="w-4 h-4" /> {isThai ? 'สร้างประกาศ' : 'New Listing'}
        </Button>
      </CardHeader>

      <CardContent className="p-8 pt-4">
        {loading ? (
          <div className="py-20 text-center animate-pulse font-black text-gray-300 tracking-widest">LOADING...</div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center glass-card rounded-3xl border-2 border-dashed border-white/40 p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-black text-gray-700 text-lg mb-2">{isThai ? 'ยังไม่มีประกาศ' : 'No listings yet'}</p>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">
              {isThai ? 'เริ่มต้นสร้างประกาศแรกเพื่อเข้าถึงลูกค้าเป้าหมายทันที' : 'Start your first listing to reach potential tenants.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {properties.map((prop) => (
              <div key={prop.id} className="glass-card premium-card-hover border border-white/20 rounded-2xl overflow-hidden transition-all group flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img src={prop.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[90%]">
                    {prop.isVerified && <Badge className="bg-green-500 text-white text-[10px] font-black border-none gap-1"><ShieldCheck className="w-3 h-3" /> VERIFIED</Badge>}
                    {prop.boosted && <Badge className="bg-amber-500 text-white text-[10px] font-black border-none gap-1"><Rocket className="w-3 h-3" /> BOOSTED</Badge>}
                    {prop.badge === 'featured' && <Badge className="bg-indigo-600 text-white text-[10px] font-black border-none gap-1"><Pin className="w-3 h-3" /> PINNED</Badge>}
                    {(prop as any).ghostWarning && <Badge className="bg-orange-500 text-white text-[10px] font-black border-none animate-pulse">⚠️ ใกล้หมดอายุ</Badge>}
                    {prop.status === 'hidden' && <Badge className="bg-red-600 text-white text-[10px] font-black border-none">⚠️ ถูกซ่อน (หมดอายุ)</Badge>}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-black text-gray-900 truncate pr-4 text-lg">{prop.name}</h5>
                    <Badge className="bg-[#E51D53]/10 text-[#E51D53] text-[10px] font-black border-none px-2">{prop.type}</Badge>
                  </div>
                  
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-1 mb-4 mt-auto">
                    <Clock className="w-3 h-3" /> {t.last_updated.replace('{date}', formatPropDate(prop.updatedAt))}
                  </span>

                  <div className="grid grid-cols-5 gap-2 border-t pt-4">
                    <Button variant="ghost" size="icon" onClick={() => setExpandedPropId(expandedPropId === String(prop.id) ? null : String(prop.id))} className={cn("rounded-xl transition-colors", expandedPropId === String(prop.id) ? "text-[#E51D53] bg-[#E51D53]/10" : "hover:bg-[#E51D53]/10 hover:text-[#E51D53]")} title="AI Pricing">
                      <Sparkles className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(prop)} className="rounded-xl hover:bg-[#E51D53]/10 hover:text-[#E51D53] transition-colors">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRenew(prop.id as string)} className="rounded-xl hover:bg-green-50 hover:text-green-500 transition-colors" title={t.renew}>
                      <RefreshCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onBoost(prop.id as string)} className={cn("rounded-xl transition-colors", prop.boosted ? "text-amber-500 hover:bg-amber-50" : "hover:bg-amber-50 hover:text-amber-500")} title={isThai ? 'ดันประกาศ' : 'Boost'}>
                      <Rocket className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(prop.id as string)} className="rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors" title={t.delete}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* AI Pricing Expansion */}
                <div className={cn("overflow-hidden transition-all duration-300", expandedPropId === String(prop.id) ? "max-h-96 border-t" : "max-h-0")}>
                  <div className="p-4 bg-gray-50/50">
                    <SmartPricingTool 
                      lang={lang} 
                      initialType={prop.type}
                      initialSqm={prop.sqm}
                      initialBed={prop.bed}
                      initialLocation={prop.location}
                      compact
                      onSelectPrice={(price: number) => console.log('Accept:', price)} 
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
