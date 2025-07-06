'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo1.png" 
                alt="Merg Logo" 
                width={24} 
                height={24} 
                className="w-6 h-6"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Merg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-invert prose-purple max-w-none">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="text-gray-400 mb-8">
            <p>Last updated: July 1, 2025</p>
          </div>

          {/* Flexible content section - you can paste your terms of service content here */}
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Acceptance of Terms</h2>
              <p>
                By accessing and using Merg's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Use of Service</h2>
              <p>
                Merg provides AI-powered search services. You may use our service for lawful purposes only. You agree not to use the service in any way that could damage, disable, or impair our systems or interfere with other users' access to the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Prohibited Uses</h2>
              <p>
                You may not use our service to: (a) violate any laws or regulations; (b) infringe on intellectual property rights; (c) transmit harmful or malicious content; (d) attempt to gain unauthorized access to our systems; or (e) interfere with the proper functioning of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Intellectual Property</h2>
              <p>
                All content, features, and functionality of Merg are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Merg shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our service. Our total liability shall not exceed the amount paid by you for the service in the past 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through our service. Continued use of the service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Email: legal@merg.ai</li>
                <li>Website: https://merg.ai/contact</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
