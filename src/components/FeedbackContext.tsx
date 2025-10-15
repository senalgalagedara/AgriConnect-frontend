"use client";
import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, ApiError } from '@/lib/api';
import { FeedbackData, OpenFeedbackOptions, FeedbackContextValue, FeedbackType } from "@/interface/Feedback";

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenFeedbackOptions | undefined>();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('user-experience'); // kept camel/hyphen UI version; converted later
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<number | null>(null);
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState<FeedbackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const open = useCallback((opts?: OpenFeedbackOptions) => {
    setOptions(opts);
    if (!editing) {
      setRating(0);
      // initialize feedbackType from options.meta.type if provided
      const initialType = opts?.meta && ((opts.meta as any).type || (opts.meta as any).feedbackType);
      setFeedbackType((initialType as FeedbackType) || 'user-experience');
      setComment("");
    }
    setIsOpen(true);
    setError(null);
    setSuccess(false);
  }, [editing]);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setOptions(undefined);
      setRating(0);
      setComment("");
      setError(null);
      setSuccess(false);
      setEditing(false);
    }, 200);
    options?.onClosed?.();
  }, [options]);

  // compute endpoint once so it's visible in the UI for debugging
  const _base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  // We only show this for debugging; actual request now uses unified apiRequest with relative path
  const DEBUG_ENDPOINT = '/feedback';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Rating is required (1-5)");
      return;
    }
    if (!comment.trim()) {
      setError('Comment is required');
      return;
    }
    if (!user) {
      setError("You must be logged in to submit feedback.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // We'll call /feedback (apiRequest adds prefix + base/rewrites). No need to manually assemble URL.

      const payload: FeedbackData = {
        rating,
        comment: comment.trim(),
        feedbackType: feedbackType || ((options?.meta && (options.meta as any).type) || (options?.meta && (options.meta as any).feedbackType) || 'user-experience'),
        meta: options?.meta,
      };
      // Provide multiple key styles to satisfy different backend naming expectations
      const snake = (s: string) => s.replace(/([A-Z])/g,'_$1').replace(/[-\s]+/g,'_').toLowerCase();
      const canonicalType = payload.feedbackType;
      const snakeType = snake(canonicalType);
      // Map frontend variant to backend enum expected values.
      // Frontend keeps 'user-experience' for display; backend wants user_experience, etc.
      const backendType = snakeType; // already normalized snake case
      // Map role to allowed user_type enum
      const allowedUserTypes = new Set(['farmer','supplier','driver','admin','anonymous']);
      const mappedUserType = user?.role && allowedUserTypes.has(user.role) ? user.role : 'anonymous';
      const apiPayload = {
        ...payload,
        message: payload.comment,                // backend alias
        subject: (options?.meta as any)?.subject || backendType,
        // backend enums: low | medium | high | urgent
        priority: (options?.meta as any)?.priority || 'medium',
        // backend enums: pending | in_progress | resolved | closed
        status: (options?.meta as any)?.status || 'pending',
        user_id: user?.id,                       // align with backend user_id foreign key
        user_type: mappedUserType,
        feedback_type: backendType,              // snake_case variant for backend enums
        type: backendType,                       // generic variant if backend inspects 'type'
        // TEMP compatibility: some backend SQL still references category column
        category: backendType,
      } as Record<string, any>;
      if (process.env.NODE_ENV !== 'production') {
        // Avoid logging comment content if too long
        const { comment: cmt, ...rest } = apiPayload;
        console.debug('[feedback] submitting', { ...rest, commentPreview: cmt.slice(0,60) + (cmt.length>60?'…':'') });
      }
      try {
        if (editing && lastSubmittedId) {
          await apiRequest(`/feedback/${lastSubmittedId}`, { method: 'PUT', body: apiPayload });
        } else {
          const created: any = await apiRequest('/feedback', { method: 'POST', body: apiPayload });
          // attempt to capture created id (common patterns id / feedback_id)
          if (created) {
            const newId = (created.id ?? created.feedback_id ?? created.data?.id);
            if (typeof newId === 'number') {
              setLastSubmittedId(newId);
            }
          }
        }
      } catch (e:any) {
        if (e instanceof ApiError) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[feedback] ApiError', { status: e.status, code: e.code, details: e.details });
          }
          if (e.status === 404) {
            setError('Feedback endpoint not found. Ensure backend exposes POST /feedback and any API_PATH_PREFIX matches.');
          } else if (e.code === 'VALIDATION_ERROR' || e.status === 400) {
            // Attempt to surface first field error or generic validation message across multiple possible shapes
            let fieldMsg: any = null;
            const d: any = e.details;
            if (d) {
              if (d.fields && typeof d.fields === 'object') {
                const first = Object.values(d.fields)[0];
                fieldMsg = Array.isArray(first) ? first[0] : first;
              } else if (Array.isArray(d.errors) && d.errors.length) {
                fieldMsg = d.errors[0].message || d.errors[0];
              } else if (d.validationErrors && typeof d.validationErrors === 'object') {
                const first = Object.values(d.validationErrors)[0];
                fieldMsg = Array.isArray(first) ? first[0] : first;
              } else if (d.error && typeof d.error === 'string' && d.error !== 'VALIDATION_ERROR') {
                fieldMsg = d.error;
              } else if (d.message) {
                fieldMsg = d.message;
              } else if (typeof d === 'string') {
                fieldMsg = d;
              }
            }
            if (process.env.NODE_ENV !== 'production') {
              console.debug('[feedback] validation diagnostics', { rawDetails: e.details });
            }
            let fieldMsgStr = '';
            if (fieldMsg) {
              if (typeof fieldMsg === 'string') fieldMsgStr = fieldMsg;
              else if (typeof fieldMsg === 'object') fieldMsgStr = fieldMsg.msg || fieldMsg.message || JSON.stringify(fieldMsg);
              else fieldMsgStr = String(fieldMsg);
            }
            const baseMessage = e.message && typeof e.message === 'string' ? e.message : 'Validation failed.';
            setError(fieldMsgStr || baseMessage);
          } else {
            setError(e.message || 'Failed to submit feedback.');
          }
        } else {
          setError(e?.message || 'Failed to submit feedback.');
        }
        throw e; // propagate to outer catch for logging
      }

      // optionally call the provided callback with the submitted payload
      await options?.onSubmitted?.(payload);

      setLastSubmittedPayload(payload);

      setSuccess(true);
      const delay = options?.autoCloseDelay === undefined ? 2000 : options.autoCloseDelay;
      if (delay !== null && delay >= 0) {
        setTimeout(() => close(), delay);
      }
    } catch (err: any) {
      if (!(err instanceof ApiError)) {
        console.error('Feedback submission failed:', err);
      }
      // error state already set in inner catch for ApiError paths
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = () => {
    if (!lastSubmittedPayload) return;
    setEditing(true);
    setSuccess(false);
    // repopulate form fields
    setRating(lastSubmittedPayload.rating);
    setFeedbackType(lastSubmittedPayload.feedbackType);
    setComment(lastSubmittedPayload.comment);
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
          {/* show selected feedback type */}
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: 8}}>
            <span style={{padding: '6px 10px', borderRadius: 9999, background: '#eef2ff', color: '#4f46e5', fontWeight: 600, fontSize: 13}}>
              {(() => {
                const tRaw = feedbackType || (options?.meta && ((options.meta as any).type || (options.meta as any).feedbackType)) || 'general';
                const t = String(tRaw).toLowerCase().replace(/-/g,'_');
                switch (t) {
                  case 'user_experience':
                  case 'user-experience': return 'User experience';
                  case 'performance': return 'Performance';
                  case 'product_service': return 'Product / Service';
                  case 'transactional': return 'Transactional';
                  default: return 'General';
                }
              })()}
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
      <div style={{display:'flex', gap:'12px', marginBottom:'16px'}}>
        <button
          type="button"
          onClick={startEdit}
          style={{flex:1, background:'#f3f4f6', color:'#111827', fontWeight:600, padding:'12px 24px', border:'1px solid #e5e7eb', borderRadius:12, cursor:'pointer'}}
        >
          ✏️ Edit feedback
        </button>
        <button
          type="button"
          onClick={close}
          style={{flex:1, backgroundColor:'#9333ea', color:'black', fontWeight:600, padding:'12px 24px', border:'none', borderRadius:12, cursor:'pointer'}}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#9333ea'}
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

                {/* Feedback type dropdown (moved above the comment textarea) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">Feedback type</label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                    className="w-full border border-gray-300 rounded-xl p-2 text-sm focus:ring-2 focus:ring-purple-500 h-8"
                    style={{height: '32px'}}
                  >
                    <option value="user-experience">User experience</option>
                    <option value="performance">Performance</option>
                    <option value="product_service">Product / Service</option>
                    <option value="transactional">Transactional</option>
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
                    disabled={submitting || rating === 0 || !comment.trim()}
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
