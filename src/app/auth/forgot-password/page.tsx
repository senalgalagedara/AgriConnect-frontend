'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Phone, Lock, Eye, EyeOff, Leaf, Shield } from 'lucide-react';

type Step = 'phone' | 'otp' | 'reset';

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>('phone');
  const [formData, setFormData] = useState({
    contactNumber: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const validatePhone = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
    const timer = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Sending OTP to:', formData.contactNumber);
      setCurrentStep('otp');
      startOtpTimer();
    } catch (error) {
      console.error('Send OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOtp()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Verifying OTP:', formData.otp);
      setCurrentStep('reset');
    } catch (error) {
      console.error('Verify OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Resetting password');
      // Redirect to login or show success message
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'phone':
        return (
          <form onSubmit={handleSendOtp}>
            <CardContent className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  Enter your contact number and we'll send you an OTP to reset your password.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    placeholder="+1 (555) 123-4567"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className={`pl-10 ${errors.contactNumber ? 'border-red-500' : ''}`}
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

              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </CardContent>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-600">
                  We've sent a 6-digit OTP to {formData.contactNumber}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className={`text-center text-xl tracking-widest ${errors.otp ? 'border-red-500' : ''}`}
                />
                {errors.otp && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-600 text-sm">
                      {errors.otp}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                {otpTimer > 0 ? (
                  <p>Resend OTP in {otpTimer} seconds</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => startOtpTimer()}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </CardContent>
          </form>
        );

      case 'reset':
        return (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-600">
                  Create a new strong password for your account
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-600 text-sm">
                      {errors.newPassword}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-600 text-sm">
                      {errors.confirmPassword}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Resetting password...</span>
                  </div>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </CardContent>
          </form>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'phone': return 'Forgot Password';
      case 'otp': return 'Verify OTP';
      case 'reset': return 'Reset Password';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AgriConnect</h1>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              {currentStep !== 'phone' && (
                <button
                  onClick={() => {
                    if (currentStep === 'otp') setCurrentStep('phone');
                    if (currentStep === 'reset') setCurrentStep('otp');
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <CardTitle className="text-2xl font-semibold">{getStepTitle()}</CardTitle>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex space-x-2 mt-4">
              <div className={`h-2 flex-1 rounded-full ${currentStep === 'phone' ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div className={`h-2 flex-1 rounded-full ${currentStep === 'otp' ? 'bg-green-500' : currentStep === 'reset' ? 'bg-gray-200' : 'bg-gray-200'}`} />
              <div className={`h-2 flex-1 rounded-full ${currentStep === 'reset' ? 'bg-green-500' : 'bg-gray-200'}`} />
            </div>
          </CardHeader>

          {renderStepContent()}

          <div className="px-6 pb-6">
            <p className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link 
                href="/auth/login" 
                className="font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}