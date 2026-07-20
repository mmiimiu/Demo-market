import React from "react";
import { Search, Home, FileSignature, Key, Camera, Handshake, BadgeCheck, Wallet, Target, Smartphone, FileText, Gem, ArrowRight } from "lucide-react";
import { Lang } from "./types";
import { translations } from "./translations";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface HowItWorksSectionProps {
  lang: Lang;
  howItWorksTab: "renter" | "owner" | "agent";
  setHowItWorksTab: (tab: "renter" | "owner" | "agent") => void;
}

export default function HowItWorksSection({ lang, howItWorksTab, setHowItWorksTab }: HowItWorksSectionProps) {
  const text = translations[lang];
  const { ref, isVisible } = useScrollReveal(0.1);
  const howItWorksSteps = { renter: text.howItWorks.renterSteps, owner: text.howItWorks.ownerSteps, agent: text.howItWorks.agentSteps };

  const renderStepIcon = (iconName: string) => {
    switch (iconName) {
      case "search": return <Search className="w-4 h-4 text-white" />;
      case "home": return <Home className="w-4 h-4 text-white" />;
      case "file": return <FileSignature className="w-4 h-4 text-white" />;
      case "key": return <Key className="w-4 h-4 text-white" />;
      case "camera": return <Camera className="w-4 h-4 text-white" />;
      case "handshake": return <Handshake className="w-4 h-4 text-white" />;
      case "check": return <BadgeCheck className="w-4 h-4 text-white" />;
      case "wallet": return <Wallet className="w-4 h-4 text-white" />;
      case "target": return <Target className="w-4 h-4 text-white" />;
      case "phone": return <Smartphone className="w-4 h-4 text-white" />;
      case "pen": return <FileText className="w-4 h-4 text-white" />;
      case "gem": return <Gem className="w-4 h-4 text-white" />;
      default: return null;
    }
  };

  const tabColorConfig = {
    renter: "bg-blue-600",
    owner: "bg-blue-600",
    agent: "bg-indigo-600",
  };

  return (
    <section id="how-it-works" ref={ref} className="py-20 px-4 bg-slate-50">
      <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">{text.howItWorks.title}</h2>
          <p className="text-slate-500 text-sm sm:text-base leading-[1.6] max-w-2xl mx-auto">{text.howItWorks.subtitle}</p>
        </div>
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-xl p-1 gap-1 shadow-md border border-slate-200/60">
            {(["renter", "owner", "agent"] as const).map((tab) => (
              <button key={tab} onClick={() => setHowItWorksTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                  howItWorksTab === tab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 transform scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}>
                {text.howItWorks.tabs[tab]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1 sm:gap-4 md:gap-6">
          {howItWorksSteps[howItWorksTab].map((step: any, i: number) => (
            <div key={i} className="relative group text-center" style={{ transitionDelay: `${i * 100}ms` }}>
              {i < 3 && (
                <div className="hidden lg:block absolute top-6 left-[60%] right-0 h-0.5 bg-blue-200 z-0">
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                </div>
              )}
              <div className="relative z-10 bg-white rounded-xl p-1.5 sm:p-4 border border-slate-100/50 hover:border-blue-200/50 hover:shadow-sm transition-all duration-300 hover:-translate-y-1 group-hover:bg-blue-50 h-full flex flex-col items-center">
                <div className="relative mb-2">
                  <div className={`w-8 h-8 rounded-lg ${tabColorConfig[howItWorksTab]} flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {renderStepIcon(step.icon)}
                  </div>
                  <div className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </div>
                </div>
                <div className="text-[8px] font-bold text-blue-600 mb-0.5 uppercase tracking-wider">
                  {lang === "th" ? `ขั้น ${i + 1}` : `Step ${i + 1}`}
                </div>
                <h3 className="font-bold text-slate-900 mb-1 text-[9px] md:text-sm leading-[1.2] tracking-tight">{step.title}</h3>
                <p className="text-[8px] md:text-xs text-slate-500 leading-[1.3] tracking-[0.01em] line-clamp-3">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
