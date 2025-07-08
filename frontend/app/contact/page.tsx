'use client'

import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import StarBorderButton from '../components/StarBorderButton'

export default function ContactPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        
        {/* Back Button */}
        <div className="mb-8 flex justify-start">
          <StarBorderButton 
            onClick={() => router.back()}
            variant="primary"
            size="sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </StarBorderButton>
        </div>

        <h1 className="text-4xl font-bold text-white mb-8">
          Contact Us
        </h1>
        
        <div className="space-y-8">
          {/* Founders & Investors */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Founders & Investors</h2>
            <a 
              href="mailto:founders@mergai.org"
              className="flex items-center justify-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <EnvelopeIcon className="h-5 w-5" />
              <span>founders@mergai.org</span>
            </a>
          </div>

          {/* Business & Collaborators */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Business & Collaborators</h2>
            <a 
              href="mailto:business@mergai.org"
              className="flex items-center justify-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <EnvelopeIcon className="h-5 w-5" />
              <span>business@mergai.org</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
