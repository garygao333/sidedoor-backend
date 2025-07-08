'use client'

import { 
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import FadeContent from '../components/FadeContent'
import StarBorderButton from '../components/StarBorderButton'
import Link from 'next/link'

// Mission Component
const MissionSection = () => (
  <section className="py-20 px-4 relative">
    {/* Back Button */}
    <div className="absolute top-8 left-8 z-20">
      <Link href="/">
        <StarBorderButton 
          variant="primary" 
          size="sm"
          className="bg-transparent border-gray-600 text-gray-300 hover:border-purple-400 hover:text-purple-300"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back</span>
        </StarBorderButton>
      </Link>
    </div>

    <div className="container mx-auto max-w-4xl pt-16">
      <FadeContent>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About <span className="text-purple-400">Merg</span>
          </h1>
          <h2 className="text-2xl font-bold text-white mb-6">
            Our <span className="text-purple-400">Mission</span>
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <p className="text-lg text-gray-300 leading-relaxed">
              Traditional search engines only scratch the surface. We believe that valuable information 
              shouldn't be buried in obscure forums, private communities, or overlooked websites.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Merg uses advanced AI agents to navigate and understand content across the entire internet, 
              bringing you insights and answers that were previously impossible to find.
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
    <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 hover:border-purple-500 transition-all duration-300">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-6">
          <span className="text-2xl font-bold text-white">{initials}</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
        {university && <p className="text-gray-400 text-sm mb-2">{university}</p>}
        <p className="text-purple-400 text-lg font-medium">{role}</p>
      </div>
    </div>
  </FadeContent>
)

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <MissionSection />

      {/* Team Section */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="container mx-auto max-w-4xl">
          <FadeContent>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Meet the <span className="text-purple-400">Team</span>
              </h2>
              <p className="text-lg text-gray-400">
                The founders building the future of search
              </p>
            </div>
          </FadeContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl mx-auto">
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
    </div>
  )
}