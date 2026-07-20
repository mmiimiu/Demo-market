'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Flame, Clock, BadgeCheck, MessageCircle, MoreHorizontal, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type TenantRequest = {
  id: string;
  tenantName: string;
  avatar: string;
  zone: string;
  budget: number;
  requirements: string[];
  urgency: 'hot' | 'normal';
  status: 'new' | 'contacted' | 'viewing' | 'closed';
  postedAt: string;
};

const INITIAL_REQUESTS: TenantRequest[] = [
  { id: 't1', tenantName: 'Tanaka Kenji', avatar: 'TK', zone: 'Asok / Sukhumvit', budget: 20000, requirements: ['Gym', 'Near BTS'], urgency: 'hot', status: 'new', postedAt: '1h ago' },
  { id: 't2', tenantName: 'สมใจ ดีงาม', avatar: 'สด', zone: 'Ari / Phaya Thai', budget: 12000, requirements: ['Pool', 'Washing Machine'], urgency: 'normal', status: 'new', postedAt: '4h ago' },
  { id: 't3', tenantName: 'Lena Müller', avatar: 'LM', zone: 'Silom / Sathorn', budget: 45000, requirements: ['City View', 'EV Charging'], urgency: 'hot', status: 'contacted', postedAt: '1d ago' },
  { id: 't4', tenantName: 'Michael Chen', avatar: 'MC', zone: 'Thong Lo', budget: 30000, requirements: ['Pet Friendly'], urgency: 'normal', status: 'viewing', postedAt: '2d ago' },
];

const COLUMNS = [
  { id: 'new', title: 'New Requests', color: 'bg-indigo-500' },
  { id: 'contacted', title: 'Contacted', color: 'bg-blue-500' },
  { id: 'viewing', title: 'Viewing', color: 'bg-amber-500' },
  { id: 'closed', title: 'Closed / Won', color: 'bg-emerald-500' },
] as const;

export function TenantRequestBoard({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const [requests, setRequests] = useState<TenantRequest[]>(INITIAL_REQUESTS);
  const [search, setSearch] = useState('');

  const filteredRequests = requests.filter(r => 
    r.tenantName.toLowerCase().includes(search.toLowerCase()) || 
    r.zone.toLowerCase().includes(search.toLowerCase())
  );

  const moveRequest = (id: string, newStatus: TenantRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="space-y-6 bg-[#f8fafc] p-2 rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{lang === 'th' ? 'บอร์ดจัดการลูกค้า (Kanban)' : 'Tenant Requests Board'}</h2>
          <p className="text-sm font-medium text-slate-500">Track and manage prospective tenants</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search by name or zone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 border-slate-200 shadow-sm bg-white rounded-xl text-sm font-medium"
            />
          </div>
          <Button className="h-10 px-3 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 overflow-x-auto">
        {COLUMNS.map(col => {
          const columnRequests = filteredRequests.filter(r => r.status === col.id);
          
          return (
            <div key={col.id} className="flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", col.color)} />
                  <h3 className="text-sm font-black text-slate-800">{col.title}</h3>
                  <span className="text-xs font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">{columnRequests.length}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-4 h-4" /></button>
              </div>

              <div className="flex flex-col gap-3 min-h-[500px] bg-slate-100/50 rounded-2xl p-2 border border-slate-200/60">
                {columnRequests.map(request => (
                  <Card key={request.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-xl bg-white cursor-grab active:cursor-grabbing">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-600 rounded-md bg-slate-50">{request.zone}</Badge>
                        {request.urgency === 'hot' && <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />}
                      </div>

                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 rounded-lg shadow-sm border border-slate-100">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 text-xs font-black">
                            {request.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">{request.tenantName}</h4>
                          <p className="text-[11px] font-bold text-emerald-600">Budget: ฿{request.budget.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {request.requirements.slice(0, 2).map((req, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{req}</span>
                        ))}
                      </div>

                      <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{request.postedAt}</span>
                        </div>
                        
                        {/* Status Actions */}
                        <div className="flex gap-1">
                          {col.id === 'new' && <Button size="sm" variant="ghost" onClick={() => moveRequest(request.id, 'contacted')} className="h-6 px-2 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded">Contact</Button>}
                          {col.id === 'contacted' && <Button size="sm" variant="ghost" onClick={() => moveRequest(request.id, 'viewing')} className="h-6 px-2 text-[10px] bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold rounded">View</Button>}
                          {col.id === 'viewing' && <Button size="sm" variant="ghost" onClick={() => moveRequest(request.id, 'closed')} className="h-6 px-2 text-[10px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold rounded">Close</Button>}
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
