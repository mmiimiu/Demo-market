import React from 'react';
import { Plus } from 'lucide-react';
import { ModuleModal } from '../../shared/ModuleModal';
import { ListingForm } from '../../listings/ListingForm';
import { translations } from '@/lib/translations';

interface OwnerDashboardModalsProps {
  lang: 'th' | 'en' | 'cn';
  isPostListingOpen: boolean;
  editingProperty: any;
  onClose: () => void;
}

export function OwnerDashboardModals({ lang, isPostListingOpen, editingProperty, onClose }: OwnerDashboardModalsProps) {
  const t = translations[lang] || translations.th;
  const isThai = lang === 'th';

  return (
    <>
      <ModuleModal 
        isOpen={isPostListingOpen || !!editingProperty} 
        onClose={onClose} 
        lang={lang} 
        title={editingProperty ? t.edit_listing : t.create_listing}
      >
        <ListingForm 
          lang={lang} 
          initialData={editingProperty || undefined} 
          propertyId={editingProperty?.id as string} 
        />
      </ModuleModal>

      {/* Floating Action Button (FAB) for Creating Unit */}
      <button
        onClick={onClose}
        className="fixed bottom-6 right-24 z-50 flex items-center gap-2 px-5 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs sm:text-sm rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        <span>{isThai ? 'สร้างยูนิต' : 'Create Unit'}</span>
      </button>
    </>
  );
}
