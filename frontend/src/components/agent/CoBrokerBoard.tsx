'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock, MoreHorizontal, Plus, Handshake } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type CoBrokerListing = {
  id: string;
  agentName: string;
  avatar: string;
  propertyName: string;
  zone: string;
  price: number;
  bed: number;
  bath: number;
  sqm: number;
  split: string;
  status: 'available' | 'negotiating' | 'viewing' | 'closed';
  postedAt: string;
};

const INITIAL_LISTINGS: CoBrokerListing[] = [
  { id: 'c1', agentName: 'Agent Somchai', avatar: 'AS', propertyName: 'The Line Asoke-Ratchada', zone: 'Asok', price: 18000, bed: 1, bath: 1, sqm: 32, split: '50/50', status: 'available', postedAt: '2h ago' },
  { id: 'c2', agentName: 'Agent Jane', avatar: 'AJ', propertyName: 'The Park Chidlom', zone: 'Chidlom', price: 55000, bed: 2, bath: 2, sqm: 90, split: '50/50', status: 'available', postedAt: '5h ago' },
  { id: 'c3', agentName: 'Agent Mike', avatar: 'AM', propertyName: 'Rhythm Sathorn', zone: 'Sathorn', price: 24000, bed: 1, bath: 1, sqm: 35, split: '40/60', status: 'negotiating', postedAt: '1d ago' },
  { id: 'c4', agentName: 'Nantida P.', avatar: 'NP', propertyName: 'Ideo Mobi Sukhumvit', zone: 'On Nut', price: 15000, bed: 1, bath: 1, sqm: 28, split: '50/50', status: 'viewing', postedAt: '2d ago' },
];

const COLUMNS = [
  { id: 'available', title: 'Available', color: 'bg-indigo-500' },
  { id: 'negotiating', title: 'Negotiating', color: 'bg-amber-500' },
  { id: 'viewing', title: 'Viewing', color: 'bg-blue-500' },
  { id: 'closed', title: 'Closed / Won', color: 'bg-emerald-500' },
] as const;

export function CoBrokerBoard({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const [listings, setListings] = useState<CoBrokerListing[]>(INITIAL_LISTINGS);
  const [search, setSearch] = useState('');

  const filteredListings = listings.filter(l => 
    l.propertyName.toLowerCase().includes(search.toLowerCase()) || 
    l.zone.toLowerCase().includes(search.toLowerCase()) ||
    l.agentName.toLowerCase().includes(search.toLowerCase())
  );

  const moveListing = (id: string, newStatus: CoBrokerListing['status']) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  return (
    <div className="space-y-6 bg-[#f8fafc] p-2 rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{lang === 'th' ? 'กระดาน Co-Broke (Kanban)' : 'Co-Broke Board'}</h2>
          <p className="text-sm font-medium text-slate-500">Collaborate with other agents on available listings</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search by property or agent..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 border-slate-200 shadow-sm bg-white rounded-xl text-sm font-medium"
            />
          </div>
          <Button className="h-10 px-3 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-1" /> Add Listing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 overflow-x-auto">
        {COLUMNS.map(col => {
          const columnListings = filteredListings.filter(l => l.status === col.id);
          
          return (
            <div key={col.id} className="flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", col.color)} />
                  <h3 className="text-sm font-black text-slate-800">{col.title}</h3>
                  <span className="text-xs font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">{columnListings.length}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-4 h-4" /></button>
              </div>

              <div className="flex flex-col gap-3 min-h-[500px] bg-slate-100/50 rounded-2xl p-2 border border-slate-200/60">
                {columnListings.map(listing => (
                  <Card key={listing.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-xl bg-white cursor-grab active:cursor-grabbing">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] font-bold border-indigo-200 text-indigo-700 rounded-md bg-indigo-50">Split: {listing.split}</Badge>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {listing.zone}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight mb-1">{listing.propertyName}</h4>
                        <p className="text-[11px] font-bold text-emerald-600">฿{listing.price.toLocaleString()} / month</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">{listing.bed} Bed • {listing.bath} Bath • {listing.sqm} sqm</p>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="w-6 h-6 rounded-full shadow-sm border border-slate-100">
                          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 text-[9px] font-black">
                            {listing.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-slate-700">{listing.agentName}</span>
                      </div>

                      <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{listing.postedAt}</span>
                        </div>
                        
                        {/* Status Actions */}
                        <div className="flex gap-1">
                          {col.id === 'available' && <Button size="sm" variant="ghost" onClick={() => moveListing(listing.id, 'negotiating')} className="h-6 px-2 text-[10px] bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold rounded">Negotiate</Button>}
                          {col.id === 'negotiating' && <Button size="sm" variant="ghost" onClick={() => moveListing(listing.id, 'viewing')} className="h-6 px-2 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded">View</Button>}
                          {col.id === 'viewing' && <Button size="sm" variant="ghost" onClick={() => moveListing(listing.id, 'closed')} className="h-6 px-2 text-[10px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold rounded">Close</Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
