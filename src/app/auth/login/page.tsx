'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, Leaf, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, loading: authLoading } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = search.get('next') || '/';
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear submit error on any input change
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitError(null);
    
    try {
      await login(formData.email, formData.password);
      router.replace(nextPath);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setSubmitError('Invalid email or password');
        } else {
          setSubmitError(error.message || 'Login failed');
        }
      } else {
        setSubmitError(error instanceof Error ? error.message : 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 sm:mb-10 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4 sm:mb-6 transform transition-transform hover:scale-105 hover:rotate-3 duration-300">
            <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            AgriConnect
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base font-medium">
            Connecting farmers to consumers
          </p>
        </div>

        <Card className="shadow-2xl border border-green-100/50 bg-white/90 backdrop-blur-md hover:shadow-green-100/50 transition-shadow duration-300 animate-in fade-in slide-in-from-bottom duration-700">
          <CardHeader className="space-y-2 text-center pb-6 pt-8 px-6 sm:px-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-6 sm:px-8 pb-6">
              {/* Global Error Alert */}
              {submitError && (
                <Alert className="border-red-300 bg-red-50/80 backdrop-blur-sm animate-in fade-in slide-in-from-top duration-300">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 text-sm font-medium ml-2">
                    {submitError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-semibold text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200 pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-12 h-11 text-base transition-all duration-200 border-gray-200 
                      focus:border-green-400 focus:ring-2 focus:ring-green-100 
                      hover:border-gray-300 bg-white/50
                      ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <Alert 
                    id="email-error"
                    className="border-red-300 bg-red-50/80 backdrop-blur-sm py-2 animate-in fade-in slide-in-from-top duration-200"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                    <AlertDescription className="text-red-700 text-xs font-medium ml-2">
                      {errors.email}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200 pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-12 pr-10 h-11 text-base transition-all duration-200 border-gray-200 
                      focus:border-green-400 focus:ring-2 focus:ring-green-100 
                      hover:border-gray-300 bg-white/50
                      ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:text-green-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-200 rounded p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <Alert 
                    id="password-error"
                    className="border-red-300 bg-red-50/80 backdrop-blur-sm py-2 animate-in fade-in slide-in-from-top duration-200"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                    <AlertDescription className="text-red-700 text-xs font-medium ml-2">
                      {errors.password}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right pt-1">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-green-600 hover:text-green-700 font-semibold transition-all duration-200 hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-green-200 rounded px-1"
                >
                  Forgot your password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 px-6 sm:px-8 pb-8">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-green-300 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoading || authLoading}
              >
                {(isLoading || authLoading) ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative w-full py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-500 font-medium">
                    New to AgriConnect?
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600">
                <Link 
                  href="/auth/signup" 
                  className="font-semibold text-green-600 hover:text-green-700 transition-all duration-200 hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-green-200 rounded px-1"
                >
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 AgriConnect. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}