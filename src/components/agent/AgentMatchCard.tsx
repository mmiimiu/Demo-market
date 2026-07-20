'use client';

/**
 * @fileOverview AgentMatchCard Component
 * แสดงผลเอเจนต์ที่จับคู่ได้จาก Matching Engine
 * รองรับ SLA countdown timer และ Warm Handoff notification
 */

import React, { useState, useEffect } from 'react';
import { Star, Phone, MessageCircle, Clock, Shield, TrendingUp, ChevronRight, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSLATimeRemaining, TIER_LABELS, type MatchResult } from '@/lib/matching-engine';
import type { Language } from '@/lib/types';

interface AgentMatchCardProps {
  result: MatchResult;
  lang: Language;
  rank: number;
  onContact?: (agentId: string, method: 'call' | 'chat' | 'line') => void;
  onAccept?: (agentId: string) => void;
}

export const AgentMatchCard: React.FC<AgentMatchCardProps> = ({
  result,
  lang,
  rank,
  onContact,
  onAccept,
}) => {
  const { agent, score, matchReasons, isRadiusExpanded, estimatedResponseMinutes, slaDeadline } = result;

  const [slaTime, setSlaTime] = useState(() => getSLATimeRemaining(slaDeadline));

  // SLA countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSlaTime(getSLATimeRemaining(slaDeadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [slaDeadline]);

  const tierColors: Record<string, string> = {
    '💎 Platinum': 'bg-gradient-to-r from-violet-500 to-purple-600',
    '🥇 Gold':     'bg-gradient-to-r from-yellow-500 to-amber-500',
    '🥈 Silver':   'bg-gradient-to-r from-gray-400 to-slate-500',
    '🥉 Bronze':   'bg-gradient-to-r from-orange-600 to-amber-700',
  };

  const tierLabel = TIER_LABELS[agent.tier];
  const tierGradient = tierColors[tierLabel] || 'bg-gray-400';

  const urgencyColors = {
    normal:   'text-green-600 bg-green-50 border-green-100',
    warning:  'text-orange-600 bg-orange-50 border-orange-100',
    critical: 'text-red-600 bg-red-50 border-red-100',
  };

  const isTop = rank === 1;

  return (
    <div className={cn(
      'relative rounded-2xl border bg-white overflow-hidden transition-all duration-300 hover:shadow-xl',
      isTop ? 'border-[#E51D53]/30 shadow-lg shadow-[#E51D53]/10' : 'border-gray-100 shadow-sm'
    )}>
      {/* Top Rank Banner */}
      {isTop && (
        <div className="bg-gradient-to-r from-[#E51D53] to-[#D41B4D] text-white text-center py-2 text-xs font-black uppercase tracking-widest">
          ⭐ {lang === 'th' ? 'แนะนำสูงสุด' : 'Best Match'}
        </div>
      )}

      {isRadiusExpanded && (
        <div className="bg-amber-50 border-b border-amber-100 text-amber-700 text-center py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          {lang === 'th' ? 'ขยายพื้นที่ค้นหา' : 'Expanded Search Area'}
        </div>
      )}

      <div className="p-6">
        {/* Agent Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative shrink-0">
            {agent.photoURL ? (
              <img
                src={agent.photoURL}
                alt={agent.displayName}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#E51D53]/10 flex items-center justify-center text-2xl font-black text-[#E51D53]">
                {agent.displayName.charAt(0)}
              </div>
            )}
            {/* Tier badge */}
            <div className={cn('absolute -bottom-2 -right-2 px-2 py-0.5 rounded-xl text-[9px] font-black text-white', tierGradient)}>
              {agent.tier.toUpperCase()}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-black text-gray-900 text-base truncate">{agent.displayName}</h3>
              {agent.tier === 'platinum' && (
                <Shield className="w-4 h-4 text-violet-500 shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-current" />
                <span className="font-black text-gray-800">{agent.rating}</span>
              </div>
              <span>•</span>
              <span>{agent.totalDeals} {lang === 'th' ? 'ดีล' : 'deals'}</span>
              <span>•</span>
              <span>{agent.experienceYears} {lang === 'th' ? 'ปี' : 'yrs'}</span>
            </div>

            {/* Match Score Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-xl h-1.5 overflow-hidden">
                <div
                  className={cn('h-full rounded-xl transition-all duration-700', score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-400' : 'bg-orange-400')}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={cn('text-[10px] font-black', score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-orange-600')}>
                {score}%
              </span>
            </div>
          </div>
        </div>

        {/* Match Reasons */}
        {matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {matchReasons.map((reason, i) => (
              <span key={i} className="px-2.5 py-1 bg-[#E51D53]/5 text-[#E51D53] text-[10px] font-black rounded-xl border border-[#E51D53]/10">
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-5 bg-gray-50 rounded-xl p-3">
          <div className="text-center">
            <div className="text-[10px] text-gray-400 font-bold mb-1">
              {lang === 'th' ? 'ตอบกลับ' : 'Response'}
            </div>
            <div className="text-sm font-black text-gray-900 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#E51D53]" />
              ~{estimatedResponseMinutes}m
            </div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-[10px] text-gray-400 font-bold mb-1">
              {lang === 'th' ? 'อัตราตอบ' : 'Response Rate'}
            </div>
            <div className="text-sm font-black text-green-600">
              {Math.round(agent.responseRate * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-400 font-bold mb-1">
              {lang === 'th' ? 'งานปัจจุบัน' : 'Active Jobs'}
            </div>
            <div className="text-sm font-black text-gray-900">
              {agent.activeJobs}/{agent.maxJobs}
            </div>
          </div>
        </div>

        {/* SLA Timer */}
        <div className={cn(
          'flex items-center justify-between p-3 rounded-xl border mb-4 text-xs',
          urgencyColors[slaTime.urgencyLevel]
        )}>
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-3.5 h-3.5" />
            {slaTime.isExpired
              ? (lang === 'th' ? 'SLA หมดเวลา — กำลัง Handoff...' : 'SLA Expired — Handing off...')
              : (lang === 'th' ? 'SLA หมดเวลาใน' : 'SLA expires in')}
          </div>
          {!slaTime.isExpired && (
            <div className="font-black text-base tabular-nums">
              {String(slaTime.minutes).padStart(2, '0')}:{String(slaTime.seconds).padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {agent.specialties.map(s => (
            <Badge key={s} variant="outline" className="text-[9px] font-black uppercase tracking-wider text-gray-500 border-gray-100 rounded-xl">
              {s}
            </Badge>
          ))}
          {agent.serviceAreas.slice(0, 2).map(a => (
            <Badge key={a} className="text-[9px] font-black bg-[#E51D53]/5 text-[#E51D53] border-[#E51D53]/10 rounded-xl">
              📍 {a}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {onAccept && (
            <Button
              onClick={() => onAccept(agent.uid)}
              className="w-full h-12 rounded-xl bg-[#E51D53] hover:bg-[#D41B4D] font-black text-sm gap-2 shadow-lg shadow-[#E51D53]/20 hover:scale-[1.01] transition-transform"
            >
              <TrendingUp className="w-4 h-4" />
              {lang === 'th' ? 'เลือกเอเจนต์นี้' : 'Select This Agent'}
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            {agent.phoneNumber && (
              <Button
                variant="outline"
                onClick={() => onContact?.(agent.uid, 'call')}
                className="h-10 rounded-xl text-xs font-black gap-1.5 border-gray-100 hover:border-[#E51D53]/20"
              >
                <Phone className="w-3.5 h-3.5" />
                {lang === 'th' ? 'โทร' : 'Call'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onContact?.(agent.uid, 'chat')}
              className="h-10 rounded-xl text-xs font-black gap-1.5 border-gray-100 hover:border-[#E51D53]/20"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {lang === 'th' ? 'แชท' : 'Chat'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
