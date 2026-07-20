import type { Property } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { doc, deleteDoc } from 'firebase/firestore';
import { logAudit } from '@/lib/audit';

interface DeleteListingHandlerProps {
  user: any;
  db: any;
  localProperties: Property[];
  setLocalProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  isThai: boolean;
}

export function deleteListingHandler({
  user,
  db,
  localProperties,
  setLocalProperties,
  isThai,
}: DeleteListingHandlerProps) {
  return (id: string) => {
    const userId = user?.uid || 'unknown_user';
    if (user?.isMock) {
      if (!confirm(isThai ? 'ยืนยันการลบประกาศ?' : 'Are you sure you want to delete this?')) return;
      const updated = localProperties.filter(p => p.id !== id);
      setLocalProperties(updated);
      localStorage.setItem('primerent_mock_properties', JSON.stringify(updated));
      
      logAudit('delete', 'property', id, userId, 'ลบประกาศห้องพัก (จำลอง)');
      toast({ title: 'Delete', variant: "destructive" });
      return;
    }

    if (!db || !confirm(isThai ? 'ยืนยันการลบประกาศ?' : 'Are you sure you want to delete this?')) return;
    deleteDoc(doc(db, 'properties', id))
      .then(() => {
        logAudit('delete', 'property', id, userId, 'ลบประกาศห้องพักบนระบบคลาวด์');
        toast({ title: 'Delete', variant: "destructive" });
      });
  };
}
