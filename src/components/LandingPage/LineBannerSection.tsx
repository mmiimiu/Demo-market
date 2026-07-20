import React from "react";
import { Lang } from "./types";
import { translations } from "./translations";

interface LineBannerSectionProps {
  lang: Lang;
}

export default function LineBannerSection({ lang }: LineBannerSectionProps) {
  const text = translations[lang];

  return (
    <section className="py-3 sm:py-6 px-2 sm:px-4 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto flex flex-row items-center justify-between gap-2 sm:gap-6">
        <div className="text-xl sm:text-4xl shrink-0">💚</div>
        <div className="flex-1 text-left min-w-0">
          <h2 className="text-[11px] sm:text-xl font-bold text-white mb-0.5 tracking-tight truncate">{text.line.title}</h2>
          <p className="text-blue-100 text-[9px] sm:text-sm mb-0 leading-[1.3] truncate">{text.line.subtitle}</p>
        </div>
        <button className="shrink-0 inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-md whitespace-nowrap">
          <span className="text-[10px] sm:text-lg">✆</span>
          <span className="text-[9px] sm:text-sm">{text.line.cta}</span>
        </button>
      </div>
    </section>
  );
}
