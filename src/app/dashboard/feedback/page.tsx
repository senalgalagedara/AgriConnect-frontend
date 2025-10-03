"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import FeedbackCard from '@/components/FeedbackCard';

interface Feedback {
    id: string;
    feedbackType: 'user-experience' | 'performance' | 'product-service' | 'transactional';
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

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
                const endpoint = base ? `${base}/feedback` : `/api/feedback`;
                const response = await fetch(endpoint);
                if (!response.ok) throw new Error('Failed to fetch feedbacks from server');
                const data = await response.json();
                // normalize common server response shapes to an array
                let arr: any[] = [];
                if (Array.isArray(data)) {
                    arr = data;
                } else if (data?.feedbacks && Array.isArray(data.feedbacks)) {
                    arr = data.feedbacks;
                } else if (data?.data && Array.isArray(data.data)) {
                    arr = data.data;
                } else if (data?.rows && Array.isArray(data.rows)) {
                    arr = data.rows;
                } else {
                    // not an array-shaped response; attempt to coerce single object into array
                    if (data && typeof data === 'object') {
                        // sometimes API returns an object with numeric keys or a single record
                        // try to extract any array-like property, otherwise wrap object
                        const maybeArray = Object.values(data).find(v => Array.isArray(v));
                        if (maybeArray) arr = maybeArray as any[];
                        else arr = [data];
                    } else {
                        arr = [];
                    }
                }
                setFeedbacks(arr as any);
            } catch (err) {
                setError((err as Error).message || 'Failed to load feedbacks');
                console.error(err);
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
                        <option value="product-service">Product/Service</option>
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
                    // @ts-ignore - fb shape may be partial
                    <FeedbackCard key={fb.id ?? Math.random()} feedback={fb} />
                  ))}
                </div>
              )}
            </div>
            </main>
        </div>
    );
}
