'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, ChevronRight, RefreshCcw, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { aiSmartPricingAction } from '@/app/actions/ai-smart-pricing';

interface SmartPricingProps {
  lang?: 'th' | 'en' | 'cn';
  initialType?: string;
  initialSqm?: number;
  initialBed?: number;
  initialLocation?: string;
  compact?: boolean;
  onSelectPrice?: (price: number) => void;
}

interface PricingResult {
  suggestedMin: number;
  suggestedMax: number;
  optimal: number;
  marketAvg: number;
  position: 'undervalued' | 'fair' | 'premium';
  confidence: number;
  reasoning: string;
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

export function SmartPricingTool({ lang = 'th', initialType, initialSqm, initialBed, initialLocation, compact = false, onSelectPrice }: SmartPricingProps) {
  const isThai = lang === 'th';
  const [type, setType] = useState(initialType || 'condo');
  const [sqm, setSqm] = useState(initialSqm || 45);
  const [bedrooms, setBedrooms] = useState(initialBed || 1);
  const [location, setLocation] = useState(initialLocation || 'สุขุมวิท / อโศก');
  const [furnishing, setFurnishing] = useState('fully');
  const [amenities, setAmenities] = useState<string[]>(['pool', 'gym']);
  const [result, setResult] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const pricing = await aiSmartPricingAction({ type, sqm, bedrooms, location, amenities, furnishing });
      setResult(pricing);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const POSITION_CONFIG = {
    undervalued: { label: isThai ? '💎 ราคาต่ำกว่าตลาด' : '💎 Undervalued', color: 'text-blue-700 bg-blue-50 border-blue-100', icon: <TrendingDown className="w-4 h-4" /> },
    fair: { label: isThai ? '✓ ราคาเหมาะสม' : '✓ Fair Value', color: 'text-green-700 bg-green-50 border-green-100', icon: <Minus className="w-4 h-4" /> },
    premium: { label: isThai ? '⭐ ระดับ Premium' : '⭐ Premium', color: 'text-amber-700 bg-amber-50 border-amber-100', icon: <TrendingUp className="w-4 h-4" /> },
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Sparkles className="w-4 h-4 text-primary" />
          {isThai ? 'แนะนำราคาด้วย AI' : 'AI Smart Pricing'}
        </div>
        <Button onClick={handleAnalyze} disabled={loading} size="sm" variant="outline" className="w-full rounded-xl border-primary/30 text-primary font-bold gap-2 h-9 text-xs">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'กำลังวิเคราะห์...' : (isThai ? 'วิเคราะห์ราคา' : 'Analyze Price')}
        </Button>
        {result && (
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2 flex flex-col items-stretch">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">{isThai ? 'ราคาแนะนำ' : 'Suggested Price'}</p>
                <p className="text-2xl font-black text-primary">฿{result.optimal.toLocaleString()}<span className="text-xs font-normal text-gray-400">/เดือน</span></p>
                <p className="text-[10px] text-gray-500 font-medium font-bold">ช่วง: ฿{result.suggestedMin.toLocaleString()} — ฿{result.suggestedMax.toLocaleString()}</p>
              </div>
              {onSelectPrice && (
                <button
                  type="button"
                  onClick={() => onSelectPrice(result.optimal)}
                  className="bg-primary hover:bg-primary/95 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-none shadow-md shrink-0 self-center"
                >
                  {isThai ? 'ใช้ราคานี้' : 'Apply'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-gray-900">{isThai ? 'แนะนำราคาด้วย AI' : 'AI Smart Pricing'}</h3>
        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold rounded-full px-2">Powered by Gemini</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">{isThai ? 'ประเภทอสังหาริมทรัพย์' : 'Property Type'}</label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">{isThai ? 'ทำเล / พื้นที่' : 'Location'}</label>
          <select value={location} onChange={e => setLocation(e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">{isThai ? 'ขนาด (ตร.ม.)' : 'Size (sqm)'}</label>
          <div className="flex items-center gap-3">
            <input type="range" min={20} max={500} step={5} value={sqm} onChange={e => setSqm(Number(e.target.value))}
              className="flex-1 accent-primary" />
            <span className="text-sm font-bold text-gray-900 w-16 text-right">{sqm} ตร.ม.</span>
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">{isThai ? 'จำนวนห้องนอน' : 'Bedrooms'}</label>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map(n => (
              <button key={n} onClick={() => setBedrooms(n)}
                className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                  bedrooms === n ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/30')}>
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
                  furnishing === v ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/30')}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleAnalyze} disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังวิเคราะห์ด้วย AI...</> : <><Sparkles className="w-4 h-4" /> {isThai ? 'วิเคราะห์ราคาตลาด' : 'Analyze Market Price'}</>}
      </Button>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Result */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{isThai ? 'ราคาเช่าแนะนำ' : 'Suggested Rental Price'}</p>
                <p className="text-4xl font-black text-gray-900">฿{result.optimal.toLocaleString()}</p>
                <p className="text-sm text-gray-400 font-medium">{isThai ? 'ต่อเดือน' : 'per month'}</p>
              </div>
              <div className="text-right">
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold', POSITION_CONFIG[result.position].color)}>
                  {POSITION_CONFIG[result.position].icon}
                  {POSITION_CONFIG[result.position].label}
                </span>
                <p className="text-[10px] text-gray-400 mt-2">Confidence: {result.confidence}%</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-100">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Min</p>
                <p className="text-base font-bold text-gray-700">฿{result.suggestedMin.toLocaleString()}</p>
              </div>
              <div className="text-center border-x border-gray-100">
                <p className="text-[10px] text-primary font-semibold uppercase">Optimal</p>
                <p className="text-base font-bold text-primary">฿{result.optimal.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Max</p>
                <p className="text-base font-bold text-gray-700">฿{result.suggestedMax.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Market Comparison */}
          <div className="glass-card premium-card-hover border border-white/20 rounded-3xl p-5">
            <p className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> {isThai ? 'เปรียบเทียบกับตลาด' : 'Market Comparison'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500 w-24">ราคาของคุณ</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.min((result.optimal / (result.marketAvg * 1.3)) * 100, 100)}%` }} />
                </div>
                <span className="text-[10px] font-bold text-gray-700">฿{result.optimal.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500 w-24">ราคาตลาด</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gray-400 transition-all duration-700" style={{ width: `${Math.min((result.marketAvg / (result.marketAvg * 1.3)) * 100, 100)}%` }} />
                </div>
                <span className="text-[10px] font-bold text-gray-700">฿{result.marketAvg.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="glass-card bg-blue-50/50 backdrop-blur-md border border-blue-100/50 rounded-3xl p-5">
            <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Analysis
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">{result.reasoning}</p>
            <div className="mt-3 space-y-1.5">
              {result.tips.map((tip, i) => (
                <p key={i} className="text-[10px] text-gray-500 flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" /> {tip}
                </p>
              ))}
            </div>
          </div>

          <Button variant="outline" onClick={handleAnalyze} size="sm" className="gap-1.5 text-xs rounded-xl border-gray-200 text-gray-500">
            <RefreshCcw className="w-3 h-3" /> {isThai ? 'วิเคราะห์ใหม่' : 'Re-analyze'}
          </Button>
        </div>
      )}
    </div>
  );
}
