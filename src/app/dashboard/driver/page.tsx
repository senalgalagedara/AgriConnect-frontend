"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { User, Activity, MessageSquare, CreditCard as Edit, Navigation, Clock, CircleCheck as CheckCircle, Package, Truck, Star, Send } from 'lucide-react';
import { useState } from 'react';

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('profile');

  const navigation = [
    {
      name: 'Profile',
      href: '#profile',
      icon: <User className="w-5 h-5" />,
      active: activeTab === 'profile'
    },
    {
      name: 'Status',
      href: '#status',
      icon: <Activity className="w-5 h-5" />,
      active: activeTab === 'status'
    },
    {
      name: 'Feedback',
      href: '#feedback',
      icon: <MessageSquare className="w-5 h-5" />,
      active: activeTab === 'feedback'
    },
  ];

  const deliveries = [
    {
      id: 'DEL-001',
      customer: 'Sarah Johnson',
      address: '1234 Oak Street, LA',
      status: 'delivered',
      step: 3,
      orderTotal: '$23.97',
      time: 'Delivered 2 hours ago'
    },
    {
      id: 'DEL-002',
      customer: 'Mike Chen',
      address: '567 Pine Avenue, CA',
      status: 'dispatched',
      step: 2,
      orderTotal: '$45.50',
      time: 'Dispatched 30 min ago'
    },
    {
      id: 'DEL-003',
      customer: 'Emma Davis',
      address: '890 Elm Street, CA',
      status: 'processing',
      step: 1,
      orderTotal: '$31.25',
      time: 'Processing'
    },
  ];

  const feedback = [
    {
      id: 1,
      customer: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent delivery service! Very professional and on time.',
      date: '2 days ago',
      order: 'DEL-001'
    },
    {
      id: 2,
      customer: 'Robert Smith',
      rating: 4,
      comment: 'Good service, delivered fresh produce safely.',
      date: '3 days ago',
      order: 'DEL-004'
    },
    {
      id: 3,
      customer: 'Lisa Wong',
      rating: 5,
      comment: 'Amazing driver! Very friendly and careful with the products.',
      date: '5 days ago',
      order: 'DEL-008'
    },
  ];

  const getStatusInfo = (status: string, step: number) => {
    const steps = [
      { name: 'Processing', icon: <Package className="w-4 h-4" /> },
      { name: 'Dispatched', icon: <Truck className="w-4 h-4" /> },
      { name: 'Delivered', icon: <CheckCircle className="w-4 h-4" /> }
    ];

    return {
      progress: (step / 3) * 100,
      currentStep: step - 1,
      steps
    };
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
                    <Navigation className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                      <p className="text-2xl font-bold text-gray-900">147</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-900">4.8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">On Time %</p>
                      <p className="text-2xl font-bold text-gray-900">96%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Driver Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">Alex Rodriguez</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Driver ID</label>
                    <p className="mt-1 text-gray-900">DRV-2024-001</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-gray-900">(555) 456-7890</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vehicle</label>
                    <p className="mt-1 text-gray-900">2020 Ford Transit - ABC-1234</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Experience</label>
                    <p className="mt-1 text-gray-900">3 years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-green-600 font-medium">Active</p>
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
      
      case 'status':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Delivery Status</h3>
            
            <div className="grid gap-4">
              {deliveries.map((delivery) => {
                const statusInfo = getStatusInfo(delivery.status, delivery.step);
                return (
                  <Card key={delivery.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{delivery.id}</h4>
                          <p className="text-sm text-gray-600">
                            {delivery.customer} • {delivery.orderTotal}
                          </p>
                          <p className="text-sm text-gray-500">{delivery.address}</p>
                        </div>
                        <Badge className="text-xs">
                          {delivery.time}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                            <span>Progress</span>
                            <span>{Math.round(statusInfo.progress)}%</span>
                          </div>
                          <Progress value={statusInfo.progress} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between">
                          {statusInfo.steps.map((step, index) => (
                            <div key={step.name} className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                index <= statusInfo.currentStep
                                  ? 'border-orange-500 bg-orange-100 text-orange-600'
                                  : 'border-gray-300 bg-gray-100 text-gray-400'
                              }`}>
                                {step.icon}
                              </div>
                              <span className={`text-xs mt-2 ${
                                index <= statusInfo.currentStep ? 'text-orange-600' : 'text-gray-400'
                              }`}>
                                {step.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      
      case 'feedback':
        return (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  {renderStars(5)}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">127</p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">94%</p>
                  <p className="text-sm text-gray-600">Positive</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-sm text-gray-600">This Week</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
              {feedback.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.customer}</h4>
                        <p className="text-sm text-gray-600">Order {item.order} • {item.date}</p>
                      </div>
                      {renderStars(item.rating)}
                    </div>
                    <p className="text-gray-700 text-sm">{item.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Send Feedback to Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Share your thoughts, suggestions, or report any issues..."
                  className="min-h-[100px]"
                />
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Driver Dashboard"
      userType="driver"
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
                  ? 'border-orange-500 text-orange-600'
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