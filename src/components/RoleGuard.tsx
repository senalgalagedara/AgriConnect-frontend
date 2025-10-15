"use client";
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface RoleGuardProps {
  allow: string[]; // roles permitted (case-insensitive)
  children: React.ReactNode;
  fallback?: React.ReactNode; // optional custom fallback
}

/**
 * RoleGuard restricts visibility of content to users whose role is in the allow list.
 * If no user or role mismatch, renders a default message or provided fallback.
 */
export function RoleGuard({ allow, children, fallback }: RoleGuardProps) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <div className="p-4 text-sm text-blue-500">Checking permissions...</div>;
  }

  if (!user) {
    return fallback || (
      <div className="p-6 space-y-4 border border-gray-200 rounded-md bg-white">
        <h2 className="text-lg font-semibold">Authentication Required</h2>
        <p className="text-sm text-blue-600">You must sign in to access this section.</p>
        <Link href="/auth/login" className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Sign in
        </Link>
      </div>
    );
  }

  if (!hasRole(...allow)) {
    return fallback || (
      <div className="p-6 space-y-4 border border-amber-200 rounded-md bg-amber-50">
        <h2 className="text-lg font-semibold text-amber-800">Insufficient Permissions</h2>
        <p className="text-sm text-amber-700">Your account role ({user.role || 'unknown'}) cannot view this area.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default RoleGuard;
