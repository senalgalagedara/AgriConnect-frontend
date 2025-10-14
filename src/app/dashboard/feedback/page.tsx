"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import FeedbackCard from '@/components/FeedbackCard';
import { apiRequest, ApiError } from '@/lib/api';

interface Feedback {
    id: string;
    feedbackType: 'user-experience' | 'performance' | 'product_service' | 'transactional';
    rating: number;
    comment: string;
    createdAt: string;
    userId: string;
}

export default function DashboardFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [deletingIds, setDeletingIds] = useState<(string|number)[]>([]);

    useEffect(() => {
                const fetchFeedbacks = async () => {
                    try {
                        // Use unified helper (adds base + prefix + rewrite automatically)
                        const raw = await apiRequest<any>('/feedback');
                        let arr: any[] = [];
                        const data = raw as any;
                        if (Array.isArray(data)) arr = data;
                        else if (Array.isArray(data?.feedbacks)) arr = data.feedbacks;
                        else if (Array.isArray(data?.data)) arr = data.data;
                        else if (Array.isArray(data?.rows)) arr = data.rows;
                        else if (data && typeof data === 'object') {
                            const maybeArray = Object.values(data).find(v => Array.isArray(v));
                            if (maybeArray) arr = maybeArray as any[]; else arr = [data];
                        }
                                                                        const normalized = (arr as any[]).map(item => {
                                                                            if (!item || typeof item !== 'object') return item;
                                                                            const ft = item.feedbackType || item.feedback_type || item.type;
                                                                            const comment = item.comment || item.message || item.subject || '';
                                                                            const createdAt = item.createdAt || item.created_at || item.created || null;
                                                                            return { ...item, feedbackType: ft || 'transactional', comment, createdAt };
                                                                        });
                                                if (process.env.NODE_ENV !== 'production') {
                                                    console.debug('[feedback:list] normalized sample', normalized.slice(0,3));
                                                }
                                    setFeedbacks(normalized as any);
                    } catch (err: any) {
                        if (err instanceof ApiError) {
                            if (err.status === 404) {
                                setError('Feedback endpoint not found (404). Ensure backend exposes GET /feedback (respecting any API_PATH_PREFIX)');
                            } else {
                                setError(err.message || 'Failed to load feedbacks');
                            }
                        } else {
                            setError(err?.message || 'Failed to load feedbacks');
                        }
                        console.error('[feedback:list] load failed', err);
                    } finally {
                        setLoading(false);
                    }
                };

        fetchFeedbacks();
    }, []);

    const filteredFeedbacks = selectedType === 'all' 
        ? feedbacks 
        : feedbacks.filter(feedback => feedback.feedbackType === selectedType);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating: number) => {
        return Array(5).fill(0).map((_, index) => (
            <span key={index} className={index < rating ? 'text-yellow-400' : 'text-gray-300'}>
                ★
            </span>
        ));
    };

    if (loading) {
        return (
            <main className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-6">
                <div className="text-center text-red-500">{error}</div>
            </main>
        );
    }

    const handleDelete = async (id: string | number) => {
        if (!confirm('Delete this feedback? This cannot be undone.')) return;
        setDeletingIds(ids => [...ids, id]);
        const prev = feedbacks;
        setFeedbacks(fbs => fbs.filter(f => f.id !== id));
        try {
            await apiRequest(`/feedback/${id}`, { method: 'DELETE' });
        } catch (err:any) {
            console.error('Delete failed', err);
            alert(err?.message || 'Failed to delete feedback');
            // revert
            setFeedbacks(prev);
        } finally {
            setDeletingIds(ids => ids.filter(x => x !== id));
        }
    };

    return (
        <div className="flex">
            <aside className="hidden md:block">
                <Sidebar />
            </aside>
            <main className="p-6 space-y-6 flex-1">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">User Feedbacks</h1>
                <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Filter by type:</label>
                    <select 
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Feedbacks</option>
                        <option value="user-experience">User Experience</option>
                        <option value="performance">Performance</option>
                        <option value="product_service">Product/Service</option>
                        <option value="transactional">Transaction</option>
                    </select>
                </div>
            </div>

            <div>
              {(!Array.isArray(filteredFeedbacks) || filteredFeedbacks.length === 0) ? (
                <div className="px-6 py-8 text-center text-gray-500">No feedbacks found.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                                    {filteredFeedbacks.map((fb) => (
                                        <FeedbackCard
                                            key={fb.id ?? Math.random()}
                                            // @ts-ignore partial shape
                                            feedback={fb as any}
                                            onDelete={handleDelete}
                                            deleting={deletingIds.includes(fb.id)}
                                        />
                                    ))}
                </div>
              )}
            </div>
            </main>
        </div>
    );
}
