import type { Config } from "tailwindcss";

/** Builds a Tailwind color value that reads an `--color-*` CSS variable
 *  while still supporting opacity modifiers like `bg-primary/20`. */
function withOpacity(cssVar: string) {
  return `rgb(var(${cssVar}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: withOpacity("--color-primary"),
          dark: withOpacity("--color-primary-dark"),
          light: withOpacity("--color-primary-light"),
        },
        teal: {
          DEFAULT: withOpacity("--color-teal"),
          light: withOpacity("--color-teal-light"),
          bright: withOpacity("--color-teal-bright"),
        },
        success: {
          DEFAULT: withOpacity("--color-success"),
          light: withOpacity("--color-success-light"),
        },
        warning: {
          DEFAULT: withOpacity("--color-warning"),
          light: withOpacity("--color-warning-light"),
        },
        alert: {
          DEFAULT: withOpacity("--color-alert"),
          light: withOpacity("--color-alert-light"),
        },
        surface: {
          DEFAULT: withOpacity("--color-surface"),
          card: withOpacity("--color-surface-card"),
        },
        text: {
          DEFAULT: withOpacity("--color-text"),
          muted: withOpacity("--color-text-muted"),
        },
        border: {
          DEFAULT: withOpacity("--color-border"),
        },
        disabled: {
          DEFAULT: withOpacity("--color-disabled"),
        },
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
        xs:    '0 1px 2px rgba(28, 40, 51, 0.05)',
        sm:    '0 1px 3px rgba(28, 40, 51, 0.06)',
        md:    '0 4px 12px rgba(28, 40, 51, 0.08)',
        lg:    '0 8px 24px rgba(28, 40, 51, 0.12)',
        inner: 'inset 0 2px 4px rgba(28, 40, 51, 0.04)',
      },
      // NOTE: `animate-fadeIn` / `animate-scaleIn` classes were already used
      // across ~8 existing components (modals, dropdowns) but were never
      // defined, so they were silent no-ops. Defining them here is a
      // pure visual fix — it only adds a transition that wasn't rendering
      // before; it cannot change any layout or behavior.
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 180ms ease-out',
        scaleIn: 'scaleIn 180ms ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
