'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Lock, Leaf, Users } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
    role: '',
    password: '',
    retypePassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Contact number validation
    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length < 10) {
      newErrors.address = 'Please enter a complete address';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Retype password validation
    if (!formData.retypePassword) {
      newErrors.retypePassword = 'Please retype your password';
    } else if (formData.password !== formData.retypePassword) {
      newErrors.retypePassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Signup attempt:', formData);
      
      // Handle successful signup here
      // Redirect to appropriate dashboard based on selected role
      alert('Account created successfully! Ready for backend integration.');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'farmer', label: 'Farmer', description: 'Produce and sell agricultural products' },
    { value: 'consumer', label: 'Consumer', description: 'Buy fresh produce and dairy products' },
    { value: 'driver', label: 'Delivery Driver', description: 'Deliver products to consumers' }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,#f0fdf4 0%,#ffffff 45%, #eff6ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px'
      }}
    >
      <div style={{ width: '100%', maxWidth: 960 }}>
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              background: '#16a34a',
              borderRadius: '9999px',
              marginBottom: 16
            }}
          >
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#111827', margin: 0 }}>Join AgriConnect</h1>
            <p style={{ color: '#475569', marginTop: 8, fontSize: 14 }}>Create your account to get started</p>
        </div>

        <Card style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '0', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)' }}>
          <CardHeader style={{ textAlign: 'center', paddingBottom: 12 }}>
            <CardTitle style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px' }}>Create Account</CardTitle>
            <CardDescription style={{ marginTop: 4, fontSize: 14 }}>Fill in your details to join our farming community</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 8 }}>
              {/* Name Fields */}
              <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`pl-12 h-11 ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.firstName && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-600 text-sm">
                        {errors.firstName}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`pl-12 h-11 ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.lastName && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-600 text-sm">
                        {errors.lastName}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-12 h-11 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-600 text-sm">
                      {errors.email}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Contact and Role */}
              <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      placeholder="+1 (555) 123-4567"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className={`pl-12 h-11 ${errors.contactNumber ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.contactNumber && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-600 text-sm">
                        {errors.contactNumber}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Select Role</Label>
                  <Select onValueChange={handleRoleChange}>
                    <SelectTrigger className={`h-11 ${errors.role ? 'border-red-500' : ''} flex items-center pl-3 pr-3`}> {/* icon already outside input text */}
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <SelectValue placeholder="Choose your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-sm text-gray-500">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-600 text-sm">
                        {errors.role}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Address Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-5 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`pl-12 pt-3 min-h-[96px] leading-relaxed resize-none ${errors.address ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.address && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-600 text-sm">
                      {errors.address}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Password Fields */}
              <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-12 pr-10 h-11 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-600 text-sm">
                        {errors.password}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retypePassword">Retype Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="retypePassword"
                      name="retypePassword"
                      type={showRetypePassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={formData.retypePassword}
                      onChange={handleChange}
                      className={`pl-12 pr-10 h-11 ${errors.retypePassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRetypePassword(!showRetypePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showRetypePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.retypePassword && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-600 text-sm">
                        {errors.retypePassword}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: '#04BE42',
                  color: '#fff',
                  height: 48,
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: '.5px'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', paddingTop: 4 }}>
                Already have an account?{' '}
                <Link href="/auth/login" style={{ fontWeight: 500, color: '#16a34a' }}>
                  Sign in
                </Link>
              </p>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}