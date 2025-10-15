"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Clock, ShoppingBag, Edit, Eye, Package, Truck, CheckCircle, Heart, MapPin, Bell, CreditCard, TrendingUp, Calendar, Filter, Search, Star, ChevronRight, Download, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function ConsumerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const navigation = [
    {
      name: 'Overview',
      href: '#overview',
      icon: <TrendingUp className="w-5 h-5" />,
      active: activeTab === 'overview'
    },
    {
      name: 'Orders',
      href: '#orders',
      icon: <ShoppingBag className="w-5 h-5" />,
      active: activeTab === 'orders'
    },
    {
      name: 'Favorites',
      href: '#favorites',
      icon: <Heart className="w-5 h-5" />,
      active: activeTab === 'favorites'
    },
    {
      name: 'Profile',
      href: '#profile',
      icon: <User className="w-5 h-5" />,
      active: activeTab === 'profile'
    },
  ];

  const orders = [
    {
      id: '#ORD-001',
      date: '2024-01-15',
      time: '10:30 AM',
      total: 'Rs. 2,397',
      status: 'Delivered',
      items: ['Organic Tomatoes (2 lbs)', 'Fresh Carrots (1 lb)', 'Green Lettuce (2 heads)'],
      farm: 'Green Valley Organic Farm',
      driver: 'John Doe',
      trackingNumber: 'TRK-001234',
      paymentMethod: 'Credit Card'
    },
    {
      id: '#ORD-002',
      date: '2024-01-12',
      time: '2:15 PM',
      total: 'Rs. 4,550',
      status: 'In Transit',
      items: ['Sweet Corn (6 ears)', 'Bell Peppers (3 lbs)', 'Fresh Herbs Mix', 'Red Onions (2 lbs)'],
      farm: 'Sunny Acres Farm',
      driver: 'Mike Chen',
      trackingNumber: 'TRK-001235',
      paymentMethod: 'Digital Wallet'
    },
    {
      id: '#ORD-003',
      date: '2024-01-10',
      time: '11:45 AM',
      total: 'Rs. 3,125',
      status: 'Processing',
      items: ['Organic Spinach (2 bunches)', 'Cherry Tomatoes (1 lb)', 'Cucumbers (3 pieces)'],
      farm: 'River Bend Farm',
      driver: 'Not Assigned',
      trackingNumber: 'TRK-001236',
      paymentMethod: 'Cash on Delivery'
    },
    {
      id: '#ORD-004',
      date: '2024-01-08',
      time: '9:00 AM',
      total: 'Rs. 1,875',
      status: 'Delivered',
      items: ['Baby Carrots (2 lbs)', 'Broccoli (2 heads)'],
      farm: 'Green Valley Organic Farm',
      driver: 'Sarah Wilson',
      trackingNumber: 'TRK-001237',
      paymentMethod: 'Credit Card'
    },
    {
      id: '#ORD-005',
      date: '2024-01-05',
      time: '3:20 PM',
      total: 'Rs. 5,240',
      status: 'Delivered',
      items: ['Fresh Strawberries (2 lbs)', 'Organic Apples (3 lbs)', 'Mixed Berries'],
      farm: 'Mountain View Farm',
      driver: 'Alex Rodriguez',
      trackingNumber: 'TRK-001238',
      paymentMethod: 'Digital Wallet'
    },
    {
      id: '#ORD-006',
      date: '2024-01-03',
      time: '1:10 PM',
      total: 'Rs. 2,890',
      status: 'Cancelled',
      items: ['Green Beans (1 lb)', 'Sweet Potatoes (2 lbs)'],
      farm: 'Sunrise Organic Farm',
      driver: 'Not Assigned',
      trackingNumber: 'TRK-001239',
      paymentMethod: 'Cash on Delivery'
    },
  ];

  const favorites = [
    { id: 1, name: 'Organic Tomatoes', price: 'Rs. 450/lb', farm: 'Green Valley Farm', rating: 4.8, inStock: true },
    { id: 2, name: 'Fresh Carrots', price: 'Rs. 280/lb', farm: 'Sunny Acres', rating: 4.6, inStock: true },
    { id: 3, name: 'Green Lettuce', price: 'Rs. 320/head', farm: 'River Bend Farm', rating: 4.7, inStock: false },
    { id: 4, name: 'Sweet Corn', price: 'Rs. 180/ear', farm: 'Mountain View', rating: 4.9, inStock: true },
    { id: 5, name: 'Bell Peppers', price: 'Rs. 550/lb', farm: 'Sunny Acres', rating: 4.5, inStock: true },
    { id: 6, name: 'Fresh Spinach', price: 'Rs. 380/bunch', farm: 'Green Valley Farm', rating: 4.7, inStock: true },
  ];

  const recentActivity = [
    { type: 'order', message: 'Order #ORD-001 was delivered', time: '2 hours ago', icon: <CheckCircle className="w-5 h-5 text-green-600" /> },
    { type: 'review', message: 'You rated Green Valley Farm', time: '1 day ago', icon: <Star className="w-5 h-5 text-yellow-500" /> },
    { type: 'order', message: 'Order #ORD-002 is in transit', time: '2 days ago', icon: <Truck className="w-5 h-5 text-blue-600" /> },
    { type: 'favorite', message: 'Added Sweet Corn to favorites', time: '3 days ago', icon: <Heart className="w-5 h-5 text-red-500" /> },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      case 'In Transit': return <Truck className="w-4 h-4" />;
      case 'Processing': return <Package className="w-4 h-4" />;
      case 'Cancelled': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'Processing': return 33;
      case 'In Transit': return 66;
      case 'Delivered': return 100;
      case 'Cancelled': return 0;
      default: return 0;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.farm.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <ShoppingBag className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">Rs. 28.4K</p>
                      <p className="text-xs text-blue-600 mt-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +8% from last month
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <CreditCard className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
                      <p className="text-xs text-gray-500 mt-1">In transit & processing</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Truck className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Favorites</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{favorites.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Products you love</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Heart className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders and Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="shadow-md">
                  <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900">Recent Orders</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTab('orders')}
                        className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      >
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                order.status === 'Delivered' ? 'bg-green-100' :
                                order.status === 'In Transit' ? 'bg-blue-100' :
                                order.status === 'Processing' ? 'bg-yellow-100' :
                                'bg-gray-100'
                              }`}>
                                {getStatusIcon(order.status)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{order.id}</p>
                                <p className="text-sm text-gray-600">{order.farm}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{order.total}</p>
                              <Badge className={`${getStatusColor(order.status)} border text-xs mt-1`}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-4 mt-2">
                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{order.date}</span>
                            <span>{order.items.length} items</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="shadow-md">
                  <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="text-lg font-bold text-gray-900">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-0.5">{activity.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-8">
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
          <div className="space-y-8">
            {/* Search and Filter Bar */}
            <Card className="shadow-md border-l-4 border-l-green-600">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders by ID or farm name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-sm font-medium"
                    >
                      <option value="all">All Status</option>
                      <option value="Delivered">Delivered</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Processing">Processing</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span>Showing {filteredOrders.length} of {orders.length} orders</span>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Card className="shadow-md">
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="shadow-md hover:shadow-lg transition-all border-l-4 border-l-green-600">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold text-gray-900">{order.id}</h4>
                            <Badge className={`${getStatusColor(order.status)} border font-semibold`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1.5">{order.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-green-600" />
                              {order.farm}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                              {order.date} at {order.time}
                            </span>
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1 text-purple-600" />
                              Driver: {order.driver}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{order.total}</p>
                          <p className="text-sm text-gray-500 mt-1 flex items-center justify-end">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>

                      {/* Order Progress */}
                      {order.status !== 'Cancelled' && (
                        <div className="mb-4 bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between text-xs font-medium text-gray-700 mb-2">
                            <span>Order Progress</span>
                            <span className="text-green-600">{getStatusProgress(order.status)}% Complete</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${getStatusProgress(order.status)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="border-t pt-4 mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Package className="w-4 h-4 mr-2 text-green-600" />
                          Order Items ({order.items.length})
                        </p>
                        <div className="grid md:grid-cols-2 gap-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tracking Info */}
                      <div className="border-t pt-4 mb-4 bg-blue-50 rounded-lg p-3">
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 font-medium mb-1">Tracking Number</p>
                            <p className="font-semibold text-gray-900 font-mono">{order.trackingNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium mb-1">Payment Status</p>
                            <p className="font-semibold text-green-600">Paid</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-green-600 text-green-600 hover:bg-green-50 font-semibold"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {order.status === 'Delivered' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Invoice
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 font-semibold"
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Rate Order
                            </Button>
                          </>
                        )}
                        {order.status === 'In Transit' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold"
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Track Live
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-600 text-gray-600 hover:bg-gray-50 font-semibold"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Support
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      
      case 'favorites':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">My Favorites</h3>
                <p className="text-gray-600 mt-1">Products you love from local farms</p>
              </div>
              <Link href="/home">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((product) => (
                <Card key={product.id} className="shadow-md hover:shadow-xl transition-all border-t-4 border-t-green-600 group">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      <Package className="w-16 h-16 text-green-300" />
                      <div className="absolute top-2 right-2">
                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                          <Heart className="w-5 h-5 text-red-500 fill-current" />
                        </button>
                      </div>
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-green-600" />
                        {product.farm}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-green-600">{product.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                          disabled={!product.inStock}
                        >
                          <ShoppingBag className="w-4 h-4 mr-1" />
                          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {favorites.length === 0 && (
              <Card className="shadow-md">
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
                  <p className="text-gray-600 mb-4">Start adding your favorite products!</p>
                  <Link href="/home">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
                      Browse Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
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
      onNavigate={(name) => setActiveTab(name)}
    >
      {renderContent()}
    </DashboardLayout>
  );
}