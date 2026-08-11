"use client";

import React from "react";
import Link from "next/link";
import { Search, MapPin, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lang } from "./types";
import { translations } from "./translations";
import MetroMapSection from "./MetroMapSection";
interface HeroSectionProps {
  lang: Lang;
  activeTab: "renter" | "owner" | "agent";
  setActiveTab: (tab: "renter" | "owner" | "agent") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ lang, activeTab, setActiveTab, searchQuery, setSearchQuery }: HeroSectionProps) {
  const text = translations[lang];

  const tabConfig = {
    renter: { color: "bg-blue-600", bg: "bg-blue-50/80", border: "border-blue-100", textColor: "text-blue-700", cta: text.hero.renterCTA, desc: text.hero.renterDesc, href: "/listings" },
    owner: { color: "bg-blue-600", bg: "bg-blue-50/80", border: "border-blue-100", textColor: "text-blue-700", cta: text.hero.ownerCTA, desc: text.hero.ownerDesc, href: "/post-listing" },
    agent: { color: "bg-indigo-600", bg: "bg-indigo-50/80", border: "border-indigo-100", textColor: "text-indigo-700", cta: text.hero.agentCTA, desc: text.hero.agentDesc, href: "/agent/onboarding" },
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-slate-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full opacity-20 animate-pulse bg-blue-100" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15 animate-pulse delay-1000 bg-indigo-100" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2 bg-blue-50" />
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 w-full relative z-10">
        <div className="flex flex-col items-center text-center gap-16">
          <div className="space-y-8 max-w-3xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/60 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all cursor-default mx-auto animate-float">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-blue-700 text-sm font-semibold">{text.hero.badge}</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.2] tracking-tight">
                {text.hero.title}
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {text.hero.titleHighlight}
                </span>
              </h1>
              <p className="text-slate-600 text-lg leading-[1.6] max-w-xl mx-auto tracking-[0.01em]">{text.hero.subtitle}</p>
            </div>

            <div className="flex gap-1.5 p-1.5 rounded-2xl w-fit bg-white/60 backdrop-blur-sm border border-slate-200/60 shadow-sm">
              {(["renter", "owner", "agent"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                >
                  {text.hero.tabs[tab]}
                </button>
              ))}
            </div>

            <div className="flex gap-2 rounded-full p-2 bg-white/80 backdrop-blur-md shadow-xl border border-slate-200/60 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100/50 transition-all">
              <div className="flex items-center gap-3 flex-1 px-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={text.hero.searchPlaceholder}
                  aria-label={text.hero.searchPlaceholder}
                  className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent font-medium"
                />
              </div>
              <Link href={`/listings${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}>
                <Button className="bg-[#E51D53] hover:bg-[#D41B4D] text-white rounded-full px-8 font-bold shadow-lg shadow-[#E51D53]/25 h-12 transition-all hover:scale-105 btn-pulse-glow">
                  <Search className="w-5 h-5 mr-2" strokeWidth={3} />
                  {text.hero.searchBtn}
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-2 stagger-children">
              {[
                { label: '🐶 เลี้ยงสัตว์ได้', param: 'feature=pet' },
                { label: '🚆 ติดรถไฟฟ้า', param: 'feature=bts_mrt' },
                { label: '🌊 วิวแม่น้ำ', param: 'feature=river_view' },
                { label: '🎓 ใกล้มหาลัย', param: 'feature=university' },
                { label: '🏋️ ฟิตเนส & สระว่ายน้ำ', param: 'feature=gym_pool' }
              ].map((item) => (
                <Link key={item.label} href={`/listings?type=rent&${item.param}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white/70 backdrop-blur-sm border border-slate-200/60 text-slate-600 hover:border-[#E51D53] hover:text-[#E51D53] hover:bg-pink-50 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="inline-block rounded-3xl p-6 bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-xl max-w-md w-full text-left mx-auto animate-scale-in card-hover">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-slate-700 font-semibold leading-[1.6] tracking-[0.01em]">{tabConfig[activeTab].desc}</p>
              </div>
              <Link href={tabConfig[activeTab].href}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5">
                  {tabConfig[activeTab].cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full max-w-5xl">
            <MetroMapSection lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}
