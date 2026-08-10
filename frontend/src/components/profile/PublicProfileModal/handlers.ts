import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Language } from '@/lib/types';

export const handleStartChat = (
  currentUser: any,
  profileData: any,
  onClose: () => void,
  router: ReturnType<typeof useRouter>,
  lang: Language
) => {
  const isTh = lang === 'th';
  if (!currentUser) {
    toast({ variant: 'destructive', title: isTh ? 'กรุณาเข้าสู่ระบบ' : 'Please Login', description: isTh ? 'ต้องเข้าสู่ระบบก่อนเพื่อเริ่มแชท' : 'Log in to start chatting.' });
    return;
  }
  localStorage.setItem('chat_initiate_user', JSON.stringify({ uid: profileData.uid, displayName: profileData.displayName, photoURL: profileData.photoURL, role: profileData.role }));
  toast({ title: isTh ? 'กำลังเชื่อมต่อ' : 'Connecting', description: `${isTh ? 'เริ่มต้นคุยกับ' : 'Starting chat with'} ${profileData.displayName}` });
  onClose();
  router.push('/chat');
};

export const handleShareLine = (profileData: any, lang: Language) => {
  const isTh = lang === 'th';
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${profileData.uid}` : '';
  const lineText = encodeURIComponent(
    isTh 
      ? `ดูโปรไฟล์ผู้ใช้ของฉันบน PrimeRent ที่นี่:\n${shareUrl}`
      : `Check out my profile on PrimeRent here:\n${shareUrl}`
  );
  window.open(`https://line.me/R/msg/text/?${lineText}`, '_blank');
  toast({
    title: isTh ? 'เปิดแอป LINE แล้ว' : 'LINE Opened',
    description: isTh ? 'ลิงก์โปรไฟล์ถูกแชร์ไปยัง LINE แล้ว' : 'Profile link shared to LINE.',
  });
};

export const handleSubmittingReview = async (
  newComment: string,
  newAuthorName: string,
  newRating: number,
  userId: string | null,
  currentUser: any,
  db: any,
  setDbReviews: React.Dispatch<React.SetStateAction<any[]>>,
  setNewComment: React.Dispatch<React.SetStateAction<string>>,
  setNewAuthorName: React.Dispatch<React.SetStateAction<string>>,
  setShowReviewForm: React.Dispatch<React.SetStateAction<boolean>>,
  setSubmittingReview: React.Dispatch<React.SetStateAction<boolean>>,
  lang: Language
) => {
  const isTh = lang === 'th';
  if (!newComment.trim() || !newAuthorName.trim()) return;
  setSubmittingReview(true);
  try {
    const isRealUser = currentUser && !currentUser.isMock;
    const reviewObj = {
      targetUserId: userId,
      authorName: newAuthorName,
      authorId: currentUser?.uid || 'anonymous',
      rating: newRating,
      text: newComment,
      createdAt: new Date().toISOString(),
    };
    
    if (isRealUser && db) {
      try {
        await addDoc(collection(db, 'user_reviews'), reviewObj);
      } catch (err) {
        console.error('Failed to submit review to Firestore:', err);
      }
    }

    const savedReviews = localStorage.getItem('primerent_user_reviews');
    const reviewsList = savedReviews ? JSON.parse(savedReviews) : [];
    const newLocalReview = {
      id: `local-${Date.now()}`,
      ...reviewObj,
      date: new Date().toLocaleDateString(),
    };
    localStorage.setItem('primerent_user_reviews', JSON.stringify([newLocalReview, ...reviewsList]));
    
    setDbReviews(prev => [
      {
        id: newLocalReview.id,
        author: newAuthorName,
        rating: newRating,
        comment: newComment,
        date: newLocalReview.date,
      },
      ...prev
    ]);
    
    setNewComment('');
    setNewAuthorName('');
    setShowReviewForm(false);
    toast({
      title: isTh ? 'บันทึกรีวิวสำเร็จ' : 'Review Submitted Successfully',
      description: isTh ? 'รีวิวของคุณได้รับการบันทึกเรียบร้อยแล้ว' : 'Your review has been successfully submitted.',
    });
  } catch (err) {
    console.error('Failed to submit review:', err);
    toast({
      variant: 'destructive',
      title: isTh ? 'เกิดข้อผิดพลาดในการบันทึกรีวิว' : 'Failed to Submit Review',
    });
  } finally {
    setSubmittingReview(false);
  }
};
