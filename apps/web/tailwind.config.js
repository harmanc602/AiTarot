import { colors, fonts } from '../../packages/core/src/tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: colors.black,
        'deep-purple': colors.deepPurple,
        'dark-purple': colors.darkPurple,
        white: colors.white,
        gold: colors.gold,
        'midnight-blue': colors.midnightBlue,
        lavender: colors.lavender,
        'electric-blue': colors.electricBlue,
      },
      fontFamily: {
        display: [fonts.display, 'serif'],
        serif: [fonts.serif, 'serif'],
        sans: [fonts.sans, 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: `0 0 20px ${colors.lavender}, 0 0 40px ${colors.electricBlue}`,
      },
    },
  },
  plugins: [],
};
