"use client";

import React, { useState, useEffect } from 'react';
import { Star, Send, ThumbsUp, MessageCircle, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Review {
  id: string;
  propertyId: string | number;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
  ownerReply?: string;
  helpful?: number;
}

interface ReviewSystemProps {
  propertyId: string | number;
  lang: 'th' | 'en' | 'cn';
}

// Mock reviews
const getMockReviews = (propertyId: string | number): Review[] => [
  {
    id: 'r1',
    propertyId,
    authorName: 'สมชาย ใจดี',
    rating: 5,
    text: 'ห้องสะอาด เจ้าของใจดีมาก ทำเลดีมาก ใกล้ BTS สะดวกสบาย แนะนำมากๆ ครับ',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    ownerReply: 'ขอบคุณมากครับ ยินดีให้บริการเสมอ',
    helpful: 12,
  },
  {
    id: 'r2',
    propertyId,
    authorName: 'มาลี สวัสดี',
    rating: 4,
    text: 'ห้องสวยดีค่ะ วิวสวย แต่เสียงรถอาจดังนิดหน่อยตอนเช้า นอกนั้นดีมากค่ะ',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    helpful: 7,
  },
  {
    id: 'r3',
    propertyId,
    authorName: 'Ratchanee T.',
    rating: 5,
    text: 'Perfect location! Near BTS, 7-11 downstairs. Owner is very responsive. Would rent again.',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    ownerReply: 'Thank you so much! 🙏',
    helpful: 20,
  },
];

const STORAGE_KEY = 'primerent_reviews';

function StarRating({ value, onChange, readonly = false, size = 'md' }: {
  value: number; onChange?: (v: number) => void; readonly?: boolean; size?: 'sm' | 'md' | 'lg'
}) {
  const [hovered, setHovered] = useState(0);
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn("transition-all", readonly ? "cursor-default" : "cursor-pointer hover:scale-110")}
        >
          <Star className={cn(
            sizes[size],
            (hovered || value) >= star ? "fill-amber-400 text-amber-400" : "text-gray-200",
            "transition-colors"
          )} />
        </button>
      ))}
    </div>
  );
}

function formatDate(ts: string, lang: string) {
  try {
    const d = new Date(ts);
    if (lang === 'th') return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    if (lang === 'cn') return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return ''; }
}

export function ReviewSystem({ propertyId, lang }: ReviewSystemProps) {
  const isTh = lang === 'th';
  const isCn = lang === 'cn';
  const label = (th: string, en: string, cn: string) => isTh ? th : isCn ? cn : en;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState('');
  const [myName, setMyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const propReviews = stored[String(propertyId)] || getMockReviews(propertyId);
      setReviews(propReviews);
    } catch {
      setReviews(getMockReviews(propertyId));
    }
  }, [propertyId]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async () => {
    if (!myRating || !myText.trim() || !myName.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    const newReview: Review = {
      id: `r_${Date.now()}`,
      propertyId,
      authorName: myName,
      rating: myRating,
      text: myText,
      createdAt: new Date().toISOString(),
      helpful: 0,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      stored[String(propertyId)] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {}

    setMyRating(0); setMyText(''); setMyName(''); setShowForm(false); setSubmitting(false);
    toast({
      title: label('รีวิวของคุณถูกส่งแล้ว!', 'Review Submitted!', '评价已提交！'),
      description: label('ขอบคุณที่แบ่งปันประสบการณ์', 'Thank you for sharing!', '感谢您的分享！'),
    });
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="space-y-6 pt-10 border-t border-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary flex items-center justify-center text-white font-black text-xl shrink-0">
            {avgRating.toFixed(1)}
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-sm uppercase tracking-wider">{label('รีวิวจากผู้เช่า', 'Guest Reviews', '租客评价')}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating value={Math.round(avgRating)} readonly size="sm" />
              <span className="text-[10px] text-gray-400 font-bold">{reviews.length} {label('รีวิว', 'reviews', '条评价')}</span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-none font-black text-xs h-9 border-primary/20 text-primary hover:bg-primary/5"
          onClick={() => setShowForm(v => !v)}
        >
          <Star className="w-3.5 h-3.5 mr-1.5" />
          {showForm ? label('ยกเลิก', 'Cancel', '取消') : label('เขียนรีวิว', 'Write Review', '写评价')}
        </Button>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-100 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <h5 className="font-black text-sm text-gray-900">{label('เขียนรีวิวของคุณ', 'Your Review', '写下您的评价')}</h5>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-500">{label('คะแนน', 'Rating', '评分')}</p>
            <StarRating value={myRating} onChange={setMyRating} size="lg" />
          </div>
          <input
            type="text"
            placeholder={label('ชื่อของคุณ', 'Your name', '您的姓名')}
            value={myName}
            onChange={e => setMyName(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 text-sm font-bold rounded-none focus:outline-none focus:border-primary"
          />
          <textarea
            rows={3}
            placeholder={label('แบ่งปันประสบการณ์ของคุณ...', 'Share your experience...', '分享您的住宿体验...')}
            value={myText}
            onChange={e => setMyText(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 text-sm font-bold rounded-none resize-none focus:outline-none focus:border-primary"
          />
          <Button
            onClick={handleSubmit}
            disabled={!myRating || !myText.trim() || !myName.trim() || submitting}
            className="rounded-none bg-primary font-black text-white h-10 gap-2 disabled:opacity-40"
          >
            {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            {label('ส่งรีวิว', 'Submit', '提交评价')}
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.map(review => (
          <div key={review.id} className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary/8 border border-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0">
                {review.authorName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-sm text-gray-900">{review.authorName}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{formatDate(review.createdAt, lang)}</span>
                </div>
                <StarRating value={review.rating} readonly size="sm" />
                <p className="text-sm text-gray-600 font-medium leading-relaxed mt-1.5">{review.text}</p>
                {/* Owner Reply */}
                {review.ownerReply && (
                  <div className="mt-3 pl-3 border-l-2 border-primary/20 bg-primary/3 p-3">
                    <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1">
                      {label('เจ้าของตอบกลับ', 'Owner Reply', '房东回复')}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">{review.ownerReply}</p>
                  </div>
                )}
                {/* Helpful */}
                <div className="flex items-center gap-2 mt-2">
                  <button className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-primary transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    {review.helpful || 0}
                  </button>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-50" />
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-black text-gray-500"
        >
          {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showAll
            ? label('ย่อรีวิว', 'Show Less', '收起')
            : label(`ดูทั้งหมด ${reviews.length} รีวิว`, `View all ${reviews.length} reviews`, `查看全部${reviews.length}条评价`)
          }
        </button>
      )}
    </div>
  );
}
