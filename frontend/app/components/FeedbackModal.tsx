'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface FeedbackModalProps {
  result: {
    title: string
    type: string
    quality: string
  }
  onSubmit: (verdict: string, reason?: string) => void
  onClose: () => void
}

export default function FeedbackModal({ result, onSubmit, onClose }: FeedbackModalProps) {
  const [verdict, setVerdict] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [customReason, setCustomReason] = useState<string>('')

  const feedbackOptions = {
    good: [
      'Perfect match',
      'Good quality',
      'Fast download',
      'Exactly what I wanted'
    ],
    bad: [
      'Wrong title',
      'Low resolution',
      'Cam rip',
      'Corrupted file',
      'Dead link',
      'Not the content I expected'
    ]
  }

  const handleSubmit = () => {
    if (!verdict) return
    
    const finalReason = reason === 'other' ? customReason : reason
    onSubmit(verdict, finalReason)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Rate this result</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Result Info */}
        <div className="bg-dark-700 rounded-lg p-3 mb-6">
          <h4 className="font-medium text-white mb-1">{result.title}</h4>
          <div className="text-sm text-gray-400">
            {result.type} • {result.quality}
          </div>
        </div>

        {/* Verdict Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Was this result helpful?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setVerdict('good')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                verdict === 'good'
                  ? 'border-green-500 bg-green-500/10 text-green-400'
                  : 'border-dark-600 hover:border-dark-500 text-gray-300'
              }`}
            >
              👍 Good
            </button>
            <button
              onClick={() => setVerdict('bad')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                verdict === 'bad'
                  ? 'border-red-500 bg-red-500/10 text-red-400'
                  : 'border-dark-600 hover:border-dark-500 text-gray-300'
              }`}
            >
              👎 Bad
            </button>
          </div>
        </div>

        {/* Reason Selection */}
        {verdict && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Why? (optional)
            </label>
            <div className="space-y-2">
              {feedbackOptions[verdict as keyof typeof feedbackOptions].map((option) => (
                <button
                  key={option}
                  onClick={() => setReason(option)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    reason === option
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500'
                      : 'bg-dark-700 hover:bg-dark-600 text-gray-300 transition-colors duration-200'
                  }`}
                >
                  {option}
                </button>
              ))}
              <button
                onClick={() => setReason('other')}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  reason === 'other'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500'
                    : 'bg-dark-700 hover:bg-dark-600 text-gray-300 transition-colors duration-200'
                }`}
              >
                Other (specify below)
              </button>
            </div>

            {reason === 'other' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please specify..."
                className="w-full mt-3 input-primary resize-none"
                rows={3}
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!verdict}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  )
}
