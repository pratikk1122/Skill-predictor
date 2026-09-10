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
      }
    },
  },
  plugins: [],
}