'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="text-gray-400 mb-8">
            <p>Last updated: July 1, 2025</p>
          </div>

          {/* Flexible content section - you can paste your privacy policy content here */}
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, use our search services, or contact us. This may include your name, email address, search queries, and usage data. We also automatically collect certain information about your device and how you interact with our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <p>
                We use the information we collect to: (a) provide and improve our search services; (b) personalize your experience; (c) communicate with you about our services; (d) analyze usage patterns and trends; and (e) comply with legal obligations. We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Information Sharing</h2>
              <p>
                We may share your information in limited circumstances: (a) with your consent; (b) to comply with legal requirements; (c) to protect our rights and the safety of others; (d) in connection with a business transaction; or (e) with service providers who assist us in operating our platform under strict confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser, though this may affect the functionality of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website and updating the "Last updated" date above.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Email: privacy@merg.ai</li>
                <li>Website: https://merg.ai/contact</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
