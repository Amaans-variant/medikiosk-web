import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1A5276', dark: '#154360', light: '#EBF5FB' },
        teal:    { DEFAULT: '#148F77', light: '#E8F8F0', bright: '#1ABC9C' },
        success: { DEFAULT: '#27AE60', light: '#EAFAF1' },
        warning: { DEFAULT: '#E67E22', light: '#FEF5E7' },
        alert:   { DEFAULT: '#E74C3C', light: '#FDEDEC' },
        surface: { DEFAULT: '#FAFAF8', card: '#FFFFFF' },
        text:    { DEFAULT: '#1C2833', muted: '#7F8C8D' },
        border:  { DEFAULT: '#E5E7EB' },
        disabled:{ DEFAULT: '#D5DBDB' },
      },
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '20px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-noto-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm:    '0 1px 3px rgba(28, 40, 51, 0.06)',
        md:    '0 4px 12px rgba(28, 40, 51, 0.08)',
        lg:    '0 8px 24px rgba(28, 40, 51, 0.12)',
        inner: 'inset 0 2px 4px rgba(28, 40, 51, 0.04)',
      },
    },
  },
  plugins: [],
};
export default config;
