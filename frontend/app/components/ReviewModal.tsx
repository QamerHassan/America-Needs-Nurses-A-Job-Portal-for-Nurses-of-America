"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalName: string;
  companyId: string;
  onSuccess?: () => void;
}

export default function ReviewModal({ isOpen, onClose, hospitalName, companyId, onSuccess }: ReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { auth } = useAuth();
  
  // State for ratings
  const [leadershipApproval, setLeadershipApproval] = useState<"Yes" | "No" | null>(null);
  const [ratings, setRatings] = useState({
    overall: 0,
    purpose: 0,
    happiness: 0,
    pay: 0,
    trust: 0,
    manager: 0
  });
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const handleRating = (category: keyof typeof ratings, score: number) => {
    setRatings(prev => ({ ...prev, [category]: score }));
  };

  const getRatingArray = () => [1, 2, 3, 4, 5];

  const handleSubmit = async () => {
    // Validation
    if (!ratings.overall) {
      setError("Please provide an overall rating.");
      return;
    }
    if (!feedback) {
       setError("Please write your feedback.");
       return;
    }
    
    setLoading(true);
    setError("");

    try {
      const payload = {
        rating: ratings.overall,
        comment: feedback,
        metadata: {
           leadershipApproval,
           purpose: ratings.purpose,
           happiness: ratings.happiness,
           pay: ratings.pay,
           trust: ratings.trust,
           manager: ratings.manager
        }
      };

      const token = auth?.token;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/companies/${companyId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const RatingRow = ({ title, category }: { title: string, category: keyof typeof ratings }) => (
    <div className="mb-6">
      <p className="text-sm font-semibold text-[#002868] mb-3">{title}</p>
      <div className="flex w-full border border-[#002868]/20 rounded-lg overflow-hidden">
        {getRatingArray().map(score => {
          const isSelected = ratings[category] === score;
          return (
            <button
              key={score}
              onClick={() => handleRating(category, score)}
              className={`flex-1 py-3 text-sm font-semibold transition-all border-r border-[#002868]/10 last:border-r-0 ${
                isSelected 
                  ? "bg-[#C8102E] text-white" 
                  : "bg-white text-[#002868] hover:bg-[#002868]/5"
              }`}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-[env(safe-area-inset-bottom)] pwa:pb-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#002868]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-xl font-black text-[#002868]">
            Share Your Feedback for {hospitalName}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            {/* Leadership Approval row */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-[#002868] mb-3">Do you approve of {hospitalName}'s CEO / Leadership?</p>
              <div className="flex w-full border border-[#002868]/20 rounded-lg overflow-hidden">
                 <button
                   onClick={() => setLeadershipApproval("Yes")}
                   className={`flex-1 py-3 text-sm font-semibold transition-all border-r border-[#002868]/10 ${
                     leadershipApproval === "Yes" ? "bg-[#C8102E] text-white" : "bg-white text-[#002868] hover:bg-[#002868]/5"
                   }`}
                 >
                   Yes
                 </button>
                 <button
                   onClick={() => setLeadershipApproval("No")}
                   className={`flex-1 py-3 text-sm font-semibold transition-all ${
                     leadershipApproval === "No" ? "bg-[#C8102E] text-white" : "bg-white text-[#002868] hover:bg-[#002868]/5"
                   }`}
                 >
                   No
                 </button>
              </div>
            </div>

            <RatingRow title="Overall, I am completely satisfied with my job." category="overall" />
            <RatingRow title="My work has a clear sense of purpose." category="purpose" />
            <RatingRow title="I feel happy at work most of the time." category="happiness" />
            <RatingRow title="I am paid fairly for my work." category="pay" />
            <RatingRow title="I can trust people in my company." category="trust" />
            <RatingRow title="My manager helps me succeed." category="manager" />

            <div className="mt-8 mb-4">
              <p className="text-sm font-semibold text-[#002868] mb-3">Write your feedback</p>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain your review"
                className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] transition-all resize-none h-32 text-sm text-[#002868]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between sticky bottom-0 rounded-b-2xl z-10">
          <button 
            onClick={onClose}
            className="px-6 py-3 font-semibold text-white bg-[#1f2937] hover:bg-gray-900 rounded-xl transition-all text-sm"
          >
            Close Review
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 font-semibold text-white bg-[#C8102E] hover:bg-[#a00d25] rounded-xl transition-all shadow-md shadow-red-500/20 disabled:opacity-70 flex items-center gap-2 text-sm"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
