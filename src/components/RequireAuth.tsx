"use client";
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Checking authentication...</div>;
  }
  if (!user) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Login required</h2>
        <p className="text-sm text-gray-600">You must be logged in to access this feature.</p>
        <Link href="/auth/login" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Go to Login
        </Link>
      </div>
    );
  }
  return <>{children}</>; 
}
