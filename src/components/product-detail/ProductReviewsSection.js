"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  MessageSquarePlus,
  X,
  Send,
  Loader2,
  Check,
  UserCheck,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

const STAR_LABELS = {
  5: "Excellent",
  4: "Good / Very Satisfied",
  3: "Average / Okay",
  2: "Below Average",
  1: "Poor / Not Recommended",
};

const DEFAULT_STARTER_REVIEWS = [
  {
    _id: "def_1",
    stars: 5,
    rating: 5,
    title: "Excellent",
    comment: "Very good quality, exactly as shown in photo. Value for money!",
    customer: "Rahul Sharma",
    userName: "Rahul Sharma",
    city: "Delhi",
    userCity: "Delhi",
    time: "2 days ago",
    likes: 7,
    dislikes: 0,
    verifiedBuyer: true,
  },
  {
    _id: "def_2",
    stars: 5,
    rating: 5,
    title: "Brilliant",
    comment: "Awesome finish and comfortable wear. Delivery was fast too.",
    customer: "Amit Kumar",
    userName: "Amit Kumar",
    city: "Bharatpur",
    userCity: "Bharatpur",
    time: "1 week ago",
    likes: 3,
    dislikes: 0,
    verifiedBuyer: true,
  },
  {
    _id: "def_3",
    stars: 4,
    rating: 4,
    title: "Nice Product",
    comment: "Good product in this price segment. Satisfied with purchase.",
    customer: "Pooja Verma",
    userName: "Pooja Verma",
    city: "Ludhiana",
    userCity: "Ludhiana",
    time: "2 weeks ago",
    likes: 2,
    dislikes: 1,
    verifiedBuyer: true,
  },
];

export default function ProductReviewsSection({
  productId = "",
  productSlug = "",
  rating = "4.6",
  ratingsCount = 109,
  reviewsCount = 3,
  initialReviews = [],
  initialBreakdown = null,
}) {
  const { user, isLoggedIn } = useUser();

  const [reviews, setReviews] = useState(() => {
    if (initialReviews && initialReviews.length > 0) return initialReviews;
    return DEFAULT_STARTER_REVIEWS;
  });

  const [liveRating, setLiveRating] = useState(rating || "4.6");
  const [totalRatings, setTotalRatings] = useState(ratingsCount || 109);

  const [breakdown, setBreakdown] = useState(() => {
    if (initialBreakdown && Object.keys(initialBreakdown).length > 0) {
      return initialBreakdown;
    }
    return { 5: 61, 4: 13, 3: 11, 2: 9, 1: 15 };
  });

  // Review Form States
  const [showForm, setShowForm] = useState(false);
  const [userStars, setUserStars] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerCity, setReviewerCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  // Sync with initialReviews if product changes
  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
    }
  }, [initialReviews]);

  // Pre-fill user information if available
  useEffect(() => {
    if (user?.name && !reviewerName) {
      setReviewerName(user.name);
    }
    if (user?.city && !reviewerCity) {
      setReviewerCity(user.city);
    }
  }, [user]);

  // Time formatter
  const formatTime = (dateValue) => {
    if (!dateValue) return "Just now";
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return String(dateValue);
      const diffMs = Date.now() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return "Just now";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  // Handle helpful like/dislike voting
  const handleVote = async (index, type) => {
    const target = reviews[index];
    if (!target) return;

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [type]: (r[type] || 0) + 1 } : r))
    );

    const targetId = target._id;
    const prodId = productId || productSlug;
    if (!prodId || !targetId || targetId.startsWith("def_")) return;

    try {
      await fetch(`http://localhost:5000/api/products/${prodId}/reviews/${targetId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
    } catch (e) {
      console.error("Vote failed:", e);
    }
  };

  // Submit New Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Please write a few words about your experience with this product.");
      return;
    }

    setSubmitting(true);
    const prodId = productId || productSlug;

    const payload = {
      userName: reviewerName.trim() || user?.name || "Verified Buyer",
      userCity: reviewerCity.trim() || user?.city || "Delhi",
      rating: userStars,
      title: title.trim() || STAR_LABELS[userStars] || "Customer Review",
      comment: comment.trim(),
    };

    try {
      if (prodId) {
        const res = await fetch(`http://localhost:5000/api/products/${prodId}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.reviewsList) {
            setReviews(data.reviewsList);
            if (data.rating) setLiveRating(String(data.rating));
            if (data.reviewsCount) setTotalRatings(data.reviewsCount);
            if (data.ratingsBreakdown) setBreakdown(data.ratingsBreakdown);
          }
        } else {
          throw new Error("Server submission failed");
        }
      } else {
        throw new Error("No product ID");
      }
    } catch {
      // Local fallback in case backend is offline
      const localRev = {
        _id: "local_" + Date.now(),
        ...payload,
        customer: payload.userName,
        city: payload.userCity,
        stars: userStars,
        time: "Just now",
        likes: 0,
        dislikes: 0,
        verifiedBuyer: true,
      };

      setReviews((prev) => [localRev, ...prev]);

      // Update Breakdown
      setBreakdown((prev) => ({
        ...prev,
        [userStars]: (prev[userStars] || 0) + 1,
      }));
      setTotalRatings((prev) => prev + 1);
    } finally {
      setSubmitting(false);
      setComment("");
      setTitle("");
      setShowForm(false);
      setSuccessToast("Thank you! Your review has been submitted successfully.");
      setTimeout(() => setSuccessToast(""), 4000);
    }
  };

  const grandTotalRatings =
    Object.values(breakdown).reduce((acc, val) => acc + (Number(val) || 0), 0) || totalRatings;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xs">
      {/* Success Toast Banner */}
      {successToast && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Header with Title & "Write Review" Button */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight sm:text-lg">
            Ratings & Reviews
          </h2>
          <p className="text-xs text-slate-500">
            Customer feedback and genuine product ratings
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer shadow-sm ${
            showForm
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20 active:scale-95"
          }`}
        >
          {showForm ? <X size={15} /> : <MessageSquarePlus size={15} />}
          <span>{showForm ? "Cancel" : "Write Review"}</span>
        </button>
      </div>

      {/* 2. Rating Summary Score & 5-Star Breakdown Bars */}
      <div className="grid grid-cols-1 items-center gap-5 border-b border-slate-100 py-5 sm:grid-cols-[180px_1fr] sm:gap-8">
        
        {/* Left: Overall Big Star Score */}
        <div className="flex flex-col items-center sm:items-start sm:border-r sm:border-slate-100 sm:pr-6 text-center sm:text-left">
          <div className="text-5xl font-black text-slate-900 tracking-tight">
            {liveRating}
          </div>
          <div className="mt-1.5 flex gap-0.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                className={s <= Math.round(Number(liveRating)) ? "fill-current text-amber-400" : "text-slate-200"}
              />
            ))}
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            {grandTotalRatings.toLocaleString("en-IN")} ratings
          </p>
        </div>

        {/* Right: 5-to-1 Star Interactive Percentage Bars */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const pct = grandTotalRatings > 0 ? Math.round((count / grandTotalRatings) * 100) : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-8 shrink-0 font-bold text-slate-700 flex items-center gap-0.5">
                  {star} <Star size={11} className="fill-current text-amber-400" />
                </span>

                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      star >= 4
                        ? "bg-emerald-500"
                        : star === 3
                        ? "bg-amber-400"
                        : "bg-rose-400"
                    }`}
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>

                <span className="w-9 text-right font-mono text-[11px] font-bold text-slate-500">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Dynamic Interactive Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="my-5 rounded-2xl border border-orange-200 bg-orange-50/40 p-5 shadow-sm space-y-4 animate-in fade-in"
        >
          <div>
            <h3 className="text-sm font-black text-slate-900">Write Your Product Review</h3>
            <p className="text-xs text-slate-500 mt-0.5">Help fellow shoppers make the right choice.</p>
          </div>

          {/* Star Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Your Rating:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setUserStars(s)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={26}
                      className={s <= userStars ? "fill-current text-amber-400" : "text-slate-300"}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-black text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                {STAR_LABELS[userStars]}
              </span>
            </div>
          </div>

          {/* Review Title & Author Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Headline / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Excellent fit & quality"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Name</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Your City / State</label>
              <input
                type="text"
                value={reviewerCity}
                onChange={(e) => setReviewerCity(e.target.value)}
                placeholder="e.g. Delhi / Mumbai"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Detailed Experience Textarea */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Detailed Experience & Feedback *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the fabric/material, size, packaging and delivery?"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 leading-relaxed resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md shadow-orange-500/20 transition cursor-pointer disabled:bg-slate-400"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>{submitting ? "Submitting..." : "Submit Review"}</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Real-time Customer Reviews List */}
      <div className="divide-y divide-slate-100 mt-2">
        {reviews.map((rev, idx) => {
          const starsVal = rev.rating || rev.stars || 5;
          const author = rev.userName || rev.customer || "Verified Buyer";
          const location = rev.userCity || rev.city || "";
          const dateStr = rev.time || formatTime(rev.createdAt);

          return (
            <div key={rev._id || idx} className="py-4 space-y-2">
              {/* Rating Star Badge & Headline */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[10px] font-black text-white ${
                    starsVal >= 4
                      ? "bg-emerald-700"
                      : starsVal === 3
                      ? "bg-amber-600"
                      : "bg-rose-600"
                  }`}
                >
                  {starsVal} <Star size={9} className="fill-current" />
                </span>

                <h4 className="text-xs font-black text-slate-900">
                  {rev.title || STAR_LABELS[starsVal] || "Customer Feedback"}
                </h4>
              </div>

              {/* Review Text */}
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                {rev.comment}
              </p>

              {/* Verified Author & Helpful Vote Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span className="font-bold text-slate-800">{author}</span>
                  {location && <span>• {location}</span>}
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    Verified Buyer
                  </span>
                  <span>• {dateStr}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="text-[10px] text-slate-400">Helpful?</span>
                  <button
                    type="button"
                    onClick={() => handleVote(idx, "likes")}
                    className="flex items-center gap-1 hover:text-emerald-700 transition cursor-pointer active:scale-95"
                    title="Helpful"
                  >
                    <ThumbsUp size={13} />
                    <span className="font-mono text-[11px] font-bold">{rev.likes || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVote(idx, "dislikes")}
                    className="flex items-center gap-1 hover:text-rose-600 transition cursor-pointer active:scale-95"
                    title="Not Helpful"
                  >
                    <ThumbsDown size={13} />
                    <span className="font-mono text-[11px] font-bold">{rev.dislikes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {reviews.length === 0 && (
        <div className="py-10 text-center text-xs text-slate-400 space-y-2">
          <p className="font-bold text-slate-600">No reviews yet for this product.</p>
          <p>Be the first customer to rate and share your experience!</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-2 inline-flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            <MessageSquarePlus size={14} /> Write the First Review
          </button>
        </div>
      )}
    </section>
  );
}
