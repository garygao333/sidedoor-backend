'use client'

import { 
  ArrowLeftIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import FadeContent from '../components/FadeContent'
import StarBorderButton from '../components/StarBorderButton'
import Hyperspeed from '../components/Hyperspeed'
import Link from 'next/link'

// Mission Component
const MissionSection = () => (
  <section className="py-20 px-4 relative">
    {/* Hyperspeed Background */}
    <div className="absolute inset-0 opacity-60">
      <Hyperspeed 
        effectOptions={{
          colors: {
            roadColor: 0x1a1a2e,
            islandColor: 0x16213e,
            background: 0x0f0f23,
            shoulderLines: 0x4a5568,
            brokenLines: 0x4a5568,
            leftCars: [0x553c9a, 0x6d28d9, 0x4c1d95],
            rightCars: [0x3730a3, 0x312e81, 0x1e1b4b],
            sticks: 0x4c1d95,
          }
        }}
      />
    </div>

    {/* Back Button */}
    <div className="absolute top-8 left-8 z-20">
      <Link href="/">
        <StarBorderButton 
          variant="primary" 
          size="sm"
          className="bg-black/50 border-gray-500 text-gray-300 hover:border-violet-400 hover:text-violet-300"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back</span>
        </StarBorderButton>
      </Link>
    </div>

    <div className="container mx-auto max-w-4xl pt-16 relative z-10">
      <FadeContent>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            About <span className="text-violet-300">Merg</span>
          </h1>
          <div className="space-y-6 max-w-3xl mx-auto">
            <p className="text-xl text-gray-200 leading-relaxed">
              We're building the next generation of search. Traditional search engines only scratch the surface—we go deeper.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Our AI agents navigate and understand content across the entire internet, uncovering insights from forums, communities, and overlooked websites that other search engines miss.
            </p>
          </div>
        </div>
      </FadeContent>
    </div>
  </section>
)

// Team Member Component
type TeamMemberProps = {
  initials: string;
  name: string;
  role: string;
  university?: string;
  delay?: number;
};

const TeamMember = ({ initials, name, role, university, delay = 0 }: TeamMemberProps) => (
  <FadeContent delay={delay}>
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-gray-600 hover:border-violet-400 transition-all duration-300">
      <div className="text-center">
        <div className="w-20 h-20 bg-violet-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <span className="text-xl font-bold text-white">{initials}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
        {university && <p className="text-gray-400 text-sm mb-2">{university}</p>}
        <p className="text-violet-300 font-medium">{role}</p>
      </div>
    </div>
  </FadeContent>
)

// Calendly Section Component
const CalendlySection = () => (
  <section className="py-20 px-4 relative">
    <div className="container mx-auto max-w-2xl relative z-10">
      <FadeContent>
        <div className="text-center bg-black/40 backdrop-blur-sm rounded-lg p-12 border border-gray-600">
          <CalendarDaysIcon className="w-12 h-12 text-violet-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Have ideas or feedback?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            We'd love to hear from you. Schedule a chat with our founders to discuss suggestions, partnerships, or just to say hello.
          </p>
          <a 
            href="https://calendly.com/garygao-seas/30min"
            target="_blank"
            rel="noopener noreferrer"
          >
            <StarBorderButton 
              variant="primary" 
              size="lg"
              className="bg-transparent border-violet-500 text-violet-300 hover:bg-violet-600/20 hover:border-violet-400"
            >
              Schedule a Meeting
            </StarBorderButton>
          </a>
        </div>
      </FadeContent>
    </div>
  </section>
)

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Background Hyperspeed Effect */}
      <div className="fixed inset-0 opacity-50">
        <Hyperspeed 
          effectOptions={{
            colors: {
              roadColor: 0x1a1a2e,
              islandColor: 0x16213e,
              background: 0x0f0f23,
              shoulderLines: 0x4a5568,
              brokenLines: 0x4a5568,
              leftCars: [0x553c9a, 0x6d28d9, 0x4c1d95],
              rightCars: [0x3730a3, 0x312e81, 0x1e1b4b],
              sticks: 0x4c1d95,
            }
          }}
        />
      </div>

      <div className="relative z-10">
        <MissionSection />

        {/* Team Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <FadeContent>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">
                  The <span className="text-violet-300">Team</span>
                </h2>
                <p className="text-gray-300">
                  Building the future of search
                </p>
              </div>
            </FadeContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <TeamMember
                initials="GG"
                name="Gary"
                university="University of Pennsylvania"
                role="Co-Founder"
                delay={0}
              />
              <TeamMember
                initials="IF"
                name="Ian"
                university="New York University"
                role="Co-Founder"
                delay={200}
              />
            </div>
          </div>
        </section>

        <CalendlySection />
      </div>
    </div>
  )
}