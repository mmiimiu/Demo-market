/**
 * Handler for creating a new listing
 */

import { CREDIT_COSTS } from '@/lib/credit';
import { toast } from '@/hooks/use-toast';

interface CreateListingHandlerProps {
  creditBalance: number;
  setIsPostListingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isThai: boolean;
}

export function createListingHandler({
  creditBalance,
  setIsPostListingOpen,
  isThai,
}: CreateListingHandlerProps) {
  return () => {
    if (creditBalance < CREDIT_COSTS.POST_LISTING) {
      toast({
        variant: 'destructive',
        title: isThai ? 'เครดิตไม่เพียงพอ' : 'Insufficient Credits',
        description: isThai 
          ? `ต้องการอย่างน้อย ${CREDIT_COSTS.POST_LISTING} ₡ เพื่อสร้างประกาศใหม่ (ยอดปัจจุบัน: ${creditBalance} ₡)` 
          : `Requires at least ${CREDIT_COSTS.POST_LISTING} ₡ to create a listing. (Current: ${creditBalance} ₡)`
      });
      return;
    }
    setIsPostListingOpen(true);
  };
}
