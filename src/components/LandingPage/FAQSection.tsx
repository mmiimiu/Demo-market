import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Lang } from "./types";
import { translations } from "./translations";

interface FAQSectionProps {
  lang: Lang;
}

export default function FAQSection({ lang }: FAQSectionProps) {
  const text = translations[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-10 px-2 sm:px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900">{text.faq.title}</h2>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-4 items-start">
          {text.faq.items.map((item: any, i: number) => (
            <div key={i} className="border border-slate-200/60 rounded-xl sm:rounded-2xl overflow-hidden hover:border-blue-300 transition-colors bg-white">
              <button
                className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 px-2 py-2 sm:px-4 sm:py-3 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span className="font-bold sm:font-medium text-slate-900 text-[8px] sm:text-sm pr-1 sm:pr-4 leading-tight">{item.q}</span>
                {openFaq === i ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div id={`faq-answer-${i}`} className="px-2 pb-2 pt-1.5 sm:px-4 sm:pb-3 sm:pt-3 text-[8px] sm:text-xs text-slate-500 leading-tight border-t border-slate-100 bg-slate-50/50">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
