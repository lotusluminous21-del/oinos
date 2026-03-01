import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        skeuo: {
          bg: '#F0F2F6',
          'bg-alt': '#E8EAEF',
          primary: '#015B6A',
          secondary: '#303C59',
          accent: '#00D4CA',
          'accent-dark': '#00B8AF',
          text: '#1E293B',
          'text-muted': '#64748B',
          pink: '#db2777',
        },
      },
      borderRadius: {
        'skeuo': '2rem',
        'skeuo-lg': '2.5rem',
        'skeuo-xl': '3rem',
      },
      boxShadow: {
        'skeuo-raised': '6px 6px 12px rgba(0, 0, 0, 0.06), -6px -6px 12px rgba(255, 255, 255, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.04), -1px -1px 2px rgba(255, 255, 255, 1)',
        'skeuo-raised-hover': '8px 8px 16px rgba(0, 0, 0, 0.08), -8px -8px 16px rgba(255, 255, 255, 0.9), 2px 2px 4px rgba(0, 0, 0, 0.03), -2px -2px 4px rgba(255, 255, 255, 1)',
        'skeuo-inset': 'inset 4px 4px 8px rgba(0, 0, 0, 0.06), inset -4px -4px 8px rgba(255, 255, 255, 0.7), inset 1px 1px 2px rgba(0, 0, 0, 0.05), inset -1px -1px 2px rgba(255, 255, 255, 0.9)',
        'skeuo-button': '0 4px 14px rgba(0, 212, 202, 0.4), inset 1px 1px 2px rgba(255, 255, 255, 0.4), inset -1px -1px 2px rgba(0, 0, 0, 0.05)',
        'skeuo-button-active': 'inset 2px 2px 6px rgba(0, 0, 0, 0.1), inset -2px -2px 6px rgba(255, 255, 255, 0.2)',
        'skeuo-avatar': '4px 4px 8px rgba(0, 0, 0, 0.06), -4px -4px 8px rgba(255, 255, 255, 0.9), 1px 1px 2px rgba(0, 0, 0, 0.04), -1px -1px 2px rgba(255, 255, 255, 1)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
