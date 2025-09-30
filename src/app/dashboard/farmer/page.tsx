"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Package, Bell, Plus, CreditCard as Edit, TrendingUp, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('profile');

  const navigation = [
    {
      name: 'Profile',
      href: '#profile',
      icon: <User className="w-5 h-5" />,
      active: activeTab === 'profile'
    },
    {
      name: 'Products',
      href: '#products',
      icon: <Package className="w-5 h-5" />,
      active: activeTab === 'products'
    },
    {
      name: 'Notifications',
      href: '#notifications',
      icon: <Bell className="w-5 h-5" />,
      active: activeTab === 'notifications'
    },
  ];

  const products = [
    { id: 1, name: 'Organic Tomatoes', price: '$4.99/lb', stock: '25 lbs', status: 'In Stock' },
    { id: 2, name: 'Fresh Carrots', price: '$2.49/lb', stock: '18 lbs', status: 'In Stock' },
    { id: 3, name: 'Green Lettuce', price: '$1.99/head', stock: '5 heads', status: 'Low Stock' },
    { id: 4, name: 'Sweet Corn', price: '$0.99/ear', stock: '0 ears', status: 'Out of Stock' },
  ];

  const notifications = [
    { id: 1, message: 'New order received for Organic Tomatoes', time: '2 hours ago', read: false },
    { id: 2, message: 'Low stock alert for Green Lettuce', time: '4 hours ago', read: false },
    { id: 3, message: 'Payment received: $127.50', time: '1 day ago', read: true },
    { id: 4, message: 'Product review: 5 stars for Fresh Carrots', time: '2 days ago', read: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900">$2,847</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Products</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">$684</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Farm Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Farm Name</label>
                    <p className="mt-1 text-gray-900">Green Valley Organic Farm</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Owner Name</label>
                    <p className="mt-1 text-gray-900">John Smith</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-gray-900">Riverside County, CA</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-gray-900">(555) 123-4567</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-gray-900">
                      Family-owned organic farm specializing in fresh vegetables and herbs. 
                      Committed to sustainable farming practices and delivering the highest quality produce.
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
            
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          <Badge className={getStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>Price: {product.price}</span>
                          <span>Stock: {product.stock}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {notifications.map((notification) => (
              <Card key={notification.id} className={notification.read ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-green-500 rounded-full ml-4 mt-2"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Farmer Dashboard"
      userType="farmer"
      navigation={navigation.map(item => ({
        ...item,
        href: '#',
        active: item.name.toLowerCase() === activeTab
      }))}
    >
      <div className="space-y-6">
        <div className="flex border-b border-gray-200">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name.toLowerCase())}
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === item.name.toLowerCase()
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </button>
          ))}
        </div>
        
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}