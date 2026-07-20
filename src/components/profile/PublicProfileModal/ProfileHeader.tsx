import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  role: UserRole;
  roleLabel: string;
  roleBg: string;
  kycStatus: string;
  displayName: string;
  onClose: () => void;
}

export function ProfileHeader({ role, roleLabel, roleBg, kycStatus, displayName, onClose }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-2">
        <Badge className={cn("text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-none", roleBg)}>
          {roleLabel}
        </Badge>
        {kycStatus === 'verified' && (
          <div className="flex items-center gap-1 text-green-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Verified</span>
          </div>
        )}
      </div>
      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
