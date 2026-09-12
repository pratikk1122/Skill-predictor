/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line tells Tailwind to scan your React files
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      colors: {
        'blue-greeny': '#5cbdb9',
        'blue-greeny-dark': '#4aa8a4',
        'pinky': '#fbe3e8',
        'teeny-greeny': '#ebf6f5',
        'text-dark': '#2d3748',
        'text-light': '#718096',
        'tech-black': '#090d16',
        'tech-slate': '#0f172a',
        'tech-surface': '#131b2e',
        'sky-accent': '#0ea5e9',
        'sky-glow': '#38bdf8',
        'cyber-teal': '#0d9488',
      },
      boxShadow: {
        'neo-black': '4px 4px 0px 0px #090d16',
        'neo-sky': '4px 4px 0px 0px #0ea5e9',
        'neo-teal': '4px 4px 0px 0px #0d9488',
        'neo-white': '4px 4px 0px 0px #ffffff',
        'neo-sm-black': '2px 2px 0px 0px #090d16',
        'neo-sm-sky': '2px 2px 0px 0px #0ea5e9',
      }
    },
  },
  plugins: [],
}