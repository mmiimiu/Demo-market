'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgentMatchingSystem } from '@/components/agent/AgentMatchingSystem';
import { OwnerAgentMatchingSystem } from '@/components/agent/OwnerAgentMatchingSystem';
import { cn } from '@/lib/utils';

interface NavbarFindAgentButtonProps {
  isSolid: boolean;
  userRole?: string | null;
  portal?: string;
  lang?: 'th' | 'en' | 'cn';
}

export const NavbarFindAgentButton: React.FC<NavbarFindAgentButtonProps> = ({ isSolid, userRole, portal, lang = 'th' }) => {
  const [open, setOpen] = useState(false);
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-sm active:scale-95 border",
            isSolid 
              ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-blue-500/10" 
              : "bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
          )}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{isTh ? 'ค้นหาตัวแทน' : isCn ? '寻找经纪人' : 'Find Agent'}</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden border-none bg-transparent shadow-none" aria-describedby={undefined}>
        <DialogTitle className="sr-only">{isTh ? 'ค้นหาตัวแทน' : isCn ? '寻找经纪人' : 'Find Agent'}</DialogTitle>
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col hide-scrollbar relative">
          <div className="overflow-y-auto hide-scrollbar pt-6 sm:pt-0">
            {(portal === 'owner' || userRole === 'owner' || userRole === 'landlord') ? <OwnerAgentMatchingSystem /> : <AgentMatchingSystem />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
