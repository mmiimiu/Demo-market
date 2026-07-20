import { adminDb } from '@/firebase/admin';

export async function createPostOrAnswer(body: {
  type: 'post' | 'answer';
  authorId: string;
  postId?: string;
  title?: string;
  content: string;
  category?: string;
  zone?: string;
  tags?: string[];
}) {
  const { type, authorId, ...data } = body;

  if (!adminDb) {
    return { success: true, id: 'mock_id', message: 'Mock mode' };
  }

  const userDoc = await adminDb.collection('users').doc(authorId).get();
  if (!userDoc.exists) {
    throw new Error('Author not found');
  }
  const author = userDoc.data()!;

  if (type === 'post') {
    if (!data.title) {
      throw new Error('title is required for a post');
    }
    const postData = {
      type: 'post',
      title: data.title,
      content: data.content,
      category: data.category || 'ทั่วไป',
      zone: data.zone || 'ทั่วประเทศ',
      tags: data.tags || [],
      author: { id: authorId, name: author.name, role: author.role, verified: author.verified, transactionVerified: author.transactionVerified || false },
      views: 0,
      answers: [],
      reported: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const ref = await adminDb.collection('community_posts').add(postData);
    return { success: true, id: ref.id, post: { id: ref.id, ...postData } };
  }

  if (type === 'answer') {
    if (!data.postId) {
      throw new Error('postId is required for an answer');
    }
    const answerData = {
      id: `ans_${Date.now()}`,
      author: { id: authorId, name: author.name, role: author.role, verified: author.verified, transactionVerified: author.transactionVerified || false },
      content: data.content,
      votes: 0,
      voterIds: [],
      isAccepted: false,
      createdAt: new Date().toISOString(),
    };

    const postRef = adminDb.collection('community_posts').doc(data.postId);
    const postSnap = await postRef.get();
    const existingAnswers = postSnap.data()?.answers || [];

    await postRef.update({
      answers: [...existingAnswers, answerData],
      updatedAt: new Date().toISOString(),
    });
    return { success: true, answer: answerData };
  }

  throw new Error('type must be post or answer');
}

export async function patchPost(body: {
  action: 'vote' | 'accept' | 'report';
  postId: string;
  answerId?: string;
  userId: string;
  reason?: string;
}) {
  const { action, postId, answerId, userId, reason } = body;

  if (!adminDb) {
    return { success: true, message: 'Mock mode' };
  }

  const postRef  = adminDb.collection('community_posts').doc(postId);
  const postSnap = await postRef.get();
  if (!postSnap.exists) {
    throw new Error('Post not found');
  }

  const postData = postSnap.data()!;

  if (action === 'vote' && answerId) {
    const answers = postData.answers.map((a: any) => {
      if (a.id !== answerId) return a;
      const alreadyVoted = (a.voterIds || []).includes(userId);
      return {
        ...a,
        votes: alreadyVoted ? a.votes - 1 : a.votes + 1,
        voterIds: alreadyVoted ? a.voterIds.filter((id: string) => id !== userId) : [...(a.voterIds || []), userId],
      };
    });
    await postRef.update({ answers });
    return { success: true, action: 'vote toggled' };
  }

  if (action === 'accept' && answerId) {
    if (postData.author?.id !== userId) {
      throw new Error('Only the post author can accept an answer');
    }
    const answers = postData.answers.map((a: any) => ({ ...a, isAccepted: a.id === answerId }));
    await postRef.update({ answers, updatedAt: new Date().toISOString() });
    return { success: true, action: 'answer accepted' };
  }

  if (action === 'report') {
    await postRef.update({ reported: true, reportedBy: userId, reportReason: reason || null, reportedAt: new Date().toISOString() });
    await adminDb.collection('moderation_tickets').add({
      type: 'community_post',
      postId,
      reportedBy: userId,
      reason: reason || 'ไม่ระบุ',
      status: 'open',
      createdAt: new Date().toISOString(),
    });
    return { success: true, action: 'post reported' };
  }

  throw new Error(`Unknown action: ${action}`);
}
