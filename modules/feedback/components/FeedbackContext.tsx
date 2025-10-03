"use client";
import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";

export type FeedbackType = 'user-experience' | 'performance' | 'product-service' | 'transactional';

export interface FeedbackData {
  rating: number;
  comment: string;
  feedbackType: FeedbackType;
  // Allow extension (e.g., orderId, userId)
  meta?: Record<string, any>;
}

export interface OpenFeedbackOptions {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  homeLabel?: string;
  rejoinLabel?: string;
  meta?: Record<string, any>;
  onSubmitted?: (data: FeedbackData) => void | Promise<void>;
  onClosed?: () => void;
  // Success screen customization
  successTitle?: string;
  successMessage?: string;
  showRatingSummary?: boolean; // show rating + comment snippet on success
  autoCloseDelay?: number | null; // ms. null disables auto close
}

interface FeedbackContextValue {
  open: (options?: OpenFeedbackOptions) => void;
  close: () => void;
  isOpen: boolean;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenFeedbackOptions | undefined>();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('user-experience');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const open = useCallback((opts?: OpenFeedbackOptions) => {
    setOptions(opts);
    setRating(0);
    setComment("");
    setIsOpen(true);
    setError(null);
    setSuccess(false);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setOptions(undefined);
      setRating(0);
      setComment("");
      setError(null);
      setSuccess(false);
    }, 200);
    options?.onClosed?.();
  }, [options]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const data: FeedbackData = { 
        rating, 
        comment: comment.trim(), 
        feedbackType,
        meta: options?.meta 
      };
      await options?.onSubmitted?.(data);
      setSuccess(true);
      const delay = options?.autoCloseDelay === undefined ? 2000 : options.autoCloseDelay;
      if (delay !== null && delay >= 0) {
        setTimeout(() => close(), delay);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const SuccessView = () => (
    <div style={{textAlign: 'center'}}>
      <div style={{fontSize: '48px', marginBottom: '24px'}}>✅</div>
      <div style={{marginBottom: '24px'}}>
        <h3 style={{fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px'}}>
          {options?.successTitle || 'Feedback received'}
        </h3>
        <p style={{color: '#6b7280', fontSize: '16px'}}>
          {options?.successMessage || 'Thank you for helping us improve your experience.'}
        </p>
      </div>
      {options?.showRatingSummary && (
        <div style={{
          backgroundColor: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          padding: '16px', 
          fontSize: '14px', 
          color: '#4b5563',
          marginBottom: '24px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px'}}>
            <span style={{fontWeight: '500', color: '#374151'}}>Feedback Type:</span>
            <span style={{color: '#6b7280'}}>
              {feedbackType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px'}}>
            <span style={{fontWeight: '500', color: '#374151'}}>Your rating:</span>
            <div style={{display: 'flex', alignItems: 'center'}}>
              {Array.from({length:5},(_,i)=>(
                <span key={i} style={{color: i<rating?'#fbbf24':'#d1d5db'}}>★</span>
              ))}
            </div>
            <span style={{color: '#6b7280'}}>({rating}/5)</span>
          </div>
          {comment.trim() && (
            <div style={{textAlign: 'center'}}>
              <span style={{fontWeight: '500', color: '#374151'}}>Comment:</span>
              <p style={{marginTop: '4px'}}>{comment.trim()}</p>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="flex-1 px-6 py-3 bg-white border border-gray-300 hover:border-purple-500 text-purple-600 font-semibold rounded-xl transition-colors duration-200"
        >
          Edit Feedback
        </button>
        <button
          type="button"
          onClick={close}
          className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );  return (
    <FeedbackContext.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl relative animate-fadeIn">
            <button
              onClick={close}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition z-10 text-xl"
              aria-label="Close feedback"
            >
              ✕
            </button>
            
            {success ? (
              <div style={{padding: '40px 48px'}}>
                <SuccessView />
              </div>
            ) : (
              <div style={{padding: '40px 48px'}} className="space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {options?.title || "Session feedback"}
                  </h2>
                  <p className="text-gray-500 text-base">
                    {options?.subtitle || "Please rate your experience below"}
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center space-x-3">
                    {[1,2,3,4,5].map(star => {
                      const active = (hoverRating ?? rating) >= star;
                      return (
                        <button
                          type="button"
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(star)}
                          className="text-4xl focus:outline-none transition-colors duration-200"
                          aria-label={`Rate ${star} star${star>1?'s':''}`}
                        >
                          <span className={active ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-sm text-gray-600">{rating}/5 {rating > 0 && 'stars'}</span>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">Feedback Type</label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm [&>option]:rounded-none"
                    style={{ height: '32px' }}
                  >
                    <option value="user-experience">User Experience</option>
                    <option value="performance">Performance</option>
                    <option value="product-service">Product/Service</option>
                    <option value="transactional">Transaction</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">Additional feedback</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share more about your experience..."
                    className="w-full h-32 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none outline-none text-sm"
                    style={{padding: '16px', lineHeight: '1.6'}}
                    maxLength={1000}
                  />
                  {error && (
                    <div className="text-red-500 font-medium text-xs">
                      {error}
                    </div>
                  )}
                </div>

                <div className="space-y-4" style={{marginTop: '24px'}}>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || rating === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                    style={{padding: '12px 32px'}}
                  >
                    {submitting && (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    )}
                    <span>{options?.submitLabel || 'Submit feedback'}</span>
                  </button>

                  <div className="text-center" style={{marginTop: '16px', marginBottom: '12px'}}>
                    <span className="text-xs font-medium text-gray-400 tracking-wider">OR</span>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => { options?.onClosed?.(); close(); }}
                      className="flex items-center justify-center space-x-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm font-medium text-gray-700"
                      style={{padding: '12px 32px'}}
                    >
                      <span>🏠</span>
                      <span>{options?.homeLabel || 'Back home'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn .25s ease; }
      `}</style>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
}
