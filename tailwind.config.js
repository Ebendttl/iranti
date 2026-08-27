/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbe6',
          100: '#fff3b3',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          900: '#78350f',
        },
        sui: {
          light: '#4CA2FF',
          DEFAULT: '#0055FF',
          dark: '#003BB3',
        },
        walrus: {
          cyan: '#06B6D4',
          teal: '#14B8A6',
          navy: '#0F172A',
        },
        whatsapp: {
          green: '#25D366',
          dark: '#075E54',
          light: '#DCF8C6',
          bubbleBg: '#111B21',
          chatBg: '#0B141A',
        }
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'hero-radial': 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
      }
    },
  },
  plugins: [],
}
