/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Clinical neutral base
        canvas: '#F7F8F9',
        surface: '#FFFFFF',
        'surface-sunk': '#F1F3F5',
        ink: '#12181F',
        'ink-soft': '#4B5563',
        'ink-faint': '#8A94A3',
        line: '#E2E5E9',
        'line-strong': '#C9CED6',
        // Single clinical accent (emerald) + supporting cyan for system/network state
        clinic: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#059669',
          600: '#047857',
          700: '#036450',
        },
        signal: {
          400: '#38BDF8',
          500: '#0284C7',
          600: '#026AA2',
        },
        alert: {
          50: '#FEF2F2',
          500: '#DC2626',
          600: '#B91C1C',
        },
        caution: {
          50: '#FFFBEB',
          500: '#D97706',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(18,24,31,0.04), 0 1px 0 rgba(18,24,31,0.03)',
        raised: '0 4px 14px rgba(18,24,31,0.08)',
      },
      keyframes: {
        pulseWave: {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-400' },
        },
        scanline: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(2600%)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseWave: 'pulseWave 3.2s linear infinite',
        scanline: 'scanline 1.6s ease-in-out infinite',
        rise: 'rise 0.28s ease-out',
      },
    },
  },
  plugins: [],
}
