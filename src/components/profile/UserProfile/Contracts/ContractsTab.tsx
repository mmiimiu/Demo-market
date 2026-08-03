import React, { useState, useEffect } from 'react';
import { Language, UserRole } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DelegationsTab } from '../Delegations/DelegationsTab';
import { ContractManager } from '@/components/shared/ContractManager';
import { ContractDraftManager } from '@/components/shared/ContractManager/ContractDraftManager';
import { FileText, Briefcase, FilePen } from 'lucide-react';

interface ContractsTabProps {
  lang: Language;
  currentRole: UserRole;
  currentUser: any;
}

export const ContractsTab: React.FC<ContractsTabProps> = ({ lang, currentRole, currentUser }) => {
  const isAgent = currentRole === 'agent';
  const isOwner = currentRole === 'owner' || currentRole === 'landlord';
  const canUseDraft = isAgent || isOwner;
  const isTh = lang === 'th';

  const [activeSubTab, setActiveSubTab] = useState(canUseDraft ? 'draft' : 'rental');

  useEffect(() => {
    if (canUseDraft && activeSubTab !== 'draft' && activeSubTab !== 'delegation') {
      setActiveSubTab('draft');
    } else if (!canUseDraft && activeSubTab === 'draft') {
      setActiveSubTab('rental');
    }
  }, [canUseDraft]);

  return (
    <div className="space-y-6">
      {/* 📋 Move-in Checklist Quick Link */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-blue-900 flex items-center gap-2">
            📋 {isTh ? 'แบบประเมินสภาพห้องพักก่อนเข้าอยู่อาศัย (Move-in Checklist)' : 'Move-in Room Inspection Checklist'}
          </h4>
          <p className="text-xs text-blue-700 font-semibold leading-relaxed">
            {isTh
              ? 'บันทึกหลักฐานสภาพทรัพย์สิน ถ่ายรูปแนบ พร้อมเซ็นลายเซ็น เพื่อใช้เป็นหลักฐานและป้องกันข้อพิพาทเกี่ยวกับเงินประกัน'
              : 'Inspect room condition, upload photo evidence, and sign to secure your deposit and prevent disputes.'}
          </p>
        </div>
        <a
          href="/checklist/mock_contract"
          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-center shrink-0"
        >
          {isTh ? 'ทำเช็คลิสต์ตรวจห้องพัก' : 'Start Inspection'}
        </a>
      </div>

      {/* ── Tabs ── */}
      {canUseDraft ? (
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="mb-6 bg-gray-100/50 p-1 rounded-xl w-full">
            {/* Draft Tab — shown for owner & agent */}
            <TabsTrigger
              value="draft"
              className="flex-1 flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-700"
            >
              <FilePen className="w-4 h-4" />
              {isTh ? 'ร่างสัญญา' : 'Drafts'}
            </TabsTrigger>

            {/* Signed Contracts Tab */}
            <TabsTrigger
              value="rental"
              className="flex-1 flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileText className="w-4 h-4" />
              {isTh ? 'สัญญาที่ลงนามแล้ว' : 'Signed Contracts'}
            </TabsTrigger>

            {/* Delegation Tab — agent only */}
            {isAgent && (
              <TabsTrigger
                value="delegation"
                className="flex-1 flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Briefcase className="w-4 h-4" />
                {isTh ? 'สัญญามอบหมาย' : 'Delegations'}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Draft Content */}
          <TabsContent value="draft" className="mt-0">
            <ContractDraftManager
              lang={lang}
              currentRole={currentRole as 'owner' | 'agent' | 'landlord'}
            />
          </TabsContent>

          {/* Signed Contracts Content */}
          <TabsContent value="rental" className="mt-0">
            <ContractManager contractId="mock_ctr_A1204" lang={lang} forceRole={currentRole as any} />
          </TabsContent>

          {/* Delegation Content — agent only */}
          {isAgent && (
            <TabsContent value="delegation" className="mt-0">
              <DelegationsTab lang={lang} currentRole={currentRole} currentUser={currentUser} />
            </TabsContent>
          )}
        </Tabs>
      ) : (
        /* Tenant view — signed contracts only, no draft */
        <div>
          <ContractManager contractId="mock_ctr_A1204" lang={lang} forceRole={currentRole as any} />
        </div>
      )}
    </div>
  );
};
