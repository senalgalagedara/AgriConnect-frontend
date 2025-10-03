"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Clock, ShoppingBag, CreditCard as Edit, Eye, Package, Truck, CircleCheck as CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ConsumerDashboard() {
  const [activeTab, setActiveTab] = useState('profile');

  const navigation = [
    {
      name: 'Profile',
      href: '#profile',
      icon: <User className="w-5 h-5" />,
      active: activeTab === 'profile'
    },
    {
      name: 'Order History',
      href: '#orders',
      icon: <Clock className="w-5 h-5" />,
      active: activeTab === 'orders'
    },
  ];

  const orders = [
    {
      id: '#ORD-001',
      date: '2024-01-15',
      total: '$23.97',
      status: 'Delivered',
      items: ['Organic Tomatoes (2 lbs)', 'Fresh Carrots (1 lb)', 'Green Lettuce (2 heads)'],
      farm: 'Green Valley Organic Farm'
    },
    {
      id: '#ORD-002',
      date: '2024-01-12',
      total: '$45.50',
      status: 'Dispatched',
      items: ['Sweet Corn (6 ears)', 'Bell Peppers (3 lbs)', 'Fresh Herbs Mix'],
      farm: 'Sunny Acres Farm'
    },
    {
      id: '#ORD-003',
      date: '2024-01-10',
      total: '$31.25',
      status: 'Processing',
      items: ['Organic Spinach (2 bunches)', 'Cherry Tomatoes (1 lb)', 'Cucumbers (3 pieces)'],
      farm: 'River Bend Farm'
    },
    {
      id: '#ORD-004',
      date: '2024-01-08',
      total: '$18.75',
      status: 'Delivered',
      items: ['Baby Carrots (2 lbs)', 'Broccoli (2 heads)'],
      farm: 'Green Valley Organic Farm'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Dispatched': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      case 'Dispatched': return <Truck className="w-4 h-4" />;
      case 'Processing': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
                    <ShoppingBag className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">24</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">21</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Truck className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">In Transit</p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">Sarah Johnson</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">sarah.johnson@email.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-gray-900">(555) 987-6543</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <p className="mt-1 text-gray-900">January 2023</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                    <p className="mt-1 text-gray-900">
                      1234 Oak Street, Apt 5B<br />
                      Los Angeles, CA 90210
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
      
      case 'orders':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
            
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{order.id}</h4>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.date} • {order.farm} • {order.total}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Consumer Dashboard"
      userType="consumer"
      navigation={navigation.map(item => ({
        ...item,
        href: '#',
        active: item.name.toLowerCase().replace(' ', '') === activeTab.replace('orders', 'orderhistory')
      }))}
    >
      <div className="space-y-6">
        <div className="flex border-b border-gray-200">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name.toLowerCase().replace(' history', 's'))}
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === item.name.toLowerCase().replace(' history', 's')
                  ? 'border-blue-500 text-blue-600'
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