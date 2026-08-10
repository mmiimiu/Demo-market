import React from 'react';
import type { Property } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { CREDIT_COSTS } from '@/lib/credit';
import { ToastAction } from '@/components/ui/toast';

interface BoostListingHandlerProps {
  user: any;
  db: any;
  creditBalance: number;
  spend: (amount: number, description: string) => void;
  localProperties: Property[];
  setLocalProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  isThai: boolean;
}

export function boostListingHandler({
  user,
  db,
  creditBalance,
  spend,
  localProperties,
  setLocalProperties,
  isThai,
}: BoostListingHandlerProps) {
  return (id: string) => {
    if (user?.isMock) {
      if (creditBalance < CREDIT_COSTS.BOOST_LISTING) {
        toast({
          title: isThai ? 'เลือกช่องทางชำระเงินโฆษณา' : 'Choose Ad Payment Method',
          description: isThai 
            ? 'เครดิตไม่พอชำระค่าบูสต์ (10 ₡) คุณสามารถจ่ายตรง ฿99 ผ่าน PromptPay' 
            : 'Insufficient credits (Requires 10 ₡). Pay 99 THB directly via PromptPay.',
          action: (
            <ToastAction
              altText={isThai ? 'ชำระเงิน' : 'Pay'}
              onClick={() => {
                const updated = localProperties.map(p => p.id === id ? { ...p, boosted: true } : p) as Property[];
                setLocalProperties(updated);
                localStorage.setItem('primerent_mock_properties', JSON.stringify(updated));
                toast({
                  title: isThai ? 'ชำระเงินโฆษณาสำเร็จ!' : 'Ad Payment Confirmed!',
                  description: isThai 
                    ? `ระบบชำระเงินหักยอด ฿99.00 และโปรโมทประกาศขึ้นด้านบนแล้ว เลขที่คำสั่งซื้อ: #ad_boost_${Date.now().toString().slice(-6)}`
                    : `Paid 99.00 THB and promoted listing to top. Invoice: #ad_boost_${Date.now().toString().slice(-6)}`,
                });
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg border-none"
            >
              {isThai ? 'ชำระเงิน ฿99' : 'Pay 99 THB'}
            </ToastAction>
          )
        });
        return;
      }
      
      const updated = localProperties.map(p => p.id === id ? { ...p, boosted: true } : p) as Property[];
      setLocalProperties(updated);
      localStorage.setItem('primerent_mock_properties', JSON.stringify(updated));
      spend(CREDIT_COSTS.BOOST_LISTING, `ดันประกาศ (Boost): ${id}`);
      toast({ title: isThai ? 'ดันประกาศสำเร็จ!' : 'Listing boosted!', description: isThai ? 'ประกาศของคุณถูกดันอันดับการค้นหาเรียบร้อยแล้ว' : 'Search ranking boosted successfully' });
      return;
    }

    if (!db) return;
    if (creditBalance < CREDIT_COSTS.BOOST_LISTING) {
      toast({
        title: isThai ? 'เลือกช่องทางชำระเงินโฆษณา' : 'Choose Ad Payment Method',
        description: isThai 
          ? 'เครดิตไม่พอชำระค่าบูสต์ (10 ₡) คุณสามารถจ่ายตรง ฿99 ผ่าน PromptPay' 
          : 'Insufficient credits (Requires 10 ₡). Pay 99 THB directly via PromptPay.',
        action: (
          <ToastAction
            altText={isThai ? 'ชำระเงิน' : 'Pay'}
            onClick={() => {
              const propRef = doc(db, 'properties', id);
              updateDoc(propRef, { boosted: true, boostedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) })
                .then(() => {
                  toast({
                    title: isThai ? 'ชำระเงินโฆษณาสำเร็จ!' : 'Ad Payment Confirmed!',
                    description: isThai 
                      ? `ระบบชำระเงินหักยอด ฿99.00 และโปรโมทประกาศขึ้นด้านบนแล้ว เลขที่คำสั่งซื้อ: #ad_boost_${Date.now().toString().slice(-6)}`
                      : `Paid 99.00 THB and promoted listing to top. Invoice: #ad_boost_${Date.now().toString().slice(-6)}`,
                  });
                });
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg border-none"
          >
            {isThai ? 'ชำระเงิน ฿99' : 'Pay 99 THB'}
          </ToastAction>
        )
      });
      return;
    }
    
    const propRef = doc(db, 'properties', id);
    updateDoc(propRef, { boosted: true, boostedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) })
      .then(() => {
        spend(CREDIT_COSTS.BOOST_LISTING, `ดันประกาศ (Boost): ${id}`);
        toast({ title: isThai ? 'ดันประกาศสำเร็จ!' : 'Listing boosted!', description: isThai ? 'ประกาศของคุณถูกดันอันดับการค้นหาเรียบร้อยแล้ว' : 'Search ranking boosted successfully' });
      });
  };
}
