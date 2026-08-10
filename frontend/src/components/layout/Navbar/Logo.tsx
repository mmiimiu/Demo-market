import React from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  isSolid: boolean;
  handleLogoOrHomeClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Logo: React.FC<LogoProps> = ({ isSolid, handleLogoOrHomeClick }) => {
  return (
    <Link 
      href="/" 
      onClick={handleLogoOrHomeClick}
      className="flex items-center gap-2.5 group flex-shrink-0 transition-all duration-300"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1A56DB] to-[#0EA5E9] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
        <Building2 className="w-5 h-5 stroke-[2.2]" />
      </div>
      <span className={cn(
        "text-lg font-black tracking-tight transition-all duration-300 hidden xs:inline group-hover:text-blue-600",
        isSolid ? "text-gray-900" : "text-white group-hover:text-white"
      )}>
        Prime<span className={cn("transition-all duration-300", isSolid ? "text-blue-600" : "text-blue-300")}>Rent</span>
      </span>
    </Link>
  );
};
