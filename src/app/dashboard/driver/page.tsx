"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { User, Activity, MessageSquare, Edit, Navigation, Clock, CheckCircle, Package, Truck, Star, Send, TrendingUp, Award, DollarSign, MapPin, Phone, Calendar, ChevronRight, AlertCircle, ThumbsUp, Filter } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const navigation = [
    {
      name: 'Overview',
      href: '#overview',
      icon: <TrendingUp className="w-5 h-5" />,
      active: activeTab === 'overview'
    },
    {
      name: 'Deliveries',
      href: '#status',
      icon: <Truck className="w-5 h-5" />,
      active: activeTab === 'status'
    },
    {
      name: 'Feedback',
      href: '#feedback',
      icon: <MessageSquare className="w-5 h-5" />,
      active: activeTab === 'feedback'
    },
    {
      name: 'Profile',
      href: '#profile',
      icon: <User className="w-5 h-5" />,
      active: activeTab === 'profile'
    },
  ];

  const deliveries = [
    {
      id: 'DEL-001',
      customer: 'Sarah Johnson',
      phone: '(555) 123-4567',
      address: '1234 Oak Street, Los Angeles, CA 90001',
      status: 'delivered',
      step: 3,
      orderTotal: 'Rs. 2,397',
      time: 'Delivered 2 hours ago',
      items: 3,
      distance: '8.5 km',
      deliveryFee: 'Rs. 150'
    },
    {
      id: 'DEL-002',
      customer: 'Mike Chen',
      phone: '(555) 234-5678',
      address: '567 Pine Avenue, Santa Monica, CA 90401',
      status: 'dispatched',
      step: 2,
      orderTotal: 'Rs. 4,550',
      time: 'Dispatched 30 min ago',
      items: 5,
      distance: '12.3 km',
      deliveryFee: 'Rs. 200'
    },
    {
      id: 'DEL-003',
      customer: 'Emma Davis',
      phone: '(555) 345-6789',
      address: '890 Elm Street, Pasadena, CA 91101',
      status: 'processing',
      step: 1,
      orderTotal: 'Rs. 3,125',
      time: 'Processing',
      items: 4,
      distance: '15.7 km',
      deliveryFee: 'Rs. 250'
    },
    {
      id: 'DEL-004',
      customer: 'Robert Wilson',
      phone: '(555) 456-7890',
      address: '321 Maple Drive, Beverly Hills, CA 90210',
      status: 'delivered',
      step: 3,
      orderTotal: 'Rs. 5,840',
      time: 'Delivered yesterday',
      items: 6,
      distance: '10.2 km',
      deliveryFee: 'Rs. 180'
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
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-green-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">147</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +18% this month
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Navigation className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">4.8</p>
                      <p className="text-xs text-yellow-600 mt-1 flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        127 reviews
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Star className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">On Time Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">96%</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Excellent
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">Rs. 48K</p>
                      <p className="text-xs text-blue-600 mt-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        This month
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Deliveries and Recent Feedback */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="shadow-md">
                  <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900">Active Deliveries</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTab('status')}
                        className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      >
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {deliveries.filter(d => d.status !== 'delivered').map((delivery) => {
                        const statusInfo = getStatusInfo(delivery.status, delivery.step);
                        return (
                          <div key={delivery.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  delivery.status === 'dispatched' ? 'bg-blue-100' : 'bg-yellow-100'
                                }`}>
                                  {delivery.status === 'dispatched' ? 
                                    <Truck className="w-5 h-5 text-blue-600" /> : 
                                    <Package className="w-5 h-5 text-yellow-600" />
                                  }
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{delivery.id}</p>
                                  <p className="text-sm text-gray-600">{delivery.customer}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">{delivery.deliveryFee}</p>
                                <p className="text-xs text-gray-500 mt-1">{delivery.distance}</p>
                              </div>
                            </div>
                            <div className="mb-2">
                              <Progress value={statusInfo.progress} className="h-2" />
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {delivery.address.split(',')[0]}
                              </span>
                              <span>{delivery.items} items</span>
                            </div>
                          </div>
                        );
                      })}
                      {deliveries.filter(d => d.status !== 'delivered').length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          <Truck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No active deliveries</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="shadow-md">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardTitle className="text-lg font-bold text-gray-900">Recent Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {feedback.slice(0, 3).map((item) => (
                        <div key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm text-gray-900">{item.customer}</p>
                            {renderStars(item.rating)}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{item.comment}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Badge */}
                <Card className="shadow-md mt-4 border-t-4 border-t-green-600">
                  <CardContent className="p-4 text-center">
                    <Award className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <h4 className="font-bold text-gray-900">Top Performer</h4>
                    <p className="text-sm text-gray-600 mt-1">You're in the top 10% of drivers!</p>
                    <Badge className="mt-3 bg-green-100 text-green-700 border-green-200">
                      Excellent Service
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-8">
            {/* Performance Summary */}
            <div className="grid lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-green-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">147</p>
                      <p className="text-xs text-gray-500 mt-1">All time</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Navigation className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-yellow-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">4.8</p>
                      <div className="flex items-center mt-1">
                        {renderStars(5)}
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Star className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">On Time Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">96%</p>
                      <p className="text-xs text-green-600 mt-1 font-semibold">Excellent</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">32</p>
                      <p className="text-xs text-blue-600 mt-1">Deliveries</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Driver Profile Card */}
            <Card className="shadow-md border-t-4 border-t-green-600">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Driver Profile</CardTitle>
                  <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Full Name</label>
                        <p className="mt-1 text-gray-900 font-medium">Alex Rodriguez</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                        <p className="mt-1 text-gray-900 font-medium">(555) 456-7890</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Navigation className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Driver ID</label>
                        <p className="mt-1 text-gray-900 font-medium">DRV-2024-001</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Vehicle</label>
                        <p className="mt-1 text-gray-900 font-medium">2020 Ford Transit</p>
                        <p className="text-sm text-gray-500">License: ABC-1234</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Experience</label>
                        <p className="mt-1 text-gray-900 font-medium">3 years</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Performance</label>
                        <p className="mt-1 text-green-600 font-semibold">Top 10% Driver</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t mt-6">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
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
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Delivery Management</h3>
                <p className="text-gray-600 mt-1">Track and manage your deliveries</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold px-4 py-2">
                {deliveries.length} Total Deliveries
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {deliveries.map((delivery) => {
                const statusInfo = getStatusInfo(delivery.status, delivery.step);
                return (
                  <Card key={delivery.id} className="shadow-md hover:shadow-lg transition-all border-l-4 border-l-green-600">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold text-gray-900">{delivery.id}</h4>
                            <Badge className={`${
                              delivery.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                              delivery.status === 'dispatched' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              'bg-yellow-100 text-yellow-700 border-yellow-200'
                            } border font-semibold`}>
                              {delivery.time}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <span className="flex items-center font-medium">
                              <User className="w-4 h-4 mr-1 text-green-600" />
                              {delivery.customer}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-1 text-blue-600" />
                              {delivery.phone}
                            </span>
                            <span className="flex items-center">
                              <Package className="w-4 h-4 mr-1 text-purple-600" />
                              {delivery.items} items
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Delivery Fee</p>
                          <p className="text-2xl font-bold text-green-600">{delivery.deliveryFee}</p>
                          <p className="text-xs text-gray-500 mt-1">{delivery.distance}</p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="mb-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Delivery Address</p>
                            <p className="text-sm text-gray-900 mt-1">{delivery.address}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Section */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                            <span>Delivery Progress</span>
                            <span className="text-green-600">{Math.round(statusInfo.progress)}% Complete</span>
                          </div>
                          <Progress value={statusInfo.progress} className="h-3" />
                        </div>
                        
                        <div className="flex justify-between gap-2">
                          {statusInfo.steps.map((step, index) => (
                            <div key={step.name} className="flex flex-col items-center flex-1">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                                index <= statusInfo.currentStep
                                  ? 'border-green-600 bg-green-100 text-green-600 shadow-md'
                                  : 'border-gray-300 bg-gray-100 text-gray-400'
                              }`}>
                                {step.icon}
                              </div>
                              <span className={`text-xs mt-2 font-semibold ${
                                index <= statusInfo.currentStep ? 'text-green-600' : 'text-gray-400'
                              }`}>
                                {step.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                        {delivery.status !== 'delivered' && (
                          <>
                            <Button 
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                            >
                              <Navigation className="w-4 h-4 mr-2" />
                              Navigate
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call Customer
                            </Button>
                          </>
                        )}
                        {delivery.status === 'delivered' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-green-600 text-green-600 hover:bg-green-50 font-semibold"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-600 text-gray-600 hover:bg-gray-50 font-semibold"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Report Issue
                        </Button>
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
          <div className="space-y-8">
            {/* Rating Summary Cards */}
            <div className="grid lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-yellow-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Star className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">4.8</p>
                  <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                  <div className="flex justify-center mt-2">
                    {renderStars(5)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">127</p>
                  <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <ThumbsUp className="w-10 h-10 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-600">94%</p>
                  <p className="text-sm text-gray-600 mt-1">Positive</p>
                  <p className="text-xs text-gray-500 mt-1">119 reviews</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-10 h-10 text-purple-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-purple-600">3</p>
                  <p className="text-sm text-gray-600 mt-1">This Week</p>
                  <p className="text-xs text-gray-500 mt-1">New reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Feedback */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Customer Feedback</h3>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 font-semibold">
                  {feedback.length} Reviews
                </Badge>
              </div>
              {feedback.map((item) => (
                <Card key={item.id} className="shadow-md hover:shadow-lg transition-all border-l-4 border-l-yellow-600">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{item.customer}</h4>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Package className="w-3 h-3 mr-1" />
                            Order {item.order} • {item.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(item.rating)}
                        <span className="text-sm font-bold text-gray-900">{item.rating}.0</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mt-3">
                      <p className="text-gray-700 text-sm leading-relaxed">{item.comment}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Send Feedback Card */}
            <Card className="shadow-md border-t-4 border-t-green-600">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg font-bold text-gray-900">Send Feedback to Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Textarea 
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or report any issues with management..."
                  className="min-h-[120px] border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                <div className="flex items-center gap-2">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
                    <Send className="w-4 h-4 mr-2" />
                    Send Feedback
                  </Button>
                  <Button variant="outline" className="border-gray-300">
                    Clear
                  </Button>
                </div>
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
      onNavigate={(name) => setActiveTab(name)}
    >
      {renderContent()}
    </DashboardLayout>
  );
}