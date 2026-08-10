import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export function useLineSync(isTh: boolean) {
  const { user } = useUser();
  const [lineLinked, setLineLinked] = useState(false);
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [loadingLine, setLoadingLine] = useState(true);

  const fetchLineStatus = useCallback(async () => {
    if (!user?.uid) {
      setLoadingLine(false);
      return;
    }
    try {
      setLoadingLine(true);
      const res = await fetch(`/api/line/sync?uid=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setLineLinked(!!data.linked);
        setLineUserId(data.lineUserId || null);
      }
    } catch (err) {
      console.error('Error fetching LINE sync status:', err);
    } finally {
      setLoadingLine(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchLineStatus();
  }, [fetchLineStatus]);

  const handleUnlink = async () => {
    if (!user?.uid) return;
    try {
      setLoadingLine(true);
      const res = await fetch('/api/line/sync', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: user.uid })
      });
      if (res.ok) {
        setLineLinked(false);
        setLineUserId(null);
        toast({
          title: isTh ? 'ยกเลิกการเชื่อมต่อ LINE สำเร็จ' : 'LINE Disconnected',
          description: isTh ? 'ยกเลิกการส่งแจ้งเตือนผ่าน LINE เรียบร้อยแล้ว' : 'Notifications have been disabled.'
        });
      } else {
        throw new Error('Failed to unlink');
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: isTh ? 'เกิดข้อผิดพลาด' : 'Error',
        description: isTh ? 'ไม่สามารถยกเลิกการเชื่อมบัญชีได้' : 'Could not disconnect.'
      });
    } finally {
      setLoadingLine(false);
    }
  };

  return { lineLinked, lineUserId, loadingLine, handleUnlink, fetchLineStatus };
}
