import { adminDb } from '@/firebase/admin';
import { createPostOrAnswer, patchPost } from './mutations';

export const communityService = {
  getPosts: async (category: string, zone: string, search: string, page: number, limit: number) => {
    if (!adminDb) {
      return { posts: [], total: 0, message: 'Firebase Admin SDK not initialized' };
    }

    let q = adminDb.collection('community_posts') as FirebaseFirestore.Query;
    if (category) q = q.where('category', '==', category);
    if (zone)     q = q.where('zone', '==', zone);

    const snap = await q.orderBy('createdAt', 'desc').limit(limit).get();
    let posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Client-side search
    if (search) {
      posts = posts.filter((p: any) =>
        p.title?.includes(search) ||
        p.content?.includes(search) ||
        p.tags?.some((t: string) => t.includes(search))
      );
    }

    return { posts, total: posts.length, page, limit };
  },

  createPostOrAnswer,
  patchPost
};
