import { useMemo, useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Language } from '@/lib/types';

export function useReviews(userId: string | null, lang: Language, db: any) {
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const { user: currentUser } = useUser();
  const isTh = lang === 'th';

  const mockReviews = useMemo(() => [
    { id: 1, author: isTh ? 'คุณวิทยา' : 'Witthaya', rating: 5.0, comment: isTh ? 'ดูแลประสานงานดีมากครับ ตอบแชทรวดเร็ว อธิบายทุกขั้นตอนชัดเจน' : 'Excellent service! Very fast responses and transparent process.', date: '2026-05-20' },
    { id: 2, author: 'Melisa Chang', rating: 4.8, comment: isTh ? 'ห้องพักสะอาดตรงปก ได้ราคาเช่าพิเศษ แนะนำเลย' : 'Room exactly as pictured. Helped negotiate great price.', date: '2026-04-12' },
  ], [isTh]);

  useEffect(() => {
    if (!userId) return;
    const fetchReviews = async () => {
      let localItems: any[] = [];
      try {
        const savedReviews = localStorage.getItem('primerent_user_reviews');
        const localReviewsList = savedReviews ? JSON.parse(savedReviews) : [];
        localItems = localReviewsList
          .filter((r: any) => r.targetUserId === userId)
          .map((r: any) => ({
            id: r.id || `local-${Date.now()}`,
            author: r.authorName || 'Anonymous',
            rating: r.rating || 5,
            comment: r.text || '',
            date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : new Date().toLocaleDateString()),
          }));
        setDbReviews(localItems);
      } catch (e) {
        console.error('Failed to parse local reviews:', e);
      }

      const isRealUser = currentUser && !currentUser.isMock;
      if (isRealUser && db) {
        try {
          const q = query(collection(db, 'user_reviews'), where('targetUserId', '==', userId));
          const snap = await getDocs(q);
          const items: any[] = [];
          snap.forEach(docSnap => {
            const d = docSnap.data();
            items.push({
              id: docSnap.id,
              author: d.authorName || 'Anonymous',
              rating: d.rating || 5,
              comment: d.text || '',
              date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            });
          });
          setDbReviews(prev => {
            const combined = [...items, ...prev];
            const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            return unique;
          });
        } catch (err) {
          console.error('Failed to fetch user reviews from Firestore:', err);
        }
      }
    };
    fetchReviews();
  }, [userId, db, currentUser]);

  const combinedReviews = useMemo(() => {
    const uniqueMocks = mockReviews.map((r, i) => ({
      id: `mock-${i}`,
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
    }));
    return [...dbReviews, ...uniqueMocks];
  }, [dbReviews, mockReviews]);

  const avgRating = useMemo(() => {
    if (combinedReviews.length === 0) return 4.9;
    const sum = combinedReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / combinedReviews.length).toFixed(1));
  }, [combinedReviews]);

  return { combinedReviews, avgRating, setDbReviews };
}
