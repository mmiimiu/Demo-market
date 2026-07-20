'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, Search, Zap, CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/hooks/use-notification';

interface SavedSearchAlert {
  id: string;
  query: string;
  categories: string[];
  priceMin: number;
  priceMax: number;
  minBedrooms: number;
  minSqm: number;
  amenities: string[];
  savedAt: string;
  active: boolean;
}

export function SavedSearchesTab({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const [alerts, setAlerts] = useState<SavedSearchAlert[]>([]);
  const router = useRouter();
  const notifier = useNotification();
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  useEffect(() => {
    const saved = localStorage.getItem('primerent_saved_searches');
    if (saved) {
      try {
        setAlerts(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Prepopulate with mock search alerts for immediate demo
      const mockAlerts: SavedSearchAlert[] = [
        {
          id: 'alert_mock_1',
          query: 'สีลม / สาทร',
          categories: ['condo'],
          priceMin: 15000,
          priceMax: 45000,
          minBedrooms: 1,
          minSqm: 35,
          amenities: ['pool', 'gym'],
          savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          active: true
        },
        {
          id: 'alert_mock_2',
          query: 'BTS อ่อนนุช',
          categories: ['condo', 'studio'],
          priceMin: 8000,
          priceMax: 18000,
          minBedrooms: 0,
          minSqm: 28,
          amenities: ['parking'],
          savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          active: true
        }
      ];
      setAlerts(mockAlerts);
      localStorage.setItem('primerent_saved_searches', JSON.stringify(mockAlerts));
    }
  }, []);

  const saveAlertsToStorage = (updated: SavedSearchAlert[]) => {
    setAlerts(updated);
    localStorage.setItem('primerent_saved_searches', JSON.stringify(updated));
  };

  const handleToggleActive = (id: string) => {
    const updated = alerts.map(a => {
      if (a.id === id) {
        const nextState = !a.active;
        toast({
          title: nextState 
            ? (isTh ? 'เปิดรับแจ้งเตือนความสนใจ' : 'Alert Activated') 
            : (isTh ? 'ปิดรับแจ้งเตือนชั่วคราว' : 'Alert Paused'),
          description: nextState
            ? (isTh ? 'คุณจะได้รับแจ้งเตือนเมื่อมีอสังหาฯ ตรงความต้องการ' : 'You will receive notifications for new matches.')
            : (isTh ? 'ระงับการแจ้งเตือนสำหรับรายการนี้ชั่วคราว' : 'Notifications paused for this alert.')
        });
        return { ...a, active: nextState };
      }
      return a;
    });
    saveAlertsToStorage(updated);
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    saveAlertsToStorage(updated);
    toast({
      variant: 'destructive',
      title: isTh ? 'ลบรายการแจ้งเตือนสำเร็จ' : 'Search Alert Deleted',
      description: isTh ? 'รายการถูกลบออกจากโปรไฟล์ของคุณแล้ว' : 'The alert was removed from your profile.'
    });
  };

  const handleRunSearch = (alert: SavedSearchAlert) => {
    const params = new URLSearchParams();
    if (alert.query) params.set('q', alert.query);
    if (alert.categories && alert.categories.length > 0 && alert.categories[0] !== 'all') {
      params.set('type', alert.categories[0]);
    }
    if (alert.priceMin > 0) params.set('priceMin', alert.priceMin.toString());
    if (alert.priceMax < 150000) params.set('priceMax', alert.priceMax.toString());
    
    // Redirect to listings page
    router.push(`/listings?${params.toString()}`);
  };

  const handleSimulateMatch = (alert: SavedSearchAlert) => {
    // Generate simulated matched property name and price
    const mockTitles = {
      'สีลม / สาทร': isTh ? 'Life Sathorn Sierra (สีลม-สาทร)' : 'Life Sathorn Sierra Premium',
      'BTS อ่อนนุช': isTh ? 'Artemis Sukhumvit 77 (BTS อ่อนนุช)' : 'Artemis Sukhumvit 77 Condo',
      default: isTh ? 'คอนโดพรีเมียม โครงการใหม่' : 'Premium Luxury Residence'
    };

    const propName = mockTitles[alert.query as keyof typeof mockTitles] || mockTitles.default;
    const matchPrice = Math.round((alert.priceMin + alert.priceMax) / 2 || 22000);

    // Call Context Notification
    notifier.newProperty(
      isTh ? 'พบอสังหาริมทรัพย์ใหม่ตรงใจคุณ! 🚀' : 'New Matching Listing Found! 🚀',
      isTh 
        ? `"${propName}" ราคา ฿${matchPrice.toLocaleString()}/เดือน ตรงกับเงื่อนไขการค้นหา "${alert.query}" ที่คุณบันทึกไว้`
        : `"${propName}" at THB ${matchPrice.toLocaleString()}/mo matches your saved search "${alert.query}"`,
      101, // Mock propertyId
      {
        label: isTh ? 'คลิกเพื่อดูห้อง' : 'View Listing',
        onClick: () => {
          toast({ title: isTh ? 'เปิดดูรายละเอียดทรัพย์สิน...' : 'Loading listing details...' });
        }
      }
    );

    // Prompt custom screen toast for visuals
    toast({
      className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none rounded-none shadow-2xl p-6',
      title: isTh ? '🔔 การแจ้งเตือนอสังหาริมทรัพย์ใหม่!' : '🔔 New Listing Alert!',
      description: isTh 
        ? `พบห้องใหม่ "${propName}" ฿${matchPrice.toLocaleString()} ตรงกับเซฟเสิร์ช "${alert.query}"` 
        : `Found matching room "${propName}" at ฿${matchPrice.toLocaleString()} matching "${alert.query}"`
    });
  };

  return (
    <div className="space-y-6 font-thai animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <div>
          <h4 className="font-black text-gray-800 text-lg">{isTh ? 'การค้นหาและการแจ้งเตือนที่บันทึกไว้' : 'Saved Searches & Alerts'}</h4>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            {isTh ? 'ระบบจะคอยจับตาดูห้องใหม่ๆ ที่เข้ามาในระบบและแจ้งเตือนคุณผ่านทางหน้าเว็บ/อีเมล' : 'Get notified when new listings match your criteria.'}
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-none text-gray-400 font-bold space-y-4">
          <Search className="w-12 h-12 mx-auto text-gray-300" />
          <p className="text-sm">{isTh ? 'ยังไม่มีการค้นหาที่บันทึกไว้' : 'No saved searches yet'}</p>
          <p className="text-xs text-gray-400 leading-normal max-w-xs mx-auto">
            {isTh ? 'คุณสามารถบันทึกแจ้งเตือนได้โดยการค้นหาในหน้าแสดงห้องพักและคลิกปุ่มบันทึกการแจ้งเตือน' : 'Search for properties and click "Save Search Alert" to begin.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 4).map((alert) => (
            <Card key={alert.id} className="border border-gray-200 rounded-xl shadow-none hover:shadow-sm transition-shadow bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 truncate max-w-[200px]">
                        {alert.query || (isTh ? 'ตัวกรอง' : 'Filter')}
                      </span>
                      {alert.categories.map(c => (
                        <Badge key={c} variant="secondary" className="text-[9px] font-medium text-gray-600 bg-gray-100 border-none rounded-full px-2">
                          {c}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>฿{alert.priceMin.toLocaleString()} - ฿{alert.priceMax.toLocaleString()}</span>
                      {alert.minBedrooms > 0 && <span>รวม {alert.minBedrooms}+ ห้องนอน</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(alert.id)}
                      className={`h-8 w-8 rounded-full ${alert.active ? 'text-amber-600' : 'text-gray-400'}`}
                      title={alert.active ? (isTh ? 'ปิดแจ้งเตือน' : 'Mute Alert') : (isTh ? 'เปิดแจ้งเตือน' : 'Unmute Alert')}
                    >
                      {alert.active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
                  <Button 
                    onClick={() => handleRunSearch(alert)}
                    variant="outline"
                    className="flex-1 h-9 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-medium"
                  >
                    <Search className="w-3.5 h-3.5 mr-1.5" />
                    {isTh ? 'ค้นหาอีกครั้ง' : 'Search Again'}
                  </Button>
                  
                  {alert.active && (
                    <Button 
                      onClick={() => handleSimulateMatch(alert)}
                      variant="ghost"
                      className="h-9 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-medium w-auto px-2.5"
                      title={isTh ? 'ทดสอบผลการจับคู่' : 'Simulate Match'}
                    >
                      {isTh ? 'ทดสอบ' : 'Test'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
