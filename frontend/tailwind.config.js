/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf7ff',
          100: '#f3ecff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        dark: {
          50: '#1e1b26',
          100: '#2a2635',
          200: '#363044',
          300: '#423a53',
          400: '#4e4462',
          500: '#5a4e71',
          600: '#665880',
          700: '#72628f',
          800: '#7e6c9e',
          900: '#8a76ad',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' },
          'to': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['dark', 'dark-hover', 'dark-focus', 'hover', 'focus'],
      textColor: ['dark', 'dark-hover', 'dark-focus', 'hover', 'focus'],
      borderColor: ['dark', 'dark-hover', 'dark-focus', 'hover', 'focus'],
      ringColor: ['dark', 'dark-hover', 'dark-focus', 'hover', 'focus'],
      ringWidth: ['dark', 'dark-hover', 'dark-focus', 'hover', 'focus'],
      ringOffsetWidth: ['dark', 'dark-hover', 'dark-focus', 'hover', 'focus'],
      ringOffsetColor: ['dark', 'dark-hover', 'dark-focus', 'hover', 'focus'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
