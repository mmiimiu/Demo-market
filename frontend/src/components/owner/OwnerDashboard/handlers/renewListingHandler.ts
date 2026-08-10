import type { Property } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { CREDIT_COSTS } from '@/lib/credit';
import { logAudit } from '@/lib/audit';

interface RenewListingHandlerProps {
  user: any;
  db: any;
  creditBalance: number;
  spend: (amount: number, description: string) => void;
  localProperties: Property[];
  setLocalProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  isThai: boolean;
}

export function renewListingHandler({
  user,
  db,
  creditBalance,
  spend,
  localProperties,
  setLocalProperties,
  isThai,
}: RenewListingHandlerProps) {
  return (id: string) => {
    const userId = user?.uid || 'unknown_user';
    if (user?.isMock) {
      if (creditBalance < CREDIT_COSTS.RENEW_LISTING) {
        toast({ variant: 'destructive', title: isThai ? 'เครดิตไม่เพียงพอ' : 'Insufficient Credits' });
        return;
      }
      // Also restore status to active/published and clear autoHidden state
      const updated = localProperties.map(p => p.id === id ? { 
        ...p, 
        status: 'published' as const, 
        autoHidden: false, 
        updatedAt: new Date().toISOString() as any 
      } : p) as Property[];
      setLocalProperties(updated);
      localStorage.setItem('primerent_mock_properties', JSON.stringify(updated));
      spend(CREDIT_COSTS.RENEW_LISTING, `ต่ออายุประกาศ: ${id}`);
      logAudit('renew', 'property', id, userId, 'ต่ออายุประกาศห้องพักและยกเลิกการซ่อนประกาศ (จำลอง)');
      toast({ title: 'Renew', description: isThai ? 'ต่ออายุประกาศสำเร็จ' : 'Listing renewed successfully' });
      return;
    }

    if (!db) return;
    if (creditBalance < CREDIT_COSTS.RENEW_LISTING) {
      toast({
        variant: 'destructive',
        title: isThai ? 'เครดิตไม่เพียงพอ' : 'Insufficient Credits',
        description: isThai 
          ? `ต้องการ ${CREDIT_COSTS.RENEW_LISTING} ₡ เพื่อต่ออายุประกาศ (ยอดปัจจุบัน: ${creditBalance} ₡)` 
          : `Requires ${CREDIT_COSTS.RENEW_LISTING} ₡ to renew. (Current: ${creditBalance} ₡)`
      });
      return;
    }
    const propRef = doc(db, 'properties', id);
    updateDoc(propRef, { 
      updatedAt: serverTimestamp(),
      status: 'published',
      autoHidden: false
    })
      .then(() => {
        spend(CREDIT_COSTS.RENEW_LISTING, `ต่ออายุประกาศ: ${id}`);
        logAudit('renew', 'property', id, userId, 'ต่ออายุประกาศห้องพักและคืนค่าสถานะ');
        toast({ title: 'Renew', description: isThai ? 'ต่ออายุประกาศสำเร็จ' : 'Listing renewed successfully' });
      });
  };
}
