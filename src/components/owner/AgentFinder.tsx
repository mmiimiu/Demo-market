'use client';
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Shield, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import type { AgentProfile } from '@/lib/matching-engine';

interface AgentFinderProps {
  lang: Language;
  propertyId: string;
  onInviteSuccess?: () => void;
}

export const AgentFinder: React.FC<AgentFinderProps> = ({ lang, propertyId, onInviteSuccess }) => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [invitingId, setInvitingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const MOCK_AGENTS: AgentProfile[] = [
          { uid: 'agent-001', displayName: 'คุณอรุณ สว่างใจ', photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent001', tier: 'platinum', rating: 4.9, responseRate: 0.97, avgResponseMinutes: 8, serviceAreas: ['สุขุมวิท', 'อโศก', 'ทองหล่อ'], specialties: ['condo'], activeJobs: 2, maxJobs: 5, isAvailable: true, experienceYears: 8, totalDeals: 342 },
          { uid: 'agent-002', displayName: 'คุณมณี รุ่งเรือง', photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent002', tier: 'gold', rating: 4.7, responseRate: 0.93, avgResponseMinutes: 12, serviceAreas: ['ลาดพร้าว', 'รัชดา', 'ห้วยขวาง'], specialties: ['condo', 'house'], activeJobs: 1, maxJobs: 4, isAvailable: true, experienceYears: 5, totalDeals: 198 }
        ];
        setAgents(MOCK_AGENTS);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const handleInvite = async (agentId: string) => {
    setInvitingId(agentId);
    try {
      const res = await fetch('/api/owner/invite-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, agentId })
      });
      const data = await res.json();
      if (data.success) {
        alert(lang === 'th' ? 'ส่งคำเชิญสำเร็จ!' : 'Invitation sent successfully!');
        if (onInviteSuccess) onInviteSuccess();
      } else {
        alert(data.error || 'Failed to send invite');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setInvitingId(null);
    }
  };

  const filteredAgents = agents.filter(a => 
    a.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.serviceAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-none p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            {lang === 'th' ? 'ค้นหาเอเจนต์ดูแลห้อง' : 'Find Property Agent'}
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            {lang === 'th' ? 'เลือกเอเจนต์เพื่อมอบหมายการหาผู้เช่าและดูแลห้อง' : 'Select an agent to manage your property'}
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={lang === 'th' ? 'ค้นหาชื่อ, ทำเล...' : 'Search name, area...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 font-black animate-pulse">LOADING AGENTS...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAgents.map(agent => (
            <div key={agent.uid} className="flex flex-col p-4 rounded-none border-2 border-gray-50 hover:border-primary/20 transition-colors bg-white group">
              <div className="flex items-start gap-4 mb-4">
                <img src={agent.photoURL} alt={agent.displayName} className="w-14 h-14 rounded-none object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h4 className="font-black text-gray-900 truncate">{agent.displayName}</h4>
                    {agent.tier === 'platinum' && <Shield className="w-4 h-4 text-violet-500 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" /> {agent.rating}
                    </div>
                    <span>•</span>
                    <span>{agent.totalDeals} deals</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {agent.serviceAreas.slice(0, 3).map(area => (
                  <Badge key={area} variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 border-none rounded-none">
                    <MapPin className="w-3 h-3 mr-1" /> {area}
                  </Badge>
                ))}
              </div>

              <Button 
                onClick={() => handleInvite(agent.uid)}
                disabled={invitingId === agent.uid}
                className={cn(
                  "w-full h-10 rounded-none font-black text-sm gap-2 transition-all mt-auto",
                  invitingId === agent.uid ? "bg-primary/50 text-white" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                )}
              >
                {invitingId === agent.uid ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {lang === 'th' ? 'ส่งคำเชิญดูแลห้อง' : 'Invite Agent'}
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


