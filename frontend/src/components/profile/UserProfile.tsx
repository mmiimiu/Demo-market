'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Language, UserRole } from '@/lib/types';
import { translations } from '@/lib/translations';
import { useUser, useFirestore, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ProfileSidebar } from './UserProfile/ProfileSidebar';
import { TabInfo } from './UserProfile/TabInfo';
import { TabSecurity, TabPreferences } from './UserProfile/TabSecurityPreferences';
import { TabDashboards } from './UserProfile/TabDashboards';
import { KycModal } from './UserProfile/KycModal';
import { ProfileFormData, DEFAULT_FORM_DATA, ProfileTab, getRoleTheme } from './UserProfile/types';
import { calculateCompletion, getTabHeaders } from './UserProfile/utils';
import { RoleUpgrade } from './UserProfile/RoleUpgrade';
import { ContractsTab } from './UserProfile/Contracts/ContractsTab';
import { CreditWallet } from '../credit/CreditWallet';
import { SavedSearchesTab } from './UserProfile/SavedSearchesTab';
import { SavedPropertiesTab } from './UserProfile/SavedPropertiesTab';
import { TenantScreening } from '../shared/TenantScreening';
import { useKycLogic } from './UserProfile/hooks/useKycLogic';
import { MyListingsTab } from './UserProfile/MyListingsTab';
import { TabSearchReport } from './UserProfile/TabSearchReport';
import { TabPayment } from './UserProfile/TabPayment';

export function UserProfile({ lang }: { lang: Language }) {
  const t = translations[lang] || translations.th;
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const { data: userProfile } = useDoc<any>(user && !user.isMock ? `users/${user.uid}` : null);

  const [formData, setFormData] = useState<ProfileFormData>(DEFAULT_FORM_DATA);
  const [newLoc, setNewLoc] = useState('');
  const [newSpec, setNewSpec] = useState('');

  const kyc = useKycLogic(user, lang, formData.displayName);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam as ProfileTab);
      }
    }
  }, []);

  // Sync active tab → URL without page reload so refresh restores the same tab
  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({ tab }, '', url.toString());
    }
  };

  useEffect(() => {
    if (user?.isMock) {
      const saved = localStorage.getItem('prime_mock_user');
      if (saved) {
        try {
          const p = JSON.parse(saved);
          setFormData(prev => ({ ...prev, displayName: p.displayName || '', phoneNumber: p.phoneNumber || '', location: p.location || '', bio: p.bio || '', urgency: p.urgency || 'medium', moveInDate: p.moveInDate || '', budgetMin: p.preferences?.budgetMin ?? 10000, budgetMax: p.preferences?.budgetMax ?? 30000, locations: p.preferences?.locations || [], propertyTypes: p.preferences?.propertyTypes || [], amenities: p.preferences?.amenities || [], portfolioSize: p.portfolioSize ?? 1, responseTime: p.responseTime || 'ภายใน 1 ชั่วโมง', responseRate: p.responseRate ?? 98, licenseId: p.licenseId || '', brokerName: p.brokerName || '', experienceYears: p.experienceYears ?? 1, specialties: p.specialties || [], lineId: p.lineId || '', facebookPage: p.facebookPage || '', website: p.website || '', email: p.email || user?.email || '' }));
        } catch (e) { console.error(e); }
      } else {
        setFormData(prev => ({ ...prev, email: user?.email || '' }));
      }
    } else if (userProfile) {
      setFormData({ displayName: userProfile.displayName || '', phoneNumber: userProfile.phoneNumber || '', location: userProfile.location || '', bio: userProfile.bio || '', urgency: userProfile.urgency || 'medium', moveInDate: userProfile.moveInDate || '', budgetMin: userProfile.preferences?.budgetMin ?? 10000, budgetMax: userProfile.preferences?.budgetMax ?? 30000, locations: userProfile.preferences?.locations || [], propertyTypes: userProfile.preferences?.propertyTypes || [], amenities: userProfile.preferences?.amenities || [], portfolioSize: userProfile.portfolioSize ?? 1, responseTime: userProfile.responseTime || 'ภายใน 1 ชั่วโมง', responseRate: userProfile.responseRate ?? 98, licenseId: userProfile.licenseId || '', brokerName: userProfile.brokerName || '', experienceYears: userProfile.experienceYears ?? 1, specialties: userProfile.specialties || [], lineId: userProfile.lineId || '', facebookPage: userProfile.facebookPage || '', website: userProfile.website || '', email: userProfile.email || user?.email || '' });
    }
  }, [userProfile, user]);

  const currentRole = (userProfile?.role || (user?.isMock ? (localStorage.getItem('primerent_user_role') as UserRole) : null) || 'renter') as UserRole;
  const currentKyc = user?.isMock ? kyc.mockKycStatus : (userProfile?.kycStatus || 'unverified');
  const theme = getRoleTheme(currentRole, lang);
  const { score: completionScore, tips: completionTips } = calculateCompletion(user, userProfile, formData, currentKyc, lang);
  const isAgentVerified = (() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem('prime_mock_user');
      if (stored) return JSON.parse(stored)?.verified?.agent === true;
    } catch { /* ignore */ }
    return localStorage.getItem('primerent_agent_verified') === 'true';
  })();

  const handleSave = () => {
    if (!user) return;
    setLoading(true);
    const payload = { displayName: formData.displayName, phoneNumber: formData.phoneNumber, location: formData.location, bio: formData.bio, urgency: formData.urgency, moveInDate: formData.moveInDate, preferences: { budgetMin: formData.budgetMin, budgetMax: formData.budgetMax, locations: formData.locations, propertyTypes: formData.propertyTypes, amenities: formData.amenities }, portfolioSize: formData.portfolioSize, responseTime: formData.responseTime, responseRate: formData.responseRate, licenseId: formData.licenseId, brokerName: formData.brokerName, experienceYears: formData.experienceYears, specialties: formData.specialties, lineId: formData.lineId, facebookPage: formData.facebookPage, website: formData.website, email: formData.email };
    if (user.isMock) { localStorage.setItem('prime_mock_user', JSON.stringify({ ...user, ...payload })); toast({ title: lang === 'th' ? 'บันทึกสำเร็จ' : 'Saved' }); setLoading(false); setTimeout(() => window.location.reload(), 1000); return; }
    if (!db) { setLoading(false); return; }
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, payload).then(() => { toast({ title: lang === 'th' ? 'อัปเดตสำเร็จ' : 'Updated' }); }).catch(() => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userRef.path, operation: 'update', requestResourceData: payload })); }).finally(() => setLoading(false));
  };

  const hdr = getTabHeaders(t, lang)[activeTab] || getTabHeaders(t, lang).info;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 bg-white">
      <div className="flex flex-col lg:flex-row gap-6">
        <ProfileSidebar lang={lang} t={t} user={user} theme={theme} currentRole={currentRole} currentKyc={currentKyc} isAgentVerified={isAgentVerified} completionScore={completionScore} completionTips={completionTips} activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex-1">
          <Card className="border border-gray-200 shadow-none rounded-none bg-white h-full">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-gray-900">
                <hdr.icon className={cn('w-5 h-5', activeTab === 'security' ? 'text-gray-600' : activeTab === 'preferences' ? 'text-gray-600' : activeTab === 'agent_dashboard' ? 'text-gray-600' : activeTab === 'owner_properties' ? 'text-gray-600' : activeTab === 'public_profile' ? 'text-gray-600' : 'text-gray-600')} />
                {hdr.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">{hdr.desc}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              {activeTab === 'info' && <TabInfo lang={lang} t={t} formData={formData} currentRole={currentRole} theme={theme} loading={loading} newLocationInput={newLoc} newSpecialtyInput={newSpec} onFormChange={(up) => setFormData(prev => ({ ...prev, ...up }))} onNewLocationChange={setNewLoc} onNewSpecialtyChange={setNewSpec} onAddLocation={() => { if (newLoc.trim() && !formData.locations.includes(newLoc.trim())) { setFormData(prev => ({ ...prev, locations: [...prev.locations, newLoc.trim()] })); setNewLoc(''); } }} onRemoveLocation={(l) => setFormData(prev => ({ ...prev, locations: prev.locations.filter(x => x !== l) }))} onAddSpecialty={() => { if (newSpec.trim() && !formData.specialties.includes(newSpec.trim())) { setFormData(prev => ({ ...prev, specialties: [...prev.specialties, newSpec.trim()] })); setNewSpec(''); } }} onRemoveSpecialty={(s) => setFormData(prev => ({ ...prev, specialties: prev.specialties.filter(x => x !== s) }))} onSave={handleSave} />}
              {activeTab === 'security' && <TabSecurity lang={lang} t={t} currentKyc={currentKyc} currentRole={currentRole} isAgentVerified={isAgentVerified} isMockUser={!!user?.isMock} onOpenKycStepper={kyc.openKycModal} onDevInstantVerify={kyc.handleDevInstantVerify} />}
              {activeTab === 'preferences' && <TabPreferences lang={lang} />}
              {activeTab === 'upgrade' && <RoleUpgrade lang={lang} currentUser={user} onUpgradeComplete={() => {}} />}
              {activeTab === 'delegations' && <ContractsTab lang={lang} currentRole={currentRole} currentUser={user} />}
              {activeTab === 'contracts' && <ContractsTab lang={lang} currentRole={currentRole} currentUser={user} />}
              {activeTab === 'credits' && <CreditWallet lang={lang} />}
              {activeTab === 'saved_searches' && <SavedSearchesTab lang={lang} />}
              {activeTab === 'search_reports' && <TabSearchReport lang={lang} />}
              {activeTab === 'saved_properties' && <SavedPropertiesTab />}
              {activeTab === 'my_listings' && <MyListingsTab lang={lang} />}
              {activeTab === 'tenant_screening' && <TenantScreening lang={lang} tenantName={formData.displayName} />}
              {activeTab === 'payment' && <TabPayment lang={lang} currentRole={currentRole} currentUser={user} />}
            </CardContent>
            {(activeTab === 'agent_dashboard' || activeTab === 'owner_properties' || activeTab === 'public_profile') && <TabDashboards lang={lang} activeTab={activeTab} />}
          </Card>
        </div>
      </div>
      <KycModal 
        isOpen={kyc.isOpenKycModal} lang={lang} currentRole={currentRole} 
        kycStep={kyc.kycStep} kycDocType={kyc.kycDocType} kycIdNumber={kyc.kycIdNumber} 
        kycFullName={kyc.kycFullName} uploadedFile={kyc.uploadedFile} 
        uploadProgress={kyc.uploadProgress} isUploading={kyc.isUploading} 
        isMockUser={!!user?.isMock} onClose={() => kyc.setIsOpenKycModal(false)} 
        onSetDocType={kyc.setKycDocType} onSetStep={kyc.setKycStep} 
        onIdNumberChange={kyc.setKycIdNumber} onFullNameChange={kyc.setKycFullName} 
        onFileDrop={kyc.handleFileDrop} onSubmitKyc={kyc.handleSubmitKyc} 
        onDevInstantVerify={kyc.handleDevInstantVerify}
        selectedBank={kyc.selectedBank} onSelectBank={kyc.setSelectedBank}
        ndidPushSent={kyc.ndidPushSent} onSendNdidPush={kyc.setNdidPushSent}
      />
    </div>
  );
}
