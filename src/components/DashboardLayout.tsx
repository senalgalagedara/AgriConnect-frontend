"use client";

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Home } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userType: 'farmer' | 'consumer' | 'driver';
  navigation: Array<{
    name: string;
    href: string;
    icon: ReactNode;
    active?: boolean;
  }>;
  onNavigate?: (name: string) => void;
}

export default function DashboardLayout({ 
  children, 
  title, 
  userType, 
  navigation,
  onNavigate
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Unified green theme for all dashboards
  const userTypeColors = {
    farmer: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
    consumer: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
    driver: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
  };

  const userTypeBgColors = {
    farmer: 'bg-green-50',
    consumer: 'bg-green-50',
    driver: 'bg-green-50'
  };

  const userTypeBorderColors = {
    farmer: 'border-l-green-600',
    consumer: 'border-l-green-600',
    driver: 'border-l-green-600'
  };

  const handleLogout = () => {
    // In a real app, this would handle actual logout logic
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <Home className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white capitalize">
                {userType}
              </h1>
              <p className="text-xs text-green-100">Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/20"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Navigation
          </p>
          <div className="space-y-3">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(item.name.toLowerCase());
                  }
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  item.active
                    ? `${userTypeColors[userType]} text-white shadow-md border-l-4 ${userTypeBorderColors[userType]}`
                    : 'text-gray-700 hover:bg-gray-100 hover:text-green-600 border-l-4 border-transparent'
                }`}
              >
                <span className={`${item.active ? 'scale-110' : ''} transition-transform`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-gray-700 mb-1">Need Help?</p>
            <p className="text-xs text-gray-600">Contact support for assistance</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 font-semibold"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-700 hover:text-green-600"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-xs text-gray-500 hidden sm:block">Welcome back! Here's your dashboard overview</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content with proper spacing and scrolling */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}