/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#99b9ff',
          dark: '#7fa8ff',
        },
        dark: {
          DEFAULT: '#333333',
          lighter: '#575259',
          darker: '#111011',
        }
      },
      fontFamily: {
        mono: ['Roboto Mono', 'monospace'],
        sans: ['Quicksand', 'sans-serif'],
      },
      boxShadow: {
        'neomorphic': '5px 5px 20px #575259, -5px -5px 20px #111011',
        'neomorphic-hover': '-5px -5px 20px #111011, 5px 5px 10px #b2caff, 6px 6px 30px #99b9ff, -5px -5px 25px #111011',
        'neomorphic-inset': 'inset 2px 2px 5px #111011, inset -5px -5px 10px #575259',
        'neomorphic-active': 'inset 2px 2px 5px #111011, inset -5px -5px 10px #575259',
      },
      transitionDuration: {
        '400': '400ms',
      }
    },
  },
  plugins: [],
}
