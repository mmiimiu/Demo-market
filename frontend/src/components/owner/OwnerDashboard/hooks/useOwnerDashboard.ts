import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Property } from '@/lib/types';

export function useOwnerDashboard() {
  const { user } = useUser();
  const db = useFirestore();

  const [activeTab, setActiveTab] = useState<'properties' | 'matching' | 'tenants' | 'billing' | 'contracts' | 'analytics' | 'screening' | 'notifications'>('properties');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isPostListingOpen, setIsPostListingOpen] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [localProperties, setLocalProperties] = useState<Property[]>([]);

  // Fetch mock properties
  useEffect(() => {
    if (!user) return;
    if (user.isMock) {
      const storedProps = localStorage.getItem('primerent_mock_properties');
      if (storedProps && storedProps.includes('710 วัน')) {
        try {
          setLocalProperties(JSON.parse(storedProps) as Property[]);
        } catch (e) {
          console.error(e);
        }
      } else {
        const now = new Date();
        const dateWarn = new Date();
        dateWarn.setDate(now.getDate() - 710);
        const dateExpired = new Date();
        dateExpired.setDate(now.getDate() - 750);

        const defaultProps: Property[] = [
          {
            id: 'mock_prop_1',
            ownerId: user.uid,
            name: 'Sukhumvit Luxury Condo 2BR',
            nameEn: 'Sukhumvit Luxury Condo 2BR',
            nameCn: 'Sukhumvit Luxury Condo 2BR',
            type: 'condo',
            price: 28000,
            location: 'อโศก / สุขุมวิท, กรุงเทพฯ',
            locationEn: 'Asoke / Sukhumvit, Bangkok',
            locationCn: 'Asoke / Sukhumvit, Bangkok',
            img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60',
            bed: 2,
            bath: 2,
            sqm: 65,
            isVerified: true,
            boosted: false,
            badge: 'featured',
            imageHint: 'thailand property',
            amenities: ['pool', 'gym'],
            stars: 5,
            updatedAt: now.toISOString()
          },
          {
            id: 'mock_prop_warn',
            ownerId: user.uid,
            name: 'ใกล้หมดอายุ - BTS Ari Studio (710 วัน)',
            nameEn: 'Near Expiry - BTS Ari Studio (710 days)',
            nameCn: 'Near Expiry - BTS Ari Studio',
            type: 'condo',
            price: 15000,
            location: 'อารีย์, กรุงเทพฯ',
            locationEn: 'Ari, Bangkok',
            locationCn: 'Ari, Bangkok',
            img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
            bed: 1,
            bath: 1,
            sqm: 32,
            isVerified: false,
            boosted: false,
            badge: '',
            imageHint: 'thailand property',
            amenities: ['pool'],
            stars: 4,
            updatedAt: dateWarn.toISOString()
          },
          {
            id: 'mock_prop_expired',
            ownerId: user.uid,
            name: 'หมดอายุแล้ว - Rama 9 Suite (750 วัน)',
            nameEn: 'Expired - Rama 9 Suite (750 days)',
            nameCn: 'Expired - Rama 9 Suite',
            type: 'condo',
            price: 18000,
            location: 'พระราม 9, กรุงเทพฯ',
            locationEn: 'Rama 9, Bangkok',
            locationCn: 'Rama 9, Bangkok',
            img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60',
            bed: 1,
            bath: 1,
            sqm: 40,
            isVerified: true,
            boosted: false,
            badge: '',
            imageHint: 'thailand property',
            amenities: ['gym'],
            stars: 4,
            updatedAt: dateExpired.toISOString()
          }
        ];
        setLocalProperties(defaultProps);
        localStorage.setItem('primerent_mock_properties', JSON.stringify(defaultProps));
      }
    }
  }, [user, isPostListingOpen]);

  // Fetch contracts
  useEffect(() => {
    if (!user) return;
    if (user.isMock) {
      const stored = localStorage.getItem('contracts');
      if (stored) {
        try {
          setContracts(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    } else if (db) {
      const q = query(collection(db, 'contracts'), where('ownerId', '==', user.uid));
      getDocs(q).then((snap) => {
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setContracts(list);
      }).catch((err) => console.error(err));
    }
  }, [db, user, activeTab]);

  // Fetch only user's listings
  const myPropertiesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'properties'), where('ownerId', '==', user.uid));
  }, [db, user]);

  const { data: properties, loading } = useCollection<Property>(myPropertiesQuery);

  const displayProperties = user?.isMock ? localProperties : (properties || []);
  const displayLoading = user?.isMock ? false : loading;

  return {
    activeTab, setActiveTab,
    editingProperty, setEditingProperty,
    isPostListingOpen, setIsPostListingOpen,
    contracts, setContracts,
    localProperties, setLocalProperties,
    displayProperties, displayLoading,
    user, db
  };
}
