/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        noto: ['var(--font-noto-sans)', 'sans-serif'],
        'noto-devanagari': ['var(--font-noto-sans-devanagari)', 'sans-serif'],
        'noto-telugu': ['var(--font-noto-sans-telugu)', 'sans-serif'],
        'noto-tamil': ['var(--font-noto-sans-tamil)', 'sans-serif'],
        'noto-gujarati': ['var(--font-noto-sans-gujarati)', 'sans-serif'],
        'noto-oriya': ['var(--font-noto-sans-oriya)', 'sans-serif'],
        'noto-kannada': ['var(--font-noto-sans-kannada)', 'sans-serif'],
        'noto-gurmukhi': ['var(--font-noto-sans-gurmukhi)', 'sans-serif'],
        'noto-bengali': ['var(--font-noto-sans-bengali)', 'sans-serif'],
        'noto-malayalam': ['var(--font-noto-sans-malayalam)', 'sans-serif'],
      },
      colors: {
        grey3: 'var(--grey-300)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        red700: 'var(--red-700)',
        discreetText: 'var(--discreet-text)',
      },
      scale: {
        '102': '1.02',
        '108': '1.08',
        '109': '1.09',
      },
    },
  },
  plugins: [animate],
}

export default config;
