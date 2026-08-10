import React from "react";
import { Home, Facebook, Instagram, Twitter, Shield, QrCode, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lang } from "./types";
import { translations } from "./translations";

interface FooterSectionProps {
  lang: Lang;
}

export default function FooterSection({ lang }: FooterSectionProps) {
  const text = translations[lang];

  return (
    <footer className="bg-gray-900 text-gray-400 py-16 px-4 border-t border-gray-800/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">PrimeRent</span>
              </div>
              <p className="text-xs leading-relaxed mb-4">{text.footer.tagline}</p>
              <div className="flex gap-3">
                {[Facebook, Instagram, Twitter].map((Icon, i) => {
                  const platformNames = ['Facebook', 'Instagram', 'Twitter'];
                  return (
                    <button key={i} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300" aria-label={`Follow us on ${platformNames[i]}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <h5 className="text-xs font-black text-white uppercase tracking-wider mb-2">
                {lang === "th" ? "รับข่าวสารและประกาศใหม่" : "Subscribe to Newsletter"}
              </h5>
              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                {lang === "th" 
                  ? "รับข้อมูลประกาศเช่าใหม่ล่าสุดและเคล็ดลับอสังหาฯ ส่งตรงถึงอีเมลของคุณทุกสัปดาห์" 
                  : "Get the latest rental listings and property insights sent directly to your inbox."}
              </p>
              <div className="flex gap-2 max-w-sm">
                <input 
                  type="email" 
                  placeholder={lang === "th" ? "กรอกอีเมลของคุณ..." : "Your email address..."} 
                  className="bg-gray-800 border border-gray-700/60 rounded-full px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 flex-1 transition-all pl-4"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 text-xs font-bold shrink-0 h-9">
                  {lang === "th" ? "ติดตาม" : "Subscribe"}
                </Button>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{text.footer.renter}</h4>
            <ul className="space-y-2.5 text-xs">
              {[text.footer.links.search, text.footer.links.howRent, text.footer.links.payment].map((link, i) => (
                <li key={i}>
                  <a href="#" className="relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:bg-blue-400 after:transition-all after:duration-300 hover:text-blue-400 block w-fit">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{text.footer.owner}</h4>
            <ul className="space-y-2.5 text-xs">
              {[text.footer.links.list, text.footer.links.manage, text.footer.links.income].map((link, i) => (
                <li key={i}>
                  <a href="#" className="relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:bg-blue-400 after:transition-all after:duration-300 hover:text-blue-400 block w-fit">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{text.footer.agent}</h4>
            <ul className="space-y-2.5 text-xs">
              {[text.footer.links.joinAgent, text.footer.links.agentTools, text.footer.links.commission].map((link, i) => (
                <li key={i}>
                  <a href="#" className="relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:bg-blue-400 after:transition-all after:duration-300 hover:text-blue-400 block w-fit">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">{text.footer.company}</h4>
            <ul className="space-y-2.5 text-xs">
              {[text.footer.links.about, text.footer.links.blog, text.footer.links.privacy, text.footer.links.terms, text.footer.links.contact].map((link, i) => (
                <li key={i}>
                  <a href="#" className="relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:bg-blue-400 after:transition-all after:duration-300 hover:text-blue-400 block w-fit">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs">{text.footer.copyright}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 px-3 py-1.5 rounded-full text-blue-400 transition-colors cursor-default">
              <Shield className="w-3.5 h-3.5" />
              <span className="font-semibold">SSL Secured</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 px-3 py-1.5 rounded-full text-green-400 transition-colors cursor-default">
              <QrCode className="w-3.5 h-3.5" />
              <span className="font-semibold">PromptPay Ready</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 px-3 py-1.5 rounded-full text-purple-400 transition-colors cursor-default">
              <FileSignature className="w-3.5 h-3.5" />
              <span className="font-semibold">e-Signature</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
