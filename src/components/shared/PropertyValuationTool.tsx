'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, ChevronRight, RefreshCcw, Info, Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { aiPropertyValuationAction } from '@/app/actions/ai-property-valuation';

interface PropertyValuationProps {
  lang?: 'th' | 'en' | 'cn';
  initialType?: string;
  initialSqm?: number;
  initialBed?: number;
  initialLocation?: string;
}

interface ValuationResult {
  suggestedRent: number;
  rentDemandScore: number;
  marketPosition: 'undervalued' | 'fair' | 'premium';
  confidence: number;
  reasoning: string;
  investmentAnalysis: string;
  tips: string[];
}

const PROPERTY_TYPES = [
  { value: 'condo', label: 'คอนโด' },
  { value: 'house', label: 'บ้าน/ทาวน์เฮ้าส์' },
  { value: 'apartment', label: 'อพาร์ทเมนต์' },
  { value: 'studio', label: 'สตูดิโอ' },
  { value: 'villa', label: 'วิลล่า' },
];

const LOCATIONS = [
  'สุขุมวิท / อโศก', 'สยาม / ราชประสงค์', 'สีลม / สาทร', 'พระราม 9 / รัชดา',
  'อารีย์ / สะพานควาย', 'ลาดพร้าว / รัชดา', 'นนทบุรี', 'ปทุมธานี',
  'เชียงใหม่', 'ภูเก็ต', 'พัทยา'
];

export function PropertyValuationTool({ lang = 'th', initialType, initialSqm, initialBed, initialLocation }: PropertyValuationProps) {
  const isThai = lang === 'th';
  const [type, setType] = useState(initialType || 'condo');
  const [sqm, setSqm] = useState(initialSqm || 45);
  const [bedrooms, setBedrooms] = useState(initialBed || 1);
  const [location, setLocation] = useState(initialLocation || 'สุขุมวิท / อโศก');
  const [age, setAge] = useState(3);
  const [furnishing, setFurnishing] = useState('fully');
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleValuate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const val = await aiPropertyValuationAction({ type, sqm, bedrooms, location, age, furnishing });
      setResult(val);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const POSITION_CONFIG = {
    undervalued: { label: isThai ? '💎 ราคาน่าดึงดูด/ต่ำกว่ามูลค่า' : '💎 Undervalued', color: 'text-blue-700 bg-blue-50 border-blue-100', icon: <TrendingDown className="w-4 h-4" /> },
    fair: { label: isThai ? '✓ มูลค่าสมเหตุสมผล' : '✓ Fair Value', color: 'text-green-700 bg-green-50 border-green-100', icon: <Minus className="w-4 h-4" /> },
    premium: { label: isThai ? '⭐ มูลค่าพรีเมียมสูง' : '⭐ Premium Value', color: 'text-amber-700 bg-amber-50 border-amber-100', icon: <TrendingUp className="w-4 h-4" /> },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Landmark className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-gray-900">{isThai ? 'ประเมินมูลค่าทรัพย์สินด้วย AI' : 'AI Property Valuation'}</h3>
        <Badge className="bg-indigo-50 text-indigo-600 border-none text-[10px] font-bold rounded-full px-2">Gemini Engine</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">{isThai ? 'ประเภทอสังหาริมทรัพย์' : 'Property Type'}</label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">{isThai ? 'ทำเล / พื้นที่' : 'Location'}</label>
          <select value={location} onChange={e => setLocation(e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">{isThai ? 'ขนาด (ตร.ม.)' : 'Size (sqm)'}</label>
          <div className="flex items-center gap-3">
            <input type="range" min={20} max={500} step={5} value={sqm} onChange={e => setSqm(Number(e.target.value))}
              className="flex-1 accent-indigo-600" />
            <span className="text-sm font-bold text-gray-900 w-16 text-right">{sqm} ตร.ม.</span>
          </div>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">{isThai ? 'อายุของอาคาร (ปี)' : 'Building Age (years)'}</label>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={50} step={1} value={age} onChange={e => setAge(Number(e.target.value))}
              className="flex-1 accent-indigo-600" />
            <span className="text-sm font-bold text-gray-900 w-16 text-right">{age} ปี</span>
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">{isThai ? 'จำนวนห้องนอน' : 'Bedrooms'}</label>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map(n => (
              <button key={n} onClick={() => setBedrooms(n)}
                className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                  bedrooms === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600/30')}>
                {n === 0 ? 'Studio' : n}
              </button>
            ))}
          </div>
        </div>

        {/* Furnishing */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">{isThai ? 'ระดับการตกแต่ง' : 'Furnishing'}</label>
          <div className="flex gap-2">
            {[['fully', 'เฟอร์ฯ ครบ'], ['partial', 'เฟอร์บางส่วน'], ['unfurnished', 'ไม่มีเฟอร์']].map(([v, l]) => (
              <button key={v} onClick={() => setFurnishing(v)}
                className={cn('flex-1 py-2 rounded-xl border text-[10px] font-bold transition-all',
                  furnishing === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600/30')}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleValuate} disabled={loading} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg shadow-indigo-600/20">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังประเมินผล...</> : <><Sparkles className="w-4 h-4" /> {isThai ? 'ประเมินราคาเช่าที่เหมาะสม' : 'Estimate Suggested Rent'}</>}
      </Button>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{isThai ? 'ราคาประเมินค่าเช่าที่เหมาะสม' : 'Suggested Monthly Rent'}</p>
                <p className="text-4xl font-black text-gray-900">฿{result.suggestedRent.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold', POSITION_CONFIG[result.marketPosition].color)}>
                  {POSITION_CONFIG[result.marketPosition].icon}
                  {POSITION_CONFIG[result.marketPosition].label}
                </span>
                <p className="text-[10px] text-gray-400 mt-2">Confidence: {result.confidence}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-6 pt-5 border-t border-gray-100">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">{isThai ? 'คะแนนความต้องการเช่า' : 'Rent Demand Score'}</p>
                <p className="text-2xl font-black text-indigo-600">{result.rentDemandScore} <span className="text-xs font-normal text-gray-400">/ 100</span></p>
              </div>
            </div>
          </div>

          {/* Investment Analysis */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" /> {isThai ? 'บทวิเคราะห์การลงทุน' : 'Investment Analysis'}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">{result.investmentAnalysis}</p>
          </div>

          {/* AI Reasoning */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {isThai ? 'รายละเอียดการประเมินราคา' : 'Valuation Details'}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">{result.reasoning}</p>
            <div className="mt-3 space-y-1.5">
              {result.tips.map((tip, i) => (
                <p key={i} className="text-[10px] text-gray-500 flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" /> {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
