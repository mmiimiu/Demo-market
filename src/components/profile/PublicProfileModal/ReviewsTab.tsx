import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewsTabProps {
  combinedReviews: any[];
  avgRating: number;
  showReviewForm: boolean;
  newRating: number;
  newComment: string;
  newAuthorName: string;
  submittingReview: boolean;
  isTh: boolean;
  onToggleReviewForm: () => void;
  onSetNewRating: (rating: number) => void;
  onSetNewComment: (comment: string) => void;
  onSetNewAuthorName: (name: string) => void;
  onSubmitReview: () => void;
}

export function ReviewsTab({ combinedReviews, avgRating, showReviewForm, newRating, newComment, newAuthorName, submittingReview, isTh, onToggleReviewForm, onSetNewRating, onSetNewComment, onSetNewAuthorName, onSubmitReview }: ReviewsTabProps) {
  return (
    <TabsContent value="reviews" className="flex-1 overflow-y-auto p-5 m-0 space-y-4">
      <div className="flex items-center justify-between border border-gray-100 p-5 bg-gray-50/50">
        <div className="flex items-center gap-5">
          <div className="text-center shrink-0">
            <p className="text-4xl font-bold text-primary leading-none">{avgRating.toFixed(1)}</p>
            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{isTh ? 'จาก 5' : 'Out of 5'}</p>
          </div>
          <div className="w-px h-12 bg-gray-200 shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">{isTh ? 'คะแนนรีวิวสะสม' : 'Accumulated Ratings'}</h4>
            <p className="text-xs text-gray-500 font-medium">{isTh ? `รีวิวทั้งหมด ${combinedReviews.length} รายการ` : `Total ${combinedReviews.length} reviews.`}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-none border-primary/20 text-primary font-bold text-xs h-9 px-4 shrink-0" onClick={onToggleReviewForm}>
          <Star className="w-3.5 h-3.5 mr-1" />
          {showReviewForm ? (isTh ? 'ปิด' : 'Cancel') : (isTh ? 'เขียนรีวิว' : 'Write Review')}
        </Button>
      </div>

      {showReviewForm && (
        <div className="bg-gray-50 border border-gray-100 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <h4 className="font-bold text-gray-900 text-sm">{isTh ? 'เขียนรีวิวให้ผู้ใช้งานคนนี้' : 'Write a Review'}</h4>
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-500">{isTh ? 'เลือกคะแนน' : 'Rating'}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => onSetNewRating(star)} className="focus:outline-none">
                  <Star className={cn("w-6 h-6", newRating >= star ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder={isTh ? 'ชื่อของคุณ' : 'Your name'}
            value={newAuthorName}
            onChange={e => onSetNewAuthorName(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 text-sm font-bold rounded-none focus:outline-none focus:border-primary"
          />
          <textarea
            rows={3}
            placeholder={isTh ? 'เขียนข้อคิดเห็นของคุณ...' : 'Share your experience...'}
            value={newComment}
            onChange={e => onSetNewComment(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 text-sm font-bold rounded-none resize-none focus:outline-none focus:border-primary"
          />
          <Button
            onClick={onSubmitReview}
            disabled={submittingReview || !newComment.trim() || !newAuthorName.trim()}
            className="rounded-none bg-primary font-bold text-white h-10 gap-2 w-full"
          >
            {submittingReview && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isTh ? 'บันทึกรีวิว' : 'Submit Review'}
          </Button>
        </div>
      )}

      {combinedReviews.map((review: any) => (
        <div key={review.id} className="border border-gray-100 p-5 space-y-2">
          <div className="flex justify-between items-start">
            <h5 className="font-bold text-gray-900 text-sm">{review.author}</h5>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span className="text-xs font-bold text-gray-800">{review.rating}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">{review.comment}</p>
          <p className="text-[9px] text-gray-400 font-bold">{review.date}</p>
        </div>
      ))}
    </TabsContent>
  );
}
