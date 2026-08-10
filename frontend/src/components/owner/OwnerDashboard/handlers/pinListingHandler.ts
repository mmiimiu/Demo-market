/**
 * Handler for pinning a listing
 */

import type { Property } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { CREDIT_COSTS } from '@/lib/credit';

interface PinListingHandlerProps {
  user: any;
  db: any;
  creditBalance: number;
  spend: (amount: number, description: string) => void;
  localProperties: Property[];
  setLocalProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  isThai: boolean;
}

export function pinListingHandler({
  user,
  db,
  creditBalance,
  spend,
  localProperties,
  setLocalProperties,
  isThai,
}: PinListingHandlerProps) {
  return (id: string) => {
    if (user?.isMock) {
      if (creditBalance < CREDIT_COSTS.PIN_LISTING) {
        toast({ variant: 'destructive', title: isThai ? 'เครดิตไม่เพียงพอ' : 'Insufficient Credits' });
        return;
      }
      const updated = localProperties.map(p => p.id === id ? { ...p, badge: 'featured' as const } : p) as Property[];
      setLocalProperties(updated);
      localStorage.setItem('primerent_mock_properties', JSON.stringify(updated));
      spend(CREDIT_COSTS.PIN_LISTING, `ปักหมุดประกาศ (Pin): ${id}`);
      toast({ title: isThai ? 'ปักหมุดสำเร็จ!' : 'Listing pinned!', description: isThai ? 'ประกาศของคุณถูกปักหมุดบนสุดเรียบร้อยแล้ว' : 'Listing pinned to top successfully' });
      return;
    }

    if (!db) return;
    if (creditBalance < CREDIT_COSTS.PIN_LISTING) {
      toast({
        variant: 'destructive',
        title: isThai ? 'เครดิตไม่เพียงพอ' : 'Insufficient Credits',
        description: isThai 
          ? `ต้องการ ${CREDIT_COSTS.PIN_LISTING} ₡ เพื่อปักหมุดประกาศ (ยอดปัจจุบัน: ${creditBalance} ₡)` 
          : `Requires ${CREDIT_COSTS.PIN_LISTING} ₡ to pin. (Current: ${creditBalance} ₡)`
      });
      return;
    }
    const propRef = doc(db, 'properties', id);
    updateDoc(propRef, { badge: 'featured' })
      .then(() => {
        spend(CREDIT_COSTS.PIN_LISTING, `ปักหมุดประกาศ (Pin): ${id}`);
        toast({ title: isThai ? 'ปักหมุดสำเร็จ!' : 'Listing pinned!', description: isThai ? 'ประกาศของคุณถูกปักหมุดบนสุดเรียบร้อยแล้ว' : 'Listing pinned to top successfully' });
      });
  };
}
