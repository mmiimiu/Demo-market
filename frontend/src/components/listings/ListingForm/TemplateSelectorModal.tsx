import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Language } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit, deleteDoc, doc } from 'firebase/firestore';
import { LayoutTemplate, Loader2, Globe, User as UserIcon, Trash2, CheckSquare } from 'lucide-react';
import { ListingFormData } from './types';
import { cn } from '@/lib/utils';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (data: Partial<ListingFormData>) => void;
  lang: Language;
}

export function TemplateSelectorModal({ isOpen, onClose, onSelect, lang }: TemplateSelectorModalProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const isTh = lang === 'th';

  useEffect(() => {
    if (!isOpen || !user) return;
    
    // reset selection when switching tabs
    setSelectedIds(new Set());

    const fetchTemplates = async () => {
      setLoading(true);
      try {
        if (user.isMock) {
          const stored = localStorage.getItem('primerent_mock_properties');
          const allProps = stored ? JSON.parse(stored) : [];
          const myTpls = allProps.filter((p: any) => p.isTemplate && (p.ownerId === user.uid || p.ownerId === 'mock_owner_id' || p.ownerId === 'dev_mock_owner_id'));
          const pubTpls = allProps.filter((p: any) => p.isTemplate && p.isPublicTemplate && p.ownerId !== user.uid);
          setTemplates(activeTab === 'my' ? myTpls : pubTpls);
        } else if (db) {
          const q = activeTab === 'my'
            ? query(collection(db, 'properties'), where('ownerId', '==', user.uid), where('isTemplate', '==', true), limit(20))
            : query(collection(db, 'properties'), where('isPublicTemplate', '==', true), limit(50));
            
          const snapshot = await getDocs(q);
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Also fetch local mock templates if any for the db user (fallback)
          const stored = localStorage.getItem('primerent_mock_properties');
          const allProps = stored ? JSON.parse(stored) : [];
          const localMyTpls = allProps.filter((p: any) => p.isTemplate && (p.ownerId === user.uid || p.ownerId === 'mock_owner_id' || p.ownerId === 'dev_mock_owner_id'));
          
          // Filter out user's own templates from public tab
          let finalDocs = activeTab === 'my' ? [...localMyTpls, ...docs] : docs.filter((d: any) => d.ownerId !== user.uid);

          // Deduplicate first by ID
          finalDocs = Array.from(new Map(finalDocs.map(item => [item.id, item])).values());
          
          // Aggressively deduplicate templates by originalPropertyId or name
          const deduplicated: any[] = [];
          const seenKeys = new Set<string>();
          for (const item of finalDocs) {
            const key = item.originalPropertyId 
              ? `orig_${item.originalPropertyId}` 
              : `name_${(item.templateName || item.name || '').trim().toLowerCase()}`;
            if (seenKeys.has(key)) continue;
            seenKeys.add(key);
            deduplicated.push(item);
          }
          
          setTemplates(deduplicated);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [isOpen, activeTab, user, db]);

  const handleSelect = (tpl: any) => {
    onSelect({
      title: tpl.title || tpl.name || '',
      description: tpl.description || '',
      price: tpl.price?.toString() || '',
      type: tpl.type || 'condo',
      location: tpl.location || tpl.locationEn || '',
      floor: tpl.floor?.toString() || '',
      bed: tpl.bed?.toString() || '1',
      bath: tpl.bath?.toString() || '1',
      sqm: tpl.sqm?.toString() || '30',
      deposit: tpl.deposit?.toString() || '',
      contractTerm: tpl.contractTerm?.toString() || '12',
      commonFee: tpl.commonFee?.toString() || '',
      tour360Url: tpl.tour360Url || '',
      amenities: tpl.amenities || [],
      waterRate: tpl.waterRate?.toString() || '',
      electricityRate: tpl.electricityRate?.toString() || '',
      internetIncluded: tpl.internetIncluded || false,
    });
  };

  const toggleSelect = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (!user || selectedIds.size === 0) return;
    if (confirm(isTh ? `คุณแน่ใจหรือไม่ว่าต้องการลบเทมเพลตที่เลือก (${selectedIds.size} รายการ)?` : `Are you sure you want to delete ${selectedIds.size} templates?`)) {
      const idsToDelete = Array.from(selectedIds);
      let newTemplates = [...templates];
      
      // Delete locally
      const stored = localStorage.getItem('primerent_mock_properties');
      if (stored) {
        const allProps = JSON.parse(stored);
        const newProps = allProps.filter((p: any) => !idsToDelete.includes(p.id));
        localStorage.setItem('primerent_mock_properties', JSON.stringify(newProps));
      }
      
      // Delete from Firestore
      if (db) {
        for (const id of idsToDelete) {
          if (typeof id === 'string' && !id.startsWith('mock_')) {
            try {
              await deleteDoc(doc(db, 'properties', id));
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
      
      setTemplates(templates.filter(t => !idsToDelete.includes(t.id)));
      setSelectedIds(new Set());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[600px] p-0 overflow-hidden ${lang === 'th' ? 'font-thai' : 'font-english'}`}>
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-indigo-600" />
            {isTh ? 'เลือกจากเทมเพลต' : 'Select a Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 flex gap-4 border-b border-gray-100 justify-between items-end">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('my')}
              className={`py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'my' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <UserIcon className="w-4 h-4" />
              {isTh ? 'เทมเพลตของฉัน' : 'My Templates'}
            </button>
            <button 
              onClick={() => setActiveTab('public')}
              className={`py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'public' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Globe className="w-4 h-4" />
              {isTh ? 'เทมเพลตสาธารณะ' : 'Public Templates'}
            </button>
          </div>
          
          {activeTab === 'my' && selectedIds.size > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="mb-3 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isTh ? `ลบ (${selectedIds.size})` : `Delete (${selectedIds.size})`}
            </button>
          )}
        </div>

        <div className="p-6 bg-gray-50/50 min-h-[300px] max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-medium">{isTh ? 'กำลังโหลดเทมเพลต...' : 'Loading templates...'}</p>
            </div>
          ) : templates.length > 0 ? (
            <div className="grid gap-3">
              {templates.map(tpl => {
                const isSelected = selectedIds.has(tpl.id);
                return (
                  <div 
                    key={tpl.id} 
                    className={cn(
                      "bg-white border rounded-xl p-4 flex justify-between items-center transition-colors shadow-sm",
                      isSelected ? "border-indigo-400 bg-indigo-50/30" : "border-gray-200 hover:border-indigo-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {activeTab === 'my' && (
                        <div 
                          className="cursor-pointer p-1 -ml-1 text-gray-400 hover:text-indigo-600 transition-colors"
                          onClick={(e) => toggleSelect(e, tpl.id)}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                            isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"
                          )}>
                            {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900">{tpl.templateName || tpl.name || 'Unnamed Template'}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {tpl.type} • {tpl.bed} Bed • ฿{tpl.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleSelect(tpl)} className="rounded-lg font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none">
                        {isTh ? 'ใช้เทมเพลตนี้' : 'Use Template'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              <LayoutTemplate className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-bold">{isTh ? 'ไม่พบเทมเพลต' : 'No templates found'}</p>
              <p className="text-xs mt-1">{activeTab === 'my' ? (isTh ? 'คุณยังไม่มีเทมเพลตที่บันทึกไว้' : "You haven't saved any templates yet") : (isTh ? 'ยังไม่มีเทมเพลตสาธารณะ' : 'No public templates available')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
