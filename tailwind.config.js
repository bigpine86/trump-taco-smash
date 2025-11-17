/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      animation: {
        'wave-spread': 'wave-spread 0.5s ease-out',
      },
      keyframes: {
        'wave-spread': {
          '0%': { transform: 'scale(0.5)', opacity: '0.8' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
