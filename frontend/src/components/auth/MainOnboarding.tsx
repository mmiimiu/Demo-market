"use client";

import React, { useState, useEffect } from 'react';
import { Language } from '@/lib/types';
import { 
  Search, 
  Home, 
  Building2, 
  User, 
  MessageCircle, 
  ArrowRight, 
  X,
  Keyboard,
  Zap,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Calendar,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout';

interface MainOnboardingProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onComplete: () => void;
}

export function MainOnboarding({ lang, setLang, onComplete }: MainOnboardingProps) {
  const [step, setStep] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currency, setCurrency] = useState<'THB' | 'USD' | 'CNY'>('THB');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
      if (e.key === '/' && !showShortcuts) {
        e.preventDefault();
        setShowShortcuts(true);
      }
      if (e.key === 'Enter' && step === 1) {
        setStep(2);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showShortcuts, step]);

  const isThai = lang === 'th';
  const isCn = lang === 'cn';

  const shortcuts = [
    { key: '/', action: isThai ? 'แสดงทางลัด' : isCn ? '显示快捷键' : 'Show shortcuts', icon: Keyboard },
    { key: 'S', action: isThai ? 'ค้นหาทรัพย์สิน' : isCn ? '搜索房产' : 'Search properties', icon: Search },
    { key: 'P', action: isThai ? 'ลงประกาศ' : isCn ? '发布房源' : 'Post listing', icon: Home },
    { key: 'A', action: isThai ? 'หา Agent' : isCn ? '寻找经纪人' : 'Find agent', icon: User },
    { key: 'C', action: isThai ? 'แชท' : isCn ? '聊天' : 'Chat', icon: MessageCircle },
    { key: 'ESC', action: isThai ? 'ปิด/ย้อนกลับ' : isCn ? '关闭/返回' : 'Close/Back', icon: X },
  ];

  const quickActions = [
    {
      id: 'search',
      title: isThai ? 'ค้นหาที่พัก' : isCn ? '搜索房源' : 'Search Properties',
      desc: isThai ? 'หาคอนโด บ้าน อพาร์ตเมนต์ที่ใช่' : isCn ? '寻找公寓、别墅、公寓楼' : 'Find condos, houses, apartments',
      icon: Search,
      color: 'bg-blue-500',
      shortcut: 'S'
    },
    {
      id: 'post',
      title: isThai ? 'ลงประกาศเช่า' : isCn ? '发布出租' : 'Post Listing',
      desc: isThai ? 'ปล่อยเช่าทรัพย์สินของคุณ' : isCn ? '出租您的房产' : 'Rent out your property',
      icon: Home,
      color: 'bg-green-500',
      shortcut: 'P'
    },
    {
      id: 'agent',
      title: isThai ? 'หา Agent' : isCn ? '寻找经纪人' : 'Find Agent',
      desc: isThai ? 'ติดต่อนายหน้ามืออาชีพ' : isCn ? '联系专业经纪人' : 'Connect with professional agents',
      icon: User,
      color: 'bg-purple-500',
      shortcut: 'A'
    },
    {
      id: 'chat',
      title: isThai ? 'แชททันที' : isCn ? '即时聊天' : 'Instant Chat',
      desc: isThai ? 'คุยกับเจ้าของโดยตรง' : isCn ? '直接与业主聊天' : 'Chat directly with owners',
      icon: MessageCircle,
      color: 'bg-orange-500',
      shortcut: 'C'
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: isThai ? 'ยืนยันตัวตน' : 'Verified',
      desc: isThai ? 'ทุกประกาศผ่านการตรวจสอบ' : 'All listings verified'
    },
    {
      icon: TrendingUp,
      title: isThai ? 'ราคาดีที่สุด' : 'Best Prices',
      desc: isThai ? 'เปรียบเทียบราคาได้ทันที' : 'Compare prices instantly'
    },
    {
      icon: MapPin,
      title: isThai ? 'แผนที่แม่นยำ' : 'Accurate Maps',
      desc: isThai ? 'ดูตำแหน่งที่แน่นอน' : 'See exact locations'
    },
    {
      icon: Calendar,
      title: isThai ? 'จองง่าย' : 'Easy Booking',
      desc: isThai ? 'ทำสัญญาออนไลน์ได้' : 'Online contracts available'
    },
  ];

  const handleQuickAction = (id: string) => {
    // Store the action and complete onboarding
    localStorage.setItem('primerent_onboarding_action', id);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('primerent_onboarding_skipped', 'true');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar lang={lang} setLang={setLang} scrolled={scrolled} currency={currency} setCurrency={setCurrency} />

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-none shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <Keyboard className="w-6 h-6 text-primary" />
                {isThai ? 'ทางลัดแป้นพิมพ์' : 'Keyboard Shortcuts'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowShortcuts(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-3">
              {shortcuts.map((s) => (
                <div key={s.key} className="flex items-center justify-between p-4 rounded-none bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <s.icon className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700">{s.action}</span>
                  </div>
                  <kbd className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-none text-sm font-black text-gray-600 shadow-sm">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-6 font-medium">
              {isThai ? 'กด ESC เพื่อปิด' : 'Press ESC to close'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        {step === 1 && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Hero */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-none text-primary font-black text-sm mb-4">
                <Zap className="w-4 h-4" />
                {isThai ? 'เริ่มต้นใช้งานง่ายๆ' : 'Get Started Fast'}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight">
                {isThai ? 'ยินดีต้อนรับ' : 'Welcome to'} <span className="text-primary">PrimeRent</span>
              </h1>
              <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                {isThai ? 'แพลตฟอร์มเช่าที่พักที่ใช่ เริ่มต้นที่นี่ จบในที่เดียว' : 'The right rental platform starts here, all in one place'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="group relative p-8 bg-white rounded-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${action.color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
                  <div className={`w-16 h-16 ${action.color} rounded-none flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-500 font-medium mb-4">{action.desc}</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-100 rounded-none text-xs">{action.shortcut}</kbd>
                    <span>{isThai ? 'กดเพื่อเริ่ม' : 'Press to start'}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="w-14 h-14 bg-white rounded-none flex items-center justify-center mx-auto shadow-lg">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="font-black text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-500 font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                onClick={() => setStep(2)}
                className="w-full sm:w-auto h-16 px-12 rounded-none bg-primary hover:bg-primary-dark font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isThai ? 'เริ่มเลย' : 'Get Started'} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setShowShortcuts(true)}
                className="w-full sm:w-auto h-16 px-8 rounded-none font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                <Keyboard className="mr-2 w-5 h-5" />
                {isThai ? 'ดูทางลัค' : 'View Shortcuts'} <kbd className="ml-2 px-2 py-1 bg-gray-100 rounded-none text-xs">/</kbd>
              </Button>
              <Button 
                variant="ghost"
                onClick={handleSkip}
                className="w-full sm:w-auto h-16 px-8 rounded-none font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
              >
                {isThai ? 'ข้าม' : 'Skip'}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-accent rounded-none flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
                <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-900">
                {isThai ? 'เลือกบทบาทของคุณ' : 'Choose Your Role'}
              </h2>
              <p className="text-gray-600 font-medium">
                {isThai ? 'เพื่อปรับปรุงประสบการณ์การใช้งานให้เหมาะกับคุณ' : 'To customize your experience'}
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 'renter',
                  title: isThai ? 'ผู้เช่า' : 'Renter',
                  desc: isThai ? 'กำลังหาที่พักใหม่' : 'Looking for a new place',
                  icon: Home
                },
                {
                  id: 'owner',
                  title: isThai ? 'เจ้าของทรัพย์สิน' : 'Property Owner',
                  desc: isThai ? 'ต้องการปล่อยเช่า' : 'Want to rent out',
                  icon: Building2
                },
                {
                  id: 'agent',
                  title: isThai ? 'นายหน้า' : 'Agent',
                  desc: isThai ? 'ช่วยหาที่พักให้ลูกค้า' : 'Help clients find places',
                  icon: User
                },
                {
                  id: 'guest',
                  title: isThai ? 'ผู้ใช้งานทั่วไป' : 'Just Browsing',
                  desc: isThai ? 'แวะมาหาข้อมูลก่อน' : 'Just looking around',
                  icon: Search
                },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    localStorage.setItem('primerent_user_role', role.id);
                    if (role.id === 'renter' || role.id === 'guest') {
                      setStep(3);
                    } else {
                      setStep(4);
                    }
                  }}
                  className="w-full p-6 bg-white rounded-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-6 group"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-none flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <role.icon className="w-6 h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{role.title}</h3>
                    <p className="text-gray-500 font-medium">{role.desc}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                </button>
              ))}
            </div>
            <div className="flex justify-center pt-4">
              <Button 
                variant="ghost"
                onClick={handleSkip}
                className="font-bold text-gray-400 hover:text-gray-600"
              >
                {isThai ? 'ข้ามไปก่อน' : 'Skip for now'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-accent rounded-none flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
                <Search className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-900">
                {isThai ? 'คุณกำลังมองหาที่พักแบบไหน?' : 'What are you looking for?'}
              </h2>
              <p className="text-gray-600 font-medium">
                {isThai ? 'ข้อมูลนี้จะช่วยให้เราแนะนำห้องที่ตรงใจคุณที่สุด' : 'We will use this to recommend the best properties for you'}
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 shadow-xl space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{isThai ? 'ทำเลที่สนใจ (เขต/สถานีรถไฟฟ้า)' : 'Location (District/BTS/MRT)'}</label>
                <input type="text" id="pref-location" placeholder={isThai ? 'เช่น อโศก, พระราม 9, สุขุมวิท' : 'e.g. Asoke, Rama 9, Sukhumvit'} className="w-full p-3 md:p-4 border border-gray-200 rounded-none focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{isThai ? 'งบประมาณต่อเดือน' : 'Monthly Budget'}</label>
                <select id="pref-budget" className="w-full p-3 md:p-4 border border-gray-200 rounded-none focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value="">{isThai ? 'เลือกงบประมาณ' : 'Select Budget'}</option>
                  <option value="<10000">{'< 10,000 THB'}</option>
                  <option value="10000-20000">10,000 - 20,000 THB</option>
                  <option value="20000-50000">20,000 - 50,000 THB</option>
                  <option value=">50000">{'> 50,000 THB'}</option>
                </select>
              </div>
              <Button 
                onClick={() => {
                  const loc = (document.getElementById('pref-location') as HTMLInputElement)?.value;
                  const budget = (document.getElementById('pref-budget') as HTMLSelectElement)?.value;
                  if(loc || budget) {
                    localStorage.setItem('primerent_search_preferences', JSON.stringify({ location: loc, budget }));
                  }
                  setStep(4);
                }}
                className="w-full h-14 md:h-16 rounded-none bg-primary hover:bg-primary-dark font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                {isThai ? 'ถัดไป' : 'Next'}
              </Button>
              <Button variant="ghost" onClick={() => setStep(4)} className="w-full font-bold text-gray-400 hover:text-gray-600 transition-all">
                {isThai ? 'ข้ามไปก่อน' : 'Skip for now'}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-accent rounded-none flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
                <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-900">
                {isThai ? 'การติดต่อสื่อสาร' : 'Communication'}
              </h2>
              <p className="text-gray-600 font-medium">
                {isThai ? 'ตั้งค่าแชทและ Line เพื่อการสื่อสารที่ไร้รอยต่อ' : 'Set up chat and Line for seamless communication'}
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 shadow-xl space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{isThai ? 'ภาษาที่ใช้ในการแปลแชทอัตโนมัติ (Chat Translation)' : 'Auto-translate Chat Language'}</label>
                <select id="pref-chat-lang" className="w-full p-3 md:p-4 border border-gray-200 rounded-none focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value="TH">{isThai ? 'ภาษาไทย (TH)' : 'Thai (TH)'}</option>
                  <option value="EN">English (EN)</option>
                  <option value="CN">中文 (CN)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">{isThai ? '*ระบบจะแปลข้อความแชทเป็นภาษานี้ให้อัตโนมัติ' : '*Chat messages will be auto-translated to this language'}</p>
              </div>
              <Button 
                onClick={() => {
                  const lang = (document.getElementById('pref-chat-lang') as HTMLSelectElement)?.value;
                  if(lang) {
                    localStorage.setItem('primerent_chat_preferences', JSON.stringify({ chatLang: lang }));
                  }
                  onComplete();
                }}
                className="w-full h-14 md:h-16 rounded-none bg-primary hover:bg-primary-dark font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                {isThai ? 'เสร็จสิ้น เข้าสู่ระบบ' : 'Finish Setup'}
              </Button>
              <Button variant="ghost" onClick={onComplete} className="w-full font-bold text-gray-400 hover:text-gray-600 transition-all">
                {isThai ? 'ข้ามไปก่อน' : 'Skip for now'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
