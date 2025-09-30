"use client";

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
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
}

export default function DashboardLayout({ 
  children, 
  title, 
  userType, 
  navigation 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userTypeColors = {
    farmer: 'bg-green-600 hover:bg-green-700',
    consumer: 'bg-blue-600 hover:bg-blue-700',
    driver: 'bg-orange-600 hover:bg-orange-700'
  };

  const handleLogout = () => {
    // In a real app, this would handle actual logout logic
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:justify-center">
          <h1 className="text-lg font-semibold text-gray-900 capitalize">
            {userType} Dashboard
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                item.active
                  ? `${userTypeColors[userType]} text-white`
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-4"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}