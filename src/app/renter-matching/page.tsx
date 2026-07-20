"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout';
import { MOCK_RENTERS, MockRenter } from '@/lib/mock-renters';
import { useApp } from '@/contexts/AppContext';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { 
  Search, MapPin, Building2, User, CheckCircle2, 
  ChevronRight, FilterX, MessageCircle, Clock, Zap, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';

const URGENCY_CONFIG = {
  high:   { label: { th: 'ต้องการด่วน!', en: 'Urgent!' },   color: 'bg-red-500',    text: 'text-red-500',   bg: 'bg-red-50',    border: 'border-red-100',   icon: Zap },
  medium: { label: { th: 'กำลังมองหา', en: 'Actively Looking' }, color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50',  border: 'border-amber-100', icon: Search },
  low:    { label: { th: 'ยังไม่เร่งรีบ', en: 'Flexible' },    color: 'bg-green-500',  text: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-100', icon: Clock },
};

function RenterMatchingContent() {
  const router = useRouter();
  const { user } = useUser();
  const { lang, setLang, currency, setCurrency } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [budgetMax, setBudgetMax] = useState<number>(60000);

  // Profile Modal State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isThai = lang === 'th';
  const isChinese = lang === 'cn';

  // Filter renters list
  const filteredRenters = MOCK_RENTERS.filter(renter => {
    const matchesSearch = 
      renter.displayName.toLowerCase().includes(query.toLowerCase()) ||
      renter.location.toLowerCase().includes(query.toLowerCase()) ||
      renter.bio.toLowerCase().includes(query.toLowerCase()) ||
      renter.preferences.locations.some(loc => loc.toLowerCase().includes(query.toLowerCase()));

    const matchesType = selectedType === 'all' || renter.preferences.propertyTypes.includes(selectedType as any);
    const matchesBudget = renter.preferences.budgetMin <= budgetMax;
    const matchesUrgency = selectedUrgency === 'all' || renter.urgency === selectedUrgency;

    return matchesSearch && matchesType && matchesBudget && matchesUrgency;
  });

  const handleOpenProfile = (uid: string) => {
    setSelectedUserId(uid);
    setIsModalOpen(true);
  };

  const handleStartChat = (renter: MockRenter) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: isThai ? 'กรุณาเข้าสู่ระบบ' : 'Please Login First',
        description: isThai ? 'ต้องเข้าสู่ระบบก่อนจึงจะแชทได้' : 'You need to be logged in to start a chat.'
      });
      return;
    }
    localStorage.setItem('chat_initiate_user', JSON.stringify({
      uid: renter.uid,
      displayName: renter.displayName,
      photoURL: renter.photoURL,
      role: renter.role
    }));
    toast({
      title: isThai ? 'กำลังเปิดห้องแชท' : 'Opening Chat',
      description: isThai ? `เริ่มต้นคุยกับ ${renter.displayName}` : `Starting conversation with ${renter.displayName}`
    });
    router.push('/chat');
  };

  const urgencyBreakdown = {
    high:   MOCK_RENTERS.filter(r => r.urgency === 'high').length,
    medium: MOCK_RENTERS.filter(r => r.urgency === 'medium').length,
    low:    MOCK_RENTERS.filter(r => r.urgency === 'low').length,
  };

  return (
    <main className={cn(
      "min-h-screen bg-gray-50/50",
      lang === 'th' ? "font-thai" : lang === 'cn' ? "font-chinese" : "font-english"
    )}>
      <Navbar 
        scrolled={scrolled}
      />

      <div className="pt-24 md:pt-32 pb-16 px-4 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary font-black text-xs mb-3">
              <User className="w-3.5 h-3.5" />
              {isThai ? 'สำหรับ Agent และ Landlord' : 'For Agents & Landlords'}
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              {isThai ? 'Renter Matching' : isChinese ? '租客匹配板' : 'Renter Lead Matching'}
            </h1>
            <p className="text-gray-500 font-bold text-lg max-w-xl">
              {isThai ? 'บริการจับคู่ผู้เช่าที่กำลังมองหาที่พัก ดูความต้องการและเสนอห้องพักที่เหมาะสม' : 'Browse active renter profiles, their budget, and pitch properties directly.'}
            </p>
          </div>
          <Badge className="bg-primary/5 text-primary border-primary/10 rounded-full font-black px-4 py-2 text-xs shrink-0">
            {isThai ? `พบผู้เช่า ${filteredRenters.length} คน` : `${filteredRenters.length} renter leads`}
          </Badge>
        </div>

        {/* Urgency Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(Object.entries(URGENCY_CONFIG) as [keyof typeof URGENCY_CONFIG, typeof URGENCY_CONFIG['high']][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedUrgency(selectedUrgency === key ? 'all' : key)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all font-bold text-sm",
                  selectedUrgency === key
                    ? `${cfg.bg} ${cfg.border} shadow-md`
                    : "bg-white border-gray-100 hover:border-gray-200"
                )}
              >
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0", cfg.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={cn("font-black text-base", selectedUrgency === key ? cfg.text : "text-gray-900")}>
                    {urgencyBreakdown[key]}
                  </p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    {cfg.label[isThai ? 'th' : 'en']}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_12px_48px_-8px_rgba(0,0,0,0.08)] border border-gray-100 mb-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <Input 
                className="h-14 pl-12 pr-4 rounded-2xl bg-gray-50/50 border-none font-bold text-sm"
                placeholder={isThai ? 'ค้นหาชื่อผู้เช่า, ทำเล หรือ แนะนำตัว...' : 'Search name, area, or bio...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-14 px-6 rounded-2xl bg-gray-50/50 border-none font-bold text-sm text-gray-600 focus:outline-none"
              >
                <option value="all">{isThai ? 'ประเภทที่พักทั้งหมด' : 'All Property Types'}</option>
                <option value="condo">{isThai ? 'คอนโด' : 'Condo'}</option>
                <option value="house">{isThai ? 'บ้านเดี่ยว' : 'House'}</option>
                <option value="townhouse">{isThai ? 'ทาวน์เฮ้าส์' : 'Townhouse'}</option>
                <option value="apartment">{isThai ? 'อพาร์ตเมนต์' : 'Apartment'}</option>
              </select>

              <Button 
                onClick={() => {
                  setQuery('');
                  setSelectedType('all');
                  setSelectedUrgency('all');
                  setBudgetMax(60000);
                }}
                variant="outline" 
                className="h-14 px-5 rounded-2xl font-bold border-2 border-gray-100 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                title={isThai ? 'ล้างตัวกรอง' : 'Reset filters'}
              >
                <FilterX className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Budget Range Filter */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
              <span>{isThai ? 'งบประมาณสูงสุด (บาท/เดือน)' : 'MAX MONTHLY BUDGET'}</span>
              <span className="text-primary font-black">฿{budgetMax.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="5000" 
              max="60000" 
              step="1000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] font-bold text-gray-300">
              <span>฿5,000</span>
              <span>฿60,000</span>
            </div>
          </div>
        </div>

        {/* Renters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRenters.map((renter) => {
            const urgencyCfg = URGENCY_CONFIG[renter.urgency];
            const UrgencyIcon = urgencyCfg.icon;
            return (
              <Card key={renter.uid} className="border-none shadow-[0_8px_32px_-4px_rgba(0,0,0,0.06)] rounded-[32px] overflow-hidden bg-white hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 flex flex-col justify-between h-full space-y-5">
                  
                  {/* Renter Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/10 shadow-md rounded-2xl shrink-0">
                      <AvatarImage src={renter.photoURL} />
                      <AvatarFallback className="bg-primary text-white font-black text-lg rounded-2xl">
                        {renter.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <h3 className="text-lg font-black text-gray-900 leading-tight truncate">{renter.displayName}</h3>
                        {renter.kycStatus === 'verified' && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 fill-current shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-bold mb-2">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{renter.location}</span>
                      </div>
                      {/* Urgency Badge */}
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border",
                        urgencyCfg.bg, urgencyCfg.border, urgencyCfg.text
                      )}>
                        <UrgencyIcon className="w-3 h-3" />
                        {urgencyCfg.label[isThai ? 'th' : 'en']}
                      </div>
                    </div>
                  </div>

                  {/* Preference Tag Row */}
                  <div className="p-5 bg-gray-50 rounded-2xl space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{isThai ? 'งบประมาณต้องการ' : 'BUDGET WANTED'}</span>
                      <span className="text-base font-black text-primary">฿{renter.preferences.budgetMin.toLocaleString()} - ฿{renter.preferences.budgetMax.toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-1.5 pt-2.5 border-t border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{isThai ? 'ทำเลที่ค้นหา' : 'PREFERRED LOCATIONS'}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {renter.preferences.locations.slice(0, 3).map(loc => (
                          <Badge key={loc} className="bg-white border text-gray-600 font-bold text-[10px] px-2 py-0.5 rounded-lg">
                            {loc}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2.5 border-t border-gray-100">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-[10px] font-bold text-gray-400">{isThai ? 'ต้องการเข้าอยู่:' : 'Move in by:'}</span>
                      <span className="text-[10px] font-black text-gray-700">{renter.moveInDate}</span>
                    </div>
                  </div>

                  {/* Bio text */}
                  <p className="text-gray-600 text-sm font-semibold leading-relaxed line-clamp-2">
                    {renter.bio}
                  </p>

                  {/* Property Type Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {renter.preferences.propertyTypes.map(type => (
                      <Badge key={type} className="bg-primary/5 text-primary border-primary/10 font-bold text-[10px] px-2.5 py-1 rounded-lg uppercase">
                        {type}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                    <Button 
                      onClick={() => handleStartChat(renter)}
                      variant="outline"
                      className="flex-1 rounded-xl border-2 border-primary/20 text-primary hover:bg-primary hover:text-white font-black h-11 gap-2 text-xs transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {isThai ? 'เสนอห้อง' : 'Pitch Room'}
                    </Button>
                    <Button 
                      onClick={() => handleOpenProfile(renter.uid)}
                      className="flex-1 rounded-xl bg-primary hover:bg-primary-dark font-black h-11 gap-2 text-xs shadow-md shadow-primary/10 transition-all"
                    >
                      {isThai ? 'ดูประวัติ' : 'View Profile'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                </CardContent>
              </Card>
            );
          })}

          {filteredRenters.length === 0 && (
            <div className="md:col-span-2 text-center py-20 bg-white border border-gray-100 rounded-[32px] p-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 mb-2">{isThai ? 'ไม่พบข้อมูลผู้เช่า' : 'No Renter Leads Found'}</h3>
              <p className="text-gray-400 font-bold max-w-sm mx-auto">
                {isThai ? 'ลองเปลี่ยนคำค้นหา หรือขยายช่วงงบประมาณเช่ารายเดือนให้สูงขึ้น' : 'Try tweaking your search terms or increasing the budget filters.'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Profile Modal */}
      {selectedUserId && (
        <PublicProfileModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUserId(null);
          }}
          userId={selectedUserId}
          lang={lang}
        />
      )}
    </main>
  );
}

export default function RenterMatchingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <RenterMatchingContent />
    </Suspense>
  );
}

