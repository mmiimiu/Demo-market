import { useMemo, useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Property } from '@/lib/types';
import { mockProperties } from '@/lib/properties';
import { ProfileData } from './types';

export function useListings(profileData: ProfileData | null, db: any) {
  const [realListings, setRealListings] = useState<Property[]>([]);

  const associatedListings = useMemo(() => {
    if (!profileData || profileData.role === 'renter') return [];
    if (profileData.uid === 'mock-landlord-john') return mockProperties.slice(0, 3);
    if (profileData.uid.includes('mock-agent-1') || profileData.displayName.includes('Bangkok')) return mockProperties.filter(p => p.locationEn.includes('Sukhumvit'));
    if (profileData.uid.includes('mock-agent-2')) return mockProperties.filter(p => p.price >= 25000);
    if (profileData.uid.includes('mock-agent-3') || profileData.displayName.includes('Phuket')) return mockProperties.filter(p => p.locationEn.includes('Phuket'));
    return mockProperties.slice(4, 7);
  }, [profileData]);

  const recommendedListings = useMemo(() => {
    if (!profileData || profileData.role !== 'renter' || !profileData.preferences) return [];
    return mockProperties.filter(p =>
      p.price >= (profileData.preferences?.budgetMin || 0) &&
      p.price <= (profileData.preferences?.budgetMax || 999999) &&
      profileData.preferences?.propertyTypes.includes(p.type)
    ).slice(0, 4);
  }, [profileData]);

  useEffect(() => {
    if (!profileData || profileData.role === 'renter') return;
    
    // For mock/dev test, fetch from localStorage as well
    const stored = localStorage.getItem('primerent_mock_properties');
    let localItems: Property[] = [];
    if (stored) {
      try {
        const list = JSON.parse(stored);
        // Match user uid or the fallback mock_owner_id or dev_mock_owner_id
        localItems = list.filter((p: any) => 
          p.ownerId === profileData.uid || 
          p.ownerId === 'mock_owner_id' || 
          p.ownerId === 'dev_mock_owner_id'
        );
      } catch (e) {}
    }
    
    // Show local items immediately
    setRealListings(localItems);

    if (!db) {
      return;
    }

    const fetchListings = async () => {
      try {
        const q = query(collection(db, 'properties'), where('ownerId', '==', profileData.uid));
        const snap = await getDocs(q);
        const items: Property[] = [];
        snap.forEach(docSnap => {
          const d = docSnap.data();
          items.push({
            ...d, // keep all original data, override specific fields below
            id: docSnap.id, // we might need string id or number id, but keep it as is
            name: d.name || '',
            nameEn: d.nameEn || d.name || '',
            location: d.location || '',
            locationEn: d.locationEn || d.location || '',
            price: d.price || 0,
            sqm: d.sqm || 0,
            img: d.img || d.images?.[0] || 'https://picsum.photos/seed/prop/800/600',
            type: d.type || 'condo',
            amenities: d.amenities || [],
            ownerId: d.ownerId || '',
            agentId: d.agentId || '',
            isTemplate: d.isTemplate || false,
            status: d.status || 'published',
            isPublicTemplate: d.isPublicTemplate || false,
            templateName: d.templateName || '',
          } as any);
        });
        // Merge both
        setRealListings([...localItems, ...items]);
      } catch (err) {
        console.error('Failed to fetch real user listings:', err);
        setRealListings(localItems);
      }
    };
    fetchListings();
  }, [profileData, db]);

  const displayListings = useMemo(() => {
    const combined = [...associatedListings, ...realListings];
    // Deduplicate by ID first
    const uniqueById = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    // Aggressive deduplication for templates by originalPropertyId OR templateName
    const finalUnique: Property[] = [];
    const seenTplKeys = new Set<string>();
    
    for (const item of uniqueById) {
      if (item.isTemplate) {
        const key = item.originalPropertyId 
          ? `orig_${item.originalPropertyId}` 
          : `name_${(item.templateName || item.name || '').trim().toLowerCase()}`;
          
        if (seenTplKeys.has(key)) {
          continue; // Skip duplicate template
        }
        seenTplKeys.add(key);
      }
      finalUnique.push(item);
    }
    
    return finalUnique;
  }, [realListings, associatedListings]);

  return { displayListings, recommendedListings };
}
