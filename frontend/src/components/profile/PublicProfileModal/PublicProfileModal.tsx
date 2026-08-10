"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Language, UserRole } from '@/lib/types';
import { translations } from '@/lib/translations';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PublicProfileModalProps } from './types';
import { useProfileData } from './useProfileData';
import { useListings } from './useListings';
import { useReviews } from './useReviews';
import { handleStartChat, handleShareLine, handleSubmittingReview } from './handlers';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSidebar } from './ProfileSidebar';
import { StatsRow } from './StatsRow';
import { ListingsTab } from './ListingsTab';
import { ReviewsTab } from './ReviewsTab';
import { PreferencesTab } from './PreferencesTab';

export function PublicProfileModal({ isOpen, onClose, userId, lang }: PublicProfileModalProps) {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const t = translations[lang] || translations.th;
  const isTh = lang === 'th';
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'preferences'>('listings');

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const profileData = useProfileData(userId, lang);
  const { displayListings, recommendedListings } = useListings(profileData, db);
  const { combinedReviews, avgRating, setDbReviews } = useReviews(userId, lang, db);

  useEffect(() => {
    if (profileData) setActiveTab(profileData.role === 'renter' ? 'preferences' : 'listings');
  }, [profileData]);

  if (!profileData) return null;

  const roleLabel: Record<UserRole, string> = {
    renter: isTh ? 'Renter' : 'Renter',
    user: isTh ? 'User' : 'User',
    landlord: isTh ? 'Landlord' : 'Landlord',
    owner: isTh ? 'Owner' : 'Owner',
    agent: isTh ? 'Agent' : 'Agent',
    admin: 'Admin',
    superadmin: 'Super Admin',
    sa: 'Super Admin',
  };

  const roleBg: Record<UserRole, string> = {
    renter: 'bg-emerald-500', user: 'bg-emerald-500',
    landlord: 'bg-indigo-500', owner: 'bg-indigo-500',
    agent: 'bg-primary', admin: 'bg-violet-600',
    superadmin: 'bg-rose-600', sa: 'bg-rose-600',
  };

  const isOwn = currentUser?.uid === profileData.uid;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-4xl p-0 overflow-hidden border border-gray-200 shadow-none bg-white max-h-[90vh] flex flex-col",
        lang === 'th' ? "font-thai" : lang === 'cn' ? "font-chinese" : "font-english"
      )}>
        <DialogTitle className="sr-only">Profile: {profileData.displayName}</DialogTitle>
        <ProfileHeader
          role={profileData.role}
          roleLabel={roleLabel[profileData.role]}
          roleBg={roleBg[profileData.role]}
          kycStatus={profileData.kycStatus}
          displayName={profileData.displayName}
          onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">
            <ProfileSidebar
              profileData={profileData}
              isOwn={isOwn}
              isTh={isTh}
              lang={lang}
              onChat={() => handleStartChat(currentUser, profileData, onClose, router, lang)}
              onShare={() => handleShareLine(profileData, lang)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <StatsRow profileData={profileData} displayListings={displayListings} avgRating={avgRating} isTh={isTh} />
              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex flex-col flex-1 overflow-hidden">
                <TabsList className="bg-white border-b border-gray-100 rounded-none p-0 h-auto justify-start shrink-0">
                  {profileData.role !== 'renter' ? (<>
                    <TabsTrigger value="listings" className="rounded-none font-bold text-xs px-5 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                      {isTh ? 'รายการ' : 'Listings'} ({displayListings.length})
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-none font-bold text-xs px-5 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                      {isTh ? 'รีวิว' : 'Reviews'} ({combinedReviews.length})
                    </TabsTrigger>
                  </>) : (<>
                    <TabsTrigger value="preferences" className="rounded-none font-bold text-xs px-5 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                      {isTh ? 'ความต้องการ' : 'Preferences'}
                    </TabsTrigger>
                    <TabsTrigger value="listings" className="rounded-none font-bold text-xs px-5 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                      {isTh ? 'ห้องแนะนำ' : 'Recommended'}
                    </TabsTrigger>
                  </>)}
                </TabsList>
                <ListingsTab profileData={profileData} displayListings={displayListings} recommendedListings={recommendedListings} isTh={isTh} lang={lang} />
                <ReviewsTab
                  combinedReviews={combinedReviews}
                  avgRating={avgRating}
                  showReviewForm={showReviewForm}
                  newRating={newRating}
                  newComment={newComment}
                  newAuthorName={newAuthorName}
                  submittingReview={submittingReview}
                  isTh={isTh}
                  onToggleReviewForm={() => setShowReviewForm(v => !v)}
                  onSetNewRating={setNewRating}
                  onSetNewComment={setNewComment}
                  onSetNewAuthorName={setNewAuthorName}
                  onSubmitReview={() => handleSubmittingReview(newComment, newAuthorName, newRating, userId, currentUser, db, setDbReviews, setNewComment, setNewAuthorName, setShowReviewForm, setSubmittingReview, lang)}
                />
                <PreferencesTab profileData={profileData} isTh={isTh} t={t} />
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
