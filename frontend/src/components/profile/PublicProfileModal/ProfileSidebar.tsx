import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Share2, Mail, Phone, MapPin, BadgeCheck } from 'lucide-react';
import { ProfileData } from './types';
import { InfoRow } from './InfoRow';
import { Language } from '@/lib/types';

interface ProfileSidebarProps {
  profileData: ProfileData;
  isOwn: boolean;
  isTh: boolean;
  lang: Language;
  onChat: () => void;
  onShare: () => void;
}

export function ProfileSidebar({ profileData, isOwn, isTh, lang, onChat, onShare }: ProfileSidebarProps) {
  return (
    <div className="lg:w-[280px] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 p-6 flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 shrink-0 border-2 border-gray-100 rounded-none">
          <AvatarImage src={profileData.photoURL} />
          <AvatarFallback className="bg-primary text-white font-bold text-xl rounded-none">
            {profileData.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900 text-base leading-tight truncate">{profileData.displayName}</h2>
          {profileData.role === 'agent' && profileData.licenseId && (
            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{profileData.licenseId}</p>
          )}
          {profileData.role === 'agent' && profileData.isAgentVerified && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full mt-1">
              <BadgeCheck className="w-3 h-3 text-teal-600" />
              Verified Agent
            </span>
          )}
          {profileData.role === 'landlord' && profileData.portfolioSize && profileData.portfolioSize > 0 && (
            <p className="text-[9px] font-bold text-gray-400 mt-1">{isTh ? `${profileData.portfolioSize} ที่พัก` : `${profileData.portfolioSize} properties`}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-600 font-medium leading-relaxed">{profileData.bio}</p>

      <div className="border-t border-gray-100 pt-4">
        <InfoRow icon={Mail} value={profileData.email} />
        <InfoRow icon={Phone} value={profileData.phoneNumber || '08X-XXX-XXXX'} />
        <InfoRow icon={MapPin} value={profileData.location} />
      </div>

      <div className="flex gap-2 w-full shrink-0">
        {!isOwn && (
          <Button onClick={onChat} className="flex-1 h-10 rounded-none bg-primary font-bold text-sm gap-2">
            <MessageCircle className="w-4 h-4" />
            {profileData.role === 'renter'
              ? (isTh ? 'เสนอห้องพัก' : 'Offer Room')
              : (isTh ? 'แชทสอบถาม' : 'Chat')}
          </Button>
        )}
        <Button onClick={onShare} variant="outline" className="h-10 rounded-none border-gray-200 font-bold text-xs gap-1.5 w-12 px-0">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
