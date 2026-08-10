import React from 'react';
import { HardHat, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LiffNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
        <HardHat className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Under Construction</h2>
      <p className="text-slate-500 mb-8 max-w-xs">
        This feature is currently being built and is not yet available in the simulator.
      </p>
      
      {/* 
        We use history.back() for iframe navigation since we don't know the exact origin route,
        but since this is a server component by default, we can't use window. 
        So we just provide a link to the root or tell them to use the header back button.
      */}
      <Link 
        href="/line-oa"
        className="w-full max-w-xs bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 flex items-center justify-center font-bold"
      >
        Close Window
      </Link>
    </div>
  );
}
