"use client";

import React from 'react';
import { FullTransitMap } from '@/components/shared/FullTransitMap';

export default function AdminMapPage() {
  return (
    <div className="p-8 lg:p-10 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Full Transit Map</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Interactive Bangkok Mass Transit Network Overview</p>
      </div>

      <div className="flex-1 min-h-[600px]">
        <FullTransitMap />
      </div>
    </div>
  );
}
