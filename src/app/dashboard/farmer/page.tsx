"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Package, Bell, Plus, Edit, TrendingUp, DollarSign, ShoppingBag, BarChart3, AlertCircle, CheckCircle, Clock, Eye, Search, Filter, Star, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = [
    {
      name: 'Overview',
      href: '#overview',
      icon: <BarChart3 className="w-5 h-5" />,
      active: activeTab === 'overview'
    },
    {
      name: 'Products',
      href: '#products',
      icon: <Package className="w-5 h-5" />,
      active: activeTab === 'products'
    },
    {
      name: 'Orders',
      href: '#orders',
      icon: <ShoppingBag className="w-5 h-5" />,
      active: activeTab === 'orders'
    },
    {
      name: 'Profile',
      href: '#profile',
      icon: <User className="w-5 h-5" />,
      active: activeTab === 'profile'
    },
  ];

  const products = [
    { id: 1, name: 'Organic Tomatoes', price: 'Rs. 450/lb', stock: 25, unit: 'lbs', status: 'In Stock', sold: 145, rating: 4.8, category: 'Vegetables' },
    { id: 2, name: 'Fresh Carrots', price: 'Rs. 280/lb', stock: 18, unit: 'lbs', status: 'In Stock', sold: 89, rating: 4.6, category: 'Vegetables' },
    { id: 3, name: 'Green Lettuce', price: 'Rs. 320/head', stock: 5, unit: 'heads', status: 'Low Stock', sold: 67, rating: 4.7, category: 'Leafy Greens' },
    { id: 4, name: 'Sweet Corn', price: 'Rs. 180/ear', stock: 0, unit: 'ears', status: 'Out of Stock', sold: 134, rating: 4.9, category: 'Vegetables' },
    { id: 5, name: 'Bell Peppers', price: 'Rs. 550/lb', stock: 32, unit: 'lbs', status: 'In Stock', sold: 98, rating: 4.5, category: 'Vegetables' },
    { id: 6, name: 'Fresh Spinach', price: 'Rs. 380/bunch', stock: 12, unit: 'bunches', status: 'In Stock', sold: 76, rating: 4.7, category: 'Leafy Greens' },
  ];

  const orders = [
    { id: 'ORD-001', customer: 'Sarah Johnson', items: 3, total: 'Rs. 1,850', status: 'Pending', date: '2024-01-15', time: '10:30 AM' },
    { id: 'ORD-002', customer: 'Mike Chen', items: 5, total: 'Rs. 2,450', status: 'Processing', date: '2024-01-14', time: '2:15 PM' },
    { id: 'ORD-003', customer: 'Emma Davis', items: 2, total: 'Rs. 980', status: 'Completed', date: '2024-01-13', time: '11:45 AM' },
    { id: 'ORD-004', customer: 'Robert Wilson', items: 4, total: 'Rs. 1,670', status: 'Completed', date: '2024-01-12', time: '9:00 AM' },
    { id: 'ORD-005', customer: 'Lisa Anderson', items: 6, total: 'Rs. 3,120', status: 'Processing', date: '2024-01-11', time: '3:20 PM' },
  ];

  const recentActivity = [
    { type: 'order', message: 'New order received from Sarah Johnson', time: '2 hours ago', icon: <ShoppingBag className="w-5 h-5 text-green-600" /> },
    { type: 'stock', message: 'Low stock alert for Green Lettuce', time: '4 hours ago', icon: <AlertCircle className="w-5 h-5 text-yellow-600" /> },
    { type: 'payment', message: 'Payment received: Rs. 12,750', time: '1 day ago', icon: <DollarSign className="w-5 h-5 text-blue-600" /> },
    { type: 'review', message: '5-star review for Fresh Carrots', time: '2 days ago', icon: <Star className="w-5 h-5 text-yellow-500" /> },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-700 border-green-200';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Out of Stock': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">Rs. 284K</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +15% this month
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Products</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
                      <p className="text-xs text-gray-500 mt-1">{products.filter(p => p.status === 'In Stock').length} in stock</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
                      <p className="text-xs text-purple-600 mt-1">{orders.filter(o => o.status !== 'Completed').length} active</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <ShoppingBag className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-600 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">4.7</p>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3 h-3 ${star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Star className="w-8 h-8 text-yellow-600" />
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
                        <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                order.status === 'Completed' ? 'bg-green-100' :
                                order.status === 'Processing' ? 'bg-blue-100' :
                                'bg-yellow-100'
                              }`}>
                                {order.status === 'Completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                                 order.status === 'Processing' ? <Clock className="w-5 h-5 text-blue-600" /> :
                                 <AlertCircle className="w-5 h-5 text-yellow-600" />}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{order.id}</p>
                                <p className="text-sm text-gray-600">{order.customer}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{order.total}</p>
                              <Badge className={`${getOrderStatusColor(order.status)} border text-xs mt-1`}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-4 mt-2">
                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{order.date}</span>
                            <span>{order.items} items</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="shadow-md">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
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
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Product Inventory</h3>
                <p className="text-gray-600 mt-1">Manage your farm products and inventory</p>
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </div>

            {/* Search Bar */}
            <Card className="shadow-md border-l-4 border-l-green-600">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span>Showing {filteredProducts.length} of {products.length} products</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Products Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="shadow-md hover:shadow-lg transition-all border-l-4 border-l-green-600">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                          <Badge className={`${getStatusColor(product.status)} border font-semibold`}>
                            {product.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="font-bold text-green-600">{product.price}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Stock</p>
                        <p className="font-bold text-gray-900">{product.stock} {product.unit}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Total Sold</p>
                        <p className="font-bold text-gray-900">{product.sold} {product.unit}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <p className="font-bold text-gray-900">{product.rating}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stock Alert */}
                    {product.status === 'Low Stock' && (
                      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm text-yellow-700 font-medium">Low stock - Consider restocking soon</p>
                      </div>
                    )}
                    {product.status === 'Out of Stock' && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <p className="text-sm text-red-700 font-medium">Out of stock - Restock immediately</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 border-green-600 text-green-600 hover:bg-green-50 font-semibold"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Stats
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <Card className="shadow-md">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or add new products</p>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case 'orders':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Order Management</h3>
                <p className="text-gray-600 mt-1">Track and manage customer orders</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold px-4 py-2">
                {orders.length} Total Orders
              </Badge>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="shadow-md hover:shadow-lg transition-all border-l-4 border-l-green-600">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-gray-900">{order.id}</h4>
                          <Badge className={`${getOrderStatusColor(order.status)} border font-semibold`}>
                            {order.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {order.status === 'Processing' && <Clock className="w-3 h-3 mr-1" />}
                            {order.status === 'Pending' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <span className="flex items-center font-medium">
                            <User className="w-4 h-4 mr-1 text-green-600" />
                            {order.customer}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                            {order.date} at {order.time}
                          </span>
                          <span className="flex items-center">
                            <Package className="w-4 h-4 mr-1 text-purple-600" />
                            {order.items} items
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Order Total</p>
                        <p className="text-2xl font-bold text-green-600">{order.total}</p>
                      </div>
                    </div>

                    {/* Order Progress */}
                    {order.status !== 'Completed' && (
                      <div className="mb-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                          <span>Order Progress</span>
                          <span className="text-green-600">
                            {order.status === 'Pending' ? '25%' : order.status === 'Processing' ? '66%' : '100%'} Complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: order.status === 'Pending' ? '25%' : order.status === 'Processing' ? '66%' : '100%' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-green-600 text-green-600 hover:bg-green-50 font-semibold"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {order.status === 'Pending' && (
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Order
                        </Button>
                      )}
                      {order.status === 'Processing' && (
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Mark Ready
                        </Button>
                      )}
                      {order.status === 'Completed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          View Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {orders.length === 0 && (
              <Card className="shadow-md">
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600">Orders from customers will appear here</p>
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
      title="Farmer Dashboard"
      userType="farmer"
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