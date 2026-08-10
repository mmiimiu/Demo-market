'use client';

import React, { useState } from 'react';
import { Star, Send, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface PostTransactionRatingProps {
  lang: 'th' | 'en' | 'cn';
  targetUserId: string;
  targetRoleName: string; // e.g. "เจ้าของห้อง" (Owner), "ผู้เช่า" (Tenant)
  transactionContext?: string; // e.g. "หลังจากการย้ายเข้า"
}

export function PostTransactionRating({ lang, targetUserId, targetRoleName, transactionContext }: PostTransactionRatingProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isTh = lang === 'th';

  const handleSubmit = () => {
    if (rating === 0) return;
    
    // Save to local storage for demo purposes
    try {
      const savedReviews = localStorage.getItem('primerent_user_reviews');
      const reviews = savedReviews ? JSON.parse(savedReviews) : [];
      reviews.push({
        id: `txn-review-${Date.now()}`,
        targetUserId,
        authorName: isTh ? 'ผู้เช่า' : 'Tenant',
        rating,
        text: comment,
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('primerent_user_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to save review', e);
    }

    setSubmitted(true);
    toast({
      title: isTh ? 'ส่งคะแนนรีวิวสำเร็จ!' : 'Rating submitted successfully!',
      description: isTh ? `ขอบคุณที่ร่วมประเมิน ${targetRoleName}` : `Thank you for rating the ${targetRoleName}`
    });
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-none p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-black text-green-900">
          {isTh ? 'ขอบคุณสำหรับรีวิวของคุณ' : 'Thank you for your review'}
        </h3>
        <p className="text-xs text-green-700 font-medium mt-1">
          {isTh ? `ระบบได้บันทึกคะแนน ${rating} ดาว สำหรับ${targetRoleName}แล้ว` : `We have recorded your ${rating}-star rating for the ${targetRoleName}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-none p-6 shadow-sm space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-black text-gray-900">
          {isTh ? `ให้คะแนน${targetRoleName}` : `Rate the ${targetRoleName}`}
        </h3>
        <p className="text-xs text-gray-500 font-medium mt-1">
          {transactionContext || (isTh ? 'ประสบการณ์ของคุณเป็นอย่างไรบ้าง?' : 'How was your experience?')}
        </p>
      </div>

      <div className="flex justify-center gap-2 py-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star className={cn(
              "w-10 h-10 transition-colors duration-200",
              (hovered || rating) >= star ? "fill-amber-400 text-amber-400" : "text-gray-200"
            )} />
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <textarea
          rows={3}
          placeholder={isTh ? 'เขียนคำแนะนำหรือความประทับใจ (ไม่บังคับ)' : 'Write your feedback (Optional)'}
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm font-medium rounded-none resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <Button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full rounded-none bg-gray-900 hover:bg-black font-black text-white h-12 gap-2"
        >
          <Send className="w-4 h-4" />
          {isTh ? 'ส่งคะแนนประเมิน' : 'Submit Rating'}
        </Button>
      </div>
    </div>
  );
}
