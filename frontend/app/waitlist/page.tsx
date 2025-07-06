'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { addToWaitlist } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);

    try {
      await addToWaitlist(email, password, {
        name: name.trim(),
        reason: reason.trim(),
        joinedFrom: 'waitlist-page'
      });
      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'weak', color: 'bg-red-500', width: '33%' };
    if (password.length < 10) return { strength: 'medium', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'strong', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">
        {/* Simple Success Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-24 h-24 bg-green-500/20 opacity-50"></div>
          <div className="absolute bottom-32 left-16 w-16 h-16 bg-green-600/30 opacity-40"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-gray-900 border border-green-500/50 p-8 text-center shadow-lg">
            <div className="w-12 h-12 bg-green-500 mx-auto mb-4 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-green-400 mb-3">
              Welcome Aboard!
            </h1>
            
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              You're now part of an exclusive community of early adopters. Get ready to explore the hidden corners of the web.
            </p>
            
            <div className="bg-gray-800 border border-green-500/30 p-4 mb-6">
              <div className="flex items-center justify-center mb-3">
                <RocketLaunchIcon className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-green-300 font-semibold text-sm">What's Next?</span>
              </div>
              <ul className="text-green-300 text-xs space-y-2 text-left">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-400 mr-2"></div>
                  Check your email for confirmation
                </li>

                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-400 mr-2"></div>
                  Get notified when early access launches
                </li>
              </ul>
            </div>

            <Link 
              href="/" 
              className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 text-sm transition-colors duration-300"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              Start Exploring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">
      {/* Simple Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 right-32 w-32 h-32 bg-purple-500/10"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-600/15"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-purple-400/20"></div>
      </div>

      <div className="max-w-xl w-full relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Join the Waitlist
          </h1>
          
          <p className="text-lg text-gray-400 mb-6 leading-relaxed">
            Be among the first to experience AI-powered search that discovers content in the hidden corners of the internet
          </p>
          
          {/* Simple Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gray-900 border border-purple-500/50">
            <div className="w-1.5 h-1.5 bg-purple-400 mr-2"></div>
            <span className="text-purple-300 font-medium text-sm">Limited Early Access Available</span>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-gray-900 border border-gray-700 p-6 md:p-8 shadow-lg">
          {error && (
            <div className="mb-6 p-3 bg-red-900/50 border border-red-500 text-red-200">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 flex items-center justify-center mr-2">
                  <span className="text-white text-xs">!</span>
                </div>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 transition-colors duration-300 text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 transition-colors duration-300 text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 pr-10 transition-colors duration-300 text-sm"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                  >
                    {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Password strength</span>
                      <span className="capitalize text-purple-400">{passwordStrength.strength}</span>
                    </div>
                    <div className="w-full bg-gray-700 h-1.5">
                      <div 
                        className={`${passwordStrength.color} h-1.5 transition-all duration-500`}
                        style={{ width: passwordStrength.width }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 pr-10 transition-colors duration-300 text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="mt-2 flex items-center">
                    {password === confirmPassword ? (
                      <div className="flex items-center text-green-400 text-xs">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Passwords match
                      </div>
                    ) : (
                      <div className="flex items-center text-red-400 text-xs">
                        <div className="w-3 h-3 mr-1 bg-red-500 flex items-center justify-center">
                          <span className="text-white text-xs">✕</span>
                        </div>
                        Passwords don't match
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Interest Field */}
            <div>
              <label htmlFor="reason" className="block text-xs font-semibold text-gray-300 mb-2">
                What interests you most about Merg? <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 transition-colors duration-300 resize-none text-sm"
                placeholder="Tell us what excites you about AI-powered search..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  <span>Joining waitlist...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <RocketLaunchIcon className="w-4 h-4 mr-2" />
                  Join the Waitlist
                </span>
              )}
            </button>
          </form>
        </div>

       
      </div>
    </div>
  );
}