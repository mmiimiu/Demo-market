'use client';

import React from 'react';
import { Search, Calendar, Sparkles, CreditCard, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { WebviewTab } from './types';
import { RICH_MENU_TABS } from './types';

const ICONS: Record<string, React.ReactNode> = {
  search:      <Search className="w-5 h-5" />,
  appointment: <Calendar className="w-5 h-5" />,
  agent:       <Sparkles className="w-5 h-5" />,
  billing:     <CreditCard className="w-5 h-5" />,
  contracts:   <FileText className="w-5 h-5" />,
};

interface RichMenuProps {
  open: boolean;
  onToggle: () => void;
  activeTab: WebviewTab;
  onTabSelect: (tab: WebviewTab) => void;
}

export default function RichMenu({ open, onToggle, activeTab, onTabSelect }: RichMenuProps) {
  return (
    <div className="bg-white border-t border-gray-200 z-30 shrink-0">
      {/* Toggle bar */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-1.5 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
      >
        <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#06c755] animate-pulse" />
          Rich Menu — เมนูหลัก
        </span>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          : <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        }
      </button>

      {/* 2-row grid: 3 cols top, 2 cols bottom */}
      {open && (
        <div className="p-1.5 grid grid-cols-3 gap-1.5 select-none">
          {/* Row 1: 3 buttons */}
          {RICH_MENU_TABS.slice(0, 3).map((item) => (
            <RichMenuBtn
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={() => onTabSelect(activeTab === item.id ? 'none' : item.id)}
            />
          ))}

          {/* Row 2: 2 buttons centered */}
          <div className="col-span-3 grid grid-cols-2 gap-1.5">
            {RICH_MENU_TABS.slice(3).map((item) => (
              <RichMenuBtn
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => onTabSelect(activeTab === item.id ? 'none' : item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RichMenuBtn({
  item,
  isActive,
  onClick,
}: {
  item: typeof RICH_MENU_TABS[number];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl transition-all duration-150 border
        ${isActive
          ? 'bg-[#06c755] border-[#06c755] text-white shadow-lg scale-[1.03]'
          : 'bg-emerald-50/60 border-emerald-100 text-gray-700 hover:bg-[#06c755]/10 hover:border-[#06c755]/40'
        }`}
    >
      <span className={isActive ? 'text-white' : 'text-[#06c755]'}>
        {ICONS[item.id]}
      </span>
      <span className="text-[10px] font-black leading-tight text-center">{item.label}</span>
    </button>
  );
}
