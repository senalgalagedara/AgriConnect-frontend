"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<string>("");

  const navigationSections = [
    {
      title: "Authentication",
      items: [
        { name: "Login", href: "/auth/login", description: "Sign in to your account" },
        { name: "Sign Up", href: "/auth/signup", description: "Create a new account" },
      ],
    },
    {
      title: "Shopping",
      items: [
        { name: "Cart", href: "/cart", description: "View your shopping cart" },
        { name: "Checkout", href: "/checkout", description: "Complete your purchase" },
      ],
    },
    {
      title: "Admin Dashboard",
      items: [
        { name: "Dashboard", href: "/dashboard", description: "Main admin dashboard" },
        { name: "Inventory", href: "/inventory", description: "Manage inventory" },
        { name: "Users", href: "/users", description: "Manage users" },
        { name: "Order Delivery", href: "/orderdelivery", description: "Track deliveries" },
        { name: "Payment", href: "/payment", description: "Payment management" },
        { name: "Feedback", href: "/feedback", description: "Customer feedback" },
      ],
    },
    {
      title: "Products",
      items: [
        { name: "Products", href: "/product", description: "Browse all products" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Inventory Management System
            </h1>
            <div className="flex space-x-4">
              <Link
                href="/auth/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/dashboard"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Management Portal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Navigate through different sections of the application. Access admin features, 
            manage inventory, track orders, and more.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {navigationSections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                {section.title}
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {section.items.length}
                </span>
              </h3>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className="block p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    onMouseEnter={() => setActiveSection(`${sectionIndex}-${itemIndex}`)}
                    onMouseLeave={() => setActiveSection("")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-transform ${
                          activeSection === `${sectionIndex}-${itemIndex}` ? 'translate-x-1' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-16 bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Access
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">📊</div>
                <h4 className="font-semibold mb-1">Admin Dashboard</h4>
                <p className="text-blue-100 text-sm">Manage everything from one place</p>
              </div>
            </Link>
            
            <Link
              href="/inventory"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">📦</div>
                <h4 className="font-semibold mb-1">Inventory</h4>
                <p className="text-green-100 text-sm">Track and manage stock levels</p>
              </div>
            </Link>
            
            <Link
              href="/orderdelivery"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">🚚</div>
                <h4 className="font-semibold mb-1">Deliveries</h4>
                <p className="text-purple-100 text-sm">Monitor order deliveries</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500">
            <p>© 2024 Inventory Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}