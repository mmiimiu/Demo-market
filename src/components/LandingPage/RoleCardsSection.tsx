import React from "react";
import Link from "next/link";
import { Search, Home, Users, Camera, BadgeCheck, Wallet, Target, FileSignature, Gem, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lang } from "./types";
import { translations } from "./translations";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useUser } from "@/firebase";
import { AuthModal } from "@/components/auth/AuthModal";

interface RoleCardsSectionProps {
  lang: Lang;
}

export default function RoleCardsSection({ lang }: RoleCardsSectionProps) {
  const text = translations[lang];
  const { ref, isVisible } = useScrollReveal(0.1);
  const { user, loading } = useUser();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const handleOwnerPostClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      // Use router.push instead of window.location.href for better navigation
      window.location.href = '/post-listing';
    }
  };

  return (
    <section ref={ref} className="py-20 px-4 bg-white">
      <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-blue-700 text-xs font-semibold">
              {lang === "th" ? "บริการครบวงจร" : "Complete Services"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
            {lang === "th" ? "เลือกบริการตามบทบาทของคุณ" : "Choose Your Service by Role"}
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            {lang === "th" 
              ? "ไม่ว่าคุณต้องการเช่า ปล่อยเช่า หรือเป็นตัวแทน เรามีเครื่องมือที่ดีที่สุดพร้อมดูแลคุณ" 
              : "Whether you want to rent, lease, or represent properties, we have the best tools for you."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8">
          {/* Renter Card */}
          <div className="group bg-white rounded-2xl p-2 sm:p-5 border border-blue-100/50 shadow-sm hover:shadow-md hover:border-blue-300/50 transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden" style={{ transitionDelay: '0ms' }}>
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-blue-100/50 rounded-bl-full -translate-y-8 translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500" />
            <div>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center mb-2 sm:mb-4 text-white shadow-sm shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-[10px] sm:text-base font-bold text-slate-900 mb-1 leading-[1.2] tracking-tight line-clamp-1">
                {lang === "th" ? "ผู้เช่า" : "Renters"}
              </h3>
              <p className="text-[8px] sm:text-xs text-slate-600 leading-[1.4] mb-2 sm:mb-5 tracking-[0.01em] line-clamp-2">
                {lang === "th" 
                  ? "ค้นหาบ้านและคอนโดที่ตรงใจที่สุดด้วยระบบ AI ค้นหาอัจฉริยะ" 
                  : "Find your ideal home with our smart AI search engine."}
              </p>
              <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-6">
                <li className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-xs text-slate-600">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Search className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="font-medium truncate">{lang === "th" ? "ค้นหาด้วย AI" : "Smart Search"}</span>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-xs text-slate-600">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Home className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="font-medium truncate">{lang === "th" ? "ดูห้องยอดนิยม" : "Browse Listings"}</span>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-xs text-slate-600">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Users className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="font-medium truncate">{lang === "th" ? "คุยกับ Agent" : "Contact Agents"}</span>
                </li>
              </ul>
            </div>
            <Link href="/listings">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 sm:py-3 text-[8px] sm:text-sm font-bold shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/30 transition-all hover:scale-105 px-1">
                {lang === "th" ? "เริ่มค้นหา" : "Start"}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Owner Card */}
          <div className="group bg-white rounded-2xl p-2 sm:p-5 border border-indigo-100/50 shadow-sm hover:shadow-md hover:border-indigo-300/50 transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden" style={{ transitionDelay: '100ms' }}>
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-indigo-100/50 rounded-bl-full -translate-y-8 translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500" />
            <div>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-indigo-600 flex items-center justify-center mb-2 sm:mb-4 text-white shadow-sm shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                <Home className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-[10px] sm:text-base font-bold text-slate-900 mb-1 leading-[1.2] tracking-tight line-clamp-1">
                {lang === "th" ? "เจ้าของ" : "Owners"}
              </h3>
              <p className="text-[8px] sm:text-xs text-slate-600 leading-[1.4] mb-2 sm:mb-5 tracking-[0.01em] line-clamp-2">
                {lang === "th" 
                  ? "ลงประกาศฟรี จัดการข้อมูลห้อง และรับเงินค่าเช่าออนไลน์" 
                  : "Post listings for free and collect rent payments online."}
              </p>
              <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-6">
                <li className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-xs text-slate-600">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Camera className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="font-medium truncate">{lang === "th" ? "ลงประกาศฟรี" : "Free Listings"}</span>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-xs text-slate-600">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <BadgeCheck className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="font-medium truncate">{lang === "th" ? "คัดกรองผู้เช่า" : "Verify Tenants"}</span>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-xs text-slate-600">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Wallet className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="font-medium truncate">{lang === "th" ? "รับเงินออนไลน์" : "Collect Rent"}</span>
                </li>
              </ul>
            </div>
            <Button 
              onClick={handleOwnerPostClick}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-1.5 sm:py-3 text-[8px] sm:text-sm font-bold shadow-sm shadow-indigo-500/25 hover:shadow-md hover:shadow-indigo-500/30 transition-all hover:scale-105 px-1"
            >
              {lang === "th" ? "ลงประกาศ" : "List Now"}
              <ArrowRight className="w-3 h-3 sm:w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Agent Card */}
          <div className="group bg-white rounded-2xl p-2 sm:p-5 border border-indigo-100/50 shadow-sm hover:shadow-md hover:border-indigo-300/50 transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden" style={{ transitionDelay: '200ms' }}>
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-indigo-100/50 rounded-bl-full -translate-y-8 translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500" />
            <div>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-indigo-600 flex items-center justify-center mb-2 sm:mb-4 text-white shadow-sm shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-[10px] sm:text-base font-bold text-slate-900 mb-1 leading-[1.2] tracking-tight line-clamp-1">
                {lang === "th" ? "นายหน้า" : "Agents"}
              </h3>
              <p className="text-[8px] sm:text-xs text-slate-600 leading-[1.4] mb-2 sm:mb-5 tracking-[0.01em] line-clamp-2">
                {lang === "th" 
                  ? "หาผู้เช่าอัตโนมัติ ร่างเอกสาร และรับเงินค่าคอมมิชชั่นได้ทันที" 
                  : "Receive renter leads, manage contracts, and get commission."}
              </p>
              <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-6">
                <li className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-xs text-slate-600">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Target className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="font-medium truncate">{lang === "th" ? "จับคู่ผู้เช่า" : "Auto-Matching"}</span>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-xs text-slate-600">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <FileSignature className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="font-medium truncate">{lang === "th" ? "จัดการสัญญา" : "Contracts"}</span>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-xs text-slate-600">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Gem className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="font-medium truncate">{lang === "th" ? "รับคอมมิชชั่น" : "Commission"}</span>
                </li>
              </ul>
            </div>
            <Link href="/agent/onboarding">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-1.5 sm:py-3 text-[8px] sm:text-sm font-bold shadow-sm shadow-indigo-500/25 hover:shadow-md hover:shadow-indigo-500/30 transition-all hover:scale-105 px-1">
                {lang === "th" ? "เข้าร่วม" : "Join Now"}
                <ArrowRight className="w-3 h-3 sm:w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <AuthModal 
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          window.location.href = '/post-listing';
        }}
      />
    </section>
  );
}
