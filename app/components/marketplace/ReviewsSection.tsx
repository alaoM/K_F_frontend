'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Clock, Send } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  user?: {
    fullName: string;
  };
}

interface ReviewsSectionProps {
  productId: string;
  averageRating: number;
  reviewCount: number;
  onReviewAdded?: () => void;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ 
  productId, 
  averageRating, 
  reviewCount,
  onReviewAdded 
}) => {
  const fetcher = useApi();
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetcher(`/api/reviews/${productId}`);
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetcher(`/api/reviews/${productId}`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          comment,
          isAnonymous: isAnonymous || !user
        })
      });

      if (res.success) {
        toast.success('Review submitted successfully!');
        setComment('');
        setRating(5);
        fetchReviews();
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* SUMMARY */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <div className="text-center md:text-left space-y-2 md:border-r border-gray-100 md:pr-12">
          <p className="text-5xl font-black text-[#243e6b]">{averageRating || 0}</p>
          <div className="flex items-center gap-1 text-amber-500 justify-center md:justify-start">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                size={18} 
                fill={s <= Math.round(averageRating || 0) ? "currentColor" : "none"} 
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{reviewCount || 0} REVIEWS</p>
        </div>
        
        <div className="flex-1 space-y-4 w-full">
            {/* RATINGS BARS (MOCK) */}
            {[5, 4, 3, 2, 1].map((s) => {
                const count = reviews.filter(r => r.rating === s).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                    <div key={s} className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-[#243e6b] w-4">{s}</span>
                        <div className="flex-1 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-amber-500 rounded-full" 
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 w-8">{count}</span>
                    </div>
                )
            })}
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
            <h3 className="text-xl font-black text-[#243e6b] uppercase tracking-tight flex items-center gap-3">
                <MessageSquare className="text-[#f6c947]" />
                Customer Feedback
            </h3>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-50 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                    <User size={40} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#243e6b]/5 text-[#243e6b] rounded-full flex items-center justify-center font-black text-xs uppercase">
                                        {(review.isAnonymous || !review.user) ? 'A' : review.user.fullName[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[#243e6b]">
                                            {review.isAnonymous ? 'Anonymous Buyer' : (review.user?.fullName || 'Guest')}
                                        </p>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star 
                                                    key={s} 
                                                    size={10} 
                                                    fill={s <= review.rating ? "currentColor" : "none"} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <Clock size={10} />
                                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                {review.comment}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* WRITE A REVIEW */}
        <div className="space-y-6">
            <div className="bg-[#243e6b] text-white p-8 rounded-3xl shadow-xl space-y-6">
                <div>
                    <h4 className="text-xl font-black uppercase tracking-tight">Share your thoughts</h4>
                    <p className="text-blue-200 text-xs font-bold mt-1 uppercase tracking-widest">Your feedback helps others</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Overall Rating</label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setRating(s)}
                                    className={`transition-all hover:scale-110 ${s <= rating ? 'text-[#f6c947]' : 'text-blue-800'}`}
                                >
                                    <Star size={24} fill={s <= rating ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Your Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you think..."
                            className="w-full bg-blue-900/50 border border-blue-800 rounded-2xl p-4 text-sm text-white placeholder:text-blue-400 outline-none focus:border-[#f6c947] transition-all"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="anonymous" 
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-4 h-4 rounded border-blue-800 bg-blue-900/50 text-[#f6c947] focus:ring-[#f6c947]"
                        />
                        <label htmlFor="anonymous" className="text-[10px] font-bold uppercase tracking-widest text-blue-200 cursor-pointer">
                            Post anonymously
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#f6c947] hover:bg-[#f6c947]/90 text-[#243e6b] h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-[#243e6b] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={18} />
                                Submit Review
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
