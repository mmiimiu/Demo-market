import React from "react";
import { Lang } from "./types";
import { translations } from "./translations";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface WhySectionProps {
  lang: Lang;
}

export default function WhySection({ lang }: WhySectionProps) {
  const text = translations[lang];
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <section ref={ref} className="py-20 px-4 bg-white">
      <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50/80 border border-green-200/60 mb-4">
            <span className="text-green-700 text-xs font-semibold">
              {lang === "th" ? "ข้อดีเด่น" : "Key Benefits"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">{text.why.title}</h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">{text.why.subtitle}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8">
          {text.why.features.map((feature: any, i: number) => (
            <div key={i} className="group bg-slate-50 rounded-2xl p-2 sm:p-5 border border-slate-100/50 hover:border-blue-200/50 hover:shadow-md transition-all duration-500 hover:-translate-y-1 text-center" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-2 mx-auto text-lg sm:text-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:shadow-md">
                {feature.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-[9px] sm:text-sm leading-[1.2] tracking-tight">{feature.title}</h3>
              <p className="text-[8px] sm:text-xs text-slate-600 leading-[1.4] tracking-[0.01em] line-clamp-3">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
