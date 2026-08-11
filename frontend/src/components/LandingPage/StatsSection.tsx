import React from "react";
import { Building2, Users, BadgeCheck, TrendingUp } from "lucide-react";
import { Lang } from "./types";
import { translations } from "./translations";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface StatsSectionProps {
  lang: Lang;
}

export default function StatsSection({ lang }: StatsSectionProps) {
  const text = translations[lang];
  const { ref, isVisible } = useScrollReveal(0.2);

  const statsData = [
    { value: "50,000+", label: text.stats.listings, icon: <Building2 className="w-3 h-3 sm:w-5 sm:h-5 text-white" />, color: "bg-blue-600" },
    { value: "120,000+", label: text.stats.users, icon: <Users className="w-3 h-3 sm:w-5 sm:h-5 text-white" />, color: "bg-indigo-600" },
    { value: "3,500+", label: text.stats.agents, icon: <BadgeCheck className="w-3 h-3 sm:w-5 sm:h-5 text-white" />, color: "bg-indigo-600" },
    { value: "98%", label: text.stats.success, icon: <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 text-white" />, color: "bg-emerald-600" },
  ];

  return (
    <section ref={ref} className="py-5 sm:py-10 bg-slate-50 border-y border-slate-100/50">
      <div className={`max-w-6xl mx-auto px-2 sm:px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="grid grid-cols-4 gap-2 sm:gap-6 lg:gap-12 stagger-children">
          {statsData.map((stat, i) => (
            <div key={i} className="text-center group" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className={`inline-flex items-center justify-center w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${stat.color} mb-1 sm:mb-3 mx-auto shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                {stat.icon}
              </div>
              <div className="text-xs sm:text-xl lg:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-2 group-hover:text-blue-600 transition-colors leading-[1.2] tracking-tight">{stat.value}</div>
              <div className="text-[8px] sm:text-sm text-slate-600 font-medium leading-[1.5] tracking-[0.01em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
