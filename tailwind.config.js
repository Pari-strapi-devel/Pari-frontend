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
        noto: ['var(--font-noto)'],
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
