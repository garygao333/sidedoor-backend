'use client'

import { useState, useEffect } from 'react'
import { 
  SparklesIcon, 
  GlobeAltIcon, 
  LightBulbIcon, 
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import FadeContent from '../components/FadeContent'
import Link from 'next/link'

// Hero Component
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Back Button */}
    <div className="absolute top-8 left-8 z-20">
      <Link href="/" className="group">
        <button className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </Link>
    </div>

    {/* Animated Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
    </div>
    
    {/* Floating Elements */}
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-30`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>

    <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
      <FadeContent>
        {/* <div className="mb-8">
          <span className="inline-block px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6">
            🚀 Building the Future of Search
          </span>
        </div> */}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            About
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Merg
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
          We're revolutionizing internet search with AI-powered agents that discover content 
          in the hidden corners of the web, making information truly accessible to everyone.
        </p>
      </FadeContent>
    </div>
  </section>
)

// Stats Component
type StatsCardProps = {
  number: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  delay?: number;
};

const StatsCard = ({ number, label, icon: Icon, delay = 0 }: StatsCardProps) => (
  <FadeContent delay={delay}>
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group">
      <div className="flex flex-col items-center text-center">
        <Icon className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
        <div className="text-4xl font-bold text-white mb-2">{number}</div>
        <div className="text-gray-400 font-medium">{label}</div>
      </div>
    </div>
  </FadeContent>
)


// Mission Component
const MissionSection = () => (
  <section className="py-24 px-4">
    <div className="container mx-auto max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <FadeContent>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Our <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Mission</span>
            </h2>
            <div className="space-y-6">
              <p className="text-xl text-gray-300 leading-relaxed">
                Traditional search engines only scratch the surface. We believe that valuable information 
                shouldn't be buried in obscure forums, private communities, or overlooked websites.
              </p>
              <p className="text-xl text-gray-300 leading-relaxed">
                Merg uses advanced AI agents to navigate and understand content across the entire internet, 
                bringing you insights and answers that were previously impossible to find.
              </p>
              <div className="flex items-center space-x-4 pt-4">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <span className="text-gray-400">Trusted by researchers worldwide</span>
              </div>
            </div>
          </div>
        </FadeContent>

        <FadeContent delay={200}>
          <div className="grid grid-cols-2 gap-6">
            <StatsCard number="10M+" label="Sources Indexed" icon={GlobeAltIcon} />
            <StatsCard number="99.9%" label="Search Accuracy" icon={ChartBarIcon} delay={100} />
            <StatsCard number="<2s" label="Average Response" icon={RocketLaunchIcon} delay={200} />
            <StatsCard number="24/7" label="AI Agents Active" icon={SparklesIcon} delay={300} />
          </div>
        </FadeContent>
      </div>
    </div>
  </section>
)


// Values Component
type ValueCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  delay?: number;
};

const ValueCard = ({ icon: Icon, title, description, delay = 0 }: ValueCardProps) => (
  <FadeContent delay={delay}>
    <div className="group">
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:transform hover:scale-105">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 text-center">{title}</h3>
        <p className="text-gray-400 text-center leading-relaxed">{description}</p>
      </div>
    </div>
  </FadeContent>
)


// Team Member Component
type TeamMemberProps = {
  initials: string;
  name: string;
  role: string;
  description: string;
  achievements: string;
  delay?: number;
};

const TeamMember = ({ initials, name, role, description, achievements, delay = 0 }: TeamMemberProps) => (
  <FadeContent delay={delay}>
    <div className="group">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:transform hover:scale-105">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl font-bold text-white">{initials}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
          <p className="text-purple-400 mb-4 text-lg font-semibold">{role}</p>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">{description}</p>
          <div className="bg-gray-700/30 rounded-xl p-4">
            <p className="text-gray-400 text-xs leading-relaxed">{achievements}</p>
          </div>
        </div>
      </div>
    </div>
  </FadeContent>
)


// CTA Component
const CTASection = () => (
  <section className="py-24 px-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-purple-800/10 to-purple-600/10"></div>
    <div className="container mx-auto max-w-5xl text-center relative z-10">
      <FadeContent>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Join Our <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Journey</span>
        </h2>
        <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
          We're just getting started. Help us revolutionize how the world discovers information 
          and unlock the hidden knowledge of the internet.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/" className="group">
            <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-purple-500/25">
              <span className="flex items-center space-x-2">
                <RocketLaunchIcon className="w-5 h-5" />
                <span>Try Merg Now</span>
              </span>
            </button>
          </Link>
          <button className="border-2 border-gray-600 hover:border-purple-400 text-gray-300 hover:text-purple-400 font-bold py-4 px-10 rounded-full transition-all duration-300 hover:bg-purple-400/10">
            <span className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5" />
              <span>Contact Us</span>
            </span>
          </button>
        </div>
      </FadeContent>
    </div>
  </section>
)

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <HeroSection />
      
      <MissionSection />

      {/* Values Section */}
      <section className="py-24 px-4 bg-gray-800/30">
        <div className="container mx-auto max-w-7xl">
          <FadeContent>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Our <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Values</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                The principles that guide our mission to democratize access to information
              </p>
            </div>
          </FadeContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValueCard 
              icon={SparklesIcon}
              title="Innovation"
              description="Pushing the boundaries of what's possible with AI and search technology to unlock new possibilities."
              delay={0}
            />
            <ValueCard 
              icon={GlobeAltIcon}
              title="Accessibility"
              description="Making information accessible to everyone, regardless of where it's hidden on the internet."
              delay={100}
            />
            <ValueCard 
              icon={LightBulbIcon}
              title="Intelligence"
              description="Building smarter systems that understand context, intent, and the nuances of human inquiry."
              delay={200}
            />
            <ValueCard 
              icon={ShieldCheckIcon}
              title="Privacy"
              description="Protecting user privacy while delivering powerful search capabilities and maintaining trust."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <FadeContent>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Meet the <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Team</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                The visionaries and builders making the future of search a reality
              </p>
            </div>
          </FadeContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <TeamMember
              initials="GG"
              name="Gary"
              role="Troll #1"
              description=""
              achievements=""
              delay={0}
            />
            <TeamMember
              initials="IF"
              name="Ian"
              role="Troll #2"
              description=""
              achievements=""
              delay={200}
            />
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  )
}
