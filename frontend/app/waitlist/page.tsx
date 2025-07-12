'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import StarBorderButton from '../components/StarBorderButton';
import Hyperspeed from '../components/Hyperspeed';

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // Change to true for seeing the success page
  const [mounted, setMounted] = useState(false);
  const { addToWaitlist } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);

    try {
      await addToWaitlist(name, email, reason);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  // For testing the sucess page
  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">
        {/* Hyperspeed Background */}
        <Hyperspeed
          effectOptions={{
            onSpeedUp: () => { },
            onSlowDown: () => { },
            distortion: 'turbulentDistortion',
            length: 400,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 4,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 20,
            lightPairsPerRoadWay: 40,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [400 * 0.03, 400 * 0.2],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.8, 0.8],
            carFloorSeparation: [0, 5],
            colors: {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0xFFFFFF,
              brokenLines: 0xFFFFFF,
              leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
              rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
              sticks: 0x03B3C3,
            }
          }}
        />

        <div className="max-w-lg w-full relative z-10">
          <div className="bg-gray-900/90 backdrop-blur-sm border-2 border-purple-500/60 p-8 text-center shadow-2xl">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 mx-auto mb-6 flex items-center justify-center rounded-full">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            
            {/* Header */}
            <h1 className="text-3xl font-bold text-purple-400 mb-4">
              You're In!
            </h1>
            
            <p className="text-gray-300 text-base mb-8 leading-relaxed">
              Welcome to the exclusive Merg waitlist. You'll be among the first to explore the hidden depths of the internet with AI-powered search.
            </p>
            
            {/* Email Confirmation Section */}
            <div className="bg-gray-800/60 border-2 border-purple-500/40 p-6 mb-6 text-left">
              <div className="flex items-center mb-4">
                <RocketLaunchIcon className="w-5 h-5 text-purple-400 mr-3" />
                <h2 className="text-purple-300 font-semibold text-lg">What happens next?</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm">
                    <span className="font-medium text-purple-300">Email confirmation:</span> Check your inbox for a welcome message
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm">
                    <span className="font-medium text-purple-300">Early access:</span> Get notified when Merg launches
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-sm">
                    <span className="font-medium text-purple-300">Exclusive updates:</span> Receive behind-the-scenes development insights
                  </p>
                </div>
              </div>
            </div>

            {/* Meeting Scheduling Section */}
            <div className="bg-gray-800/40 border-2 border-purple-400/30 p-6 mb-6">
              <h3 className="text-purple-300 font-semibold text-lg mb-3">
                Want to dive deeper?
              </h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Schedule a 30-minute chat with our founder to discuss your ideas, share feedback, or learn more about Merg's vision.
              </p>
              
              <a 
                href="https://calendly.com/garygao-seas/30min" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full"
              >
                <StarBorderButton
                  variant="primary"
                  size="lg"
                  className="w-full bg-transparent hover:bg-purple-500/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Schedule 30-Minute Chat</span>
                </StarBorderButton>
              </a>
            </div>

            {/* Footer Message */}
            <p className="text-gray-400 text-xs">
              Thank you for joining our journey into the unknown
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Hyperspeed Background */}
      <Hyperspeed
        effectOptions={{
          onSpeedUp: () => { },
          onSlowDown: () => { },
          distortion: 'turbulentDistortion',
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 4,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [400 * 0.03, 400 * 0.2],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
          colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0xFFFFFF,
            brokenLines: 0xFFFFFF,
            leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
            rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
            sticks: 0x03B3C3,
          }
        }}
      />

      <div className="max-w-xl w-full relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Join the Waitlist
          </h1>
          
          <p className="text-lg text-gray-400 mb-6 leading-relaxed">
            Be among the first to experience AI-powered search that discovers content in the hidden corners of the internet
          </p>
          
  
          <div className="inline-flex items-center px-4 py-2 bg-gray-900 border border-purple-500/50">
            <div className="w-1.5 h-1.5 bg-purple-400 mr-2"></div>
            <span className="text-purple-300 font-medium text-sm">into the unknown :)</span>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 p-6 md:p-8 shadow-lg">
          {error && (
            <div className="mb-6 p-3 bg-red-900/60 backdrop-blur-sm border border-red-500 text-red-200">
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
                  className="w-full px-3 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 transition-colors duration-300 text-sm"
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
                  className="w-full px-3 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 transition-colors duration-300 text-sm"
                  placeholder="your@email.com"
                />
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
                rows={3}
                className="w-full px-3 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 transition-colors duration-300 resize-none text-sm"
                placeholder="Tell us what excites you about Merg search..."
              />
            </div>

            {/* Submit Button */}
            <StarBorderButton
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {}}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent"></div>
                  <span>Joining waitlist...</span>
                </>
              ) : (
                <>
                  <RocketLaunchIcon className="w-4 h-4" />
                  <span>Join the Waitlist</span>
                </>
              )}
            </StarBorderButton>
          </form>
        </div>

       
      </div>
    </div>
  );
}