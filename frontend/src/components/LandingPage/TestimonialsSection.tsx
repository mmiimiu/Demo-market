import React from "react";
import { Star, Quote } from "lucide-react";
import { Lang } from "./types";
import { translations } from "./translations";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface TestimonialsSectionProps {
  lang: Lang;
}

export default function TestimonialsSection({ lang }: TestimonialsSectionProps) {
  const text = translations[lang];
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <section ref={ref} className="py-20 px-4 bg-slate-50">
      <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 mb-4">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="text-amber-700 text-xs font-semibold">
              {lang === "th" ? "รีวิวจากผู้ใช้งานจริง" : "Real User Reviews"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">{text.testimonials.title}</h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">{text.testimonials.subtitle}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8">
          {text.testimonials.items.map((item: any, i: number) => (
            <div key={i} className="group bg-white rounded-2xl p-2 sm:p-5 border border-slate-100/50 shadow-sm hover:shadow-md hover:border-blue-200/50 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="absolute top-2 right-2 w-8 h-8 sm:w-12 sm:h-12 bg-blue-50/50 rounded-full -translate-y-4 translate-x-4 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500" />
              <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-6 sm:h-6 text-blue-100 group-hover:text-blue-200 transition-colors" />
              <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="w-2.5 h-2.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-[9px] sm:text-sm leading-[1.5] sm:leading-[1.7] mb-3 sm:mb-6 font-medium tracking-[0.01em] line-clamp-4">"{item.text}"</p>
              <div className="flex items-center gap-1.5 sm:gap-3 pt-2 sm:pt-4 border-t border-slate-100">
                <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center text-xs sm:text-xl shadow-sm">
                  {item.avatar}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-[9px] sm:text-sm truncate">{item.name}</div>
                  <div className="text-[8px] sm:text-xs text-slate-500 font-medium truncate">{item.role} · {item.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
