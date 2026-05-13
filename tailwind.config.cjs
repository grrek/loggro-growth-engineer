/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          'primary-text': 'var(--color-brand-primary-text)',
          secondary: 'var(--color-brand-secondary)',
          accent: 'var(--color-brand-accent)',
          ink: 'var(--color-brand-ink)',
        },
        arcade: {
          red: 'var(--arcade-red)',
          'red-bright': 'var(--arcade-red-bright)',
          blue: 'var(--arcade-blue)',
          'blue-bright': 'var(--arcade-blue-bright)',
          green: 'var(--arcade-green)',
          'green-bright': 'var(--arcade-green-bright)',
          yellow: 'var(--arcade-yellow)',
          'yellow-bright': 'var(--arcade-yellow-bright)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          alt: 'var(--color-surface-alt)',
          muted: 'var(--color-surface-muted)',
        },
        fg: {
          DEFAULT: 'var(--color-fg)',
          muted: 'var(--color-fg-muted)',
          subtle: 'var(--color-fg-subtle)',
        },
        line: 'var(--color-line)',
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Open Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s steps(2) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
