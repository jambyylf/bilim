import type { Config } from 'tailwindcss'

// Bilim платформасының Tailwind конфигурациясы
// Дизайн токендер app-course/project/styles.css файлынан алынды
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          700: '#1e40af',
          50: '#eef2ff',
        },
        accent: {
          DEFAULT: '#F59E0B',
          50: '#fef3c7',
        },
        teal: {
          DEFAULT: '#0d9488',
        },
        bilim: {
          bg: '#FFFFFF',
          'bg-soft': '#F9FAFB',
          'bg-tint': '#F3F4F6',
          line: '#E5E7EB',
          'line-soft': '#F1F2F4',
          text: '#111827',
          'text-2': '#374151',
          'text-3': '#6B7280',
          'text-4': '#9CA3AF',
          success: '#059669',
          error: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SF Mono', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        pill: '999px',
      },
      boxShadow: {
        1: '0 1px 2px rgba(17,24,39,0.04), 0 1px 1px rgba(17,24,39,0.03)',
        2: '0 4px 12px rgba(17,24,39,0.06), 0 1px 2px rgba(17,24,39,0.04)',
        3: '0 12px 32px rgba(17,24,39,0.08), 0 2px 6px rgba(17,24,39,0.04)',
        focus: '0 0 0 3px rgba(30,58,138,0.18)',
      },
      backgroundImage: {
        'grad-1': 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%)',
        'grad-2': 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #5eead4 100%)',
        'grad-3': 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
        'grad-4': 'linear-gradient(135deg, #b45309 0%, #F59E0B 60%, #fcd34d 100%)',
        'grad-5': 'linear-gradient(135deg, #be123c 0%, #f43f5e 100%)',
        'grad-6': 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
        'grad-7': 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
        'grad-8': 'linear-gradient(135deg, #1e293b 0%, #1E3A8A 100%)',
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite linear',
        'blob-drift': 'blob-drift 18s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'blob-drift': {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(40px,-30px) scale(1.08)' },
          '66%': { transform: 'translate(-30px,40px) scale(0.94)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
