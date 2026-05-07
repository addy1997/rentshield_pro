/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        'neone-red': '#FF4D4D',
        'neone-blue': '#00D1FF',
        'neone-yellow': '#FFD166',
        'neone-green': '#06D6A0',
        'neone-dark': '#1A1A1A',
      },
      boxShadow: {
        'neu': '4px 4px 0px 0px rgba(0,0,0,1)',
        'neu-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'neu-white': '4px 4px 0px 0px rgba(255,255,255,1)',
      }
    }
  },
  plugins: [],
};
