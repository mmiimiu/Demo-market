/**
 * AgentCard component
 * Displays an agent's profile in the marketplace
 */

'use client';

import { Star, MapPin, Clock, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { AgentCardProps } from './types';

export default function AgentCard({ agent, onAssign, onViewProfile }: AgentCardProps) {
  const formatRating = (rating: number) => rating.toFixed(1);
  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src="/placeholder-avatar.jpg" />
          <AvatarFallback>AG</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-slate-900">{agent.company_name || 'Agent'}</h3>
            {agent.approval_status === 'approved' && (
              <Badge variant="default" className="bg-green-600">Verified</Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-amber-500 text-sm">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium">{formatRating(agent.rating)}</span>
            <span className="text-slate-500">({agent.total_deals} deals)</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4" />
          <span>{agent.service_areas.join(', ')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4" />
          <span>Avg response: {formatResponseTime(agent.response_time_avg)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Briefcase className="w-4 h-4" />
          <span>{agent.specialties.join(', ')}</span>
        </div>
      </div>

      {/* Commission Rates */}
      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
        <div className="text-xs text-slate-500 mb-2">Commission Rates</div>
        <div className="space-y-1">
          {agent.commission_rates.slice(0, 2).map((rate, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-slate-600">{rate.property_type}</span>
              <span className="font-medium text-slate-900">{rate.rate}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onAssign} className="flex-1">
          Assign Agent
        </Button>
        <Button variant="outline" onClick={onViewProfile}>
          View Profile
        </Button>
      </div>
    </div>
  );
}
