/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        header: ['"League Spartan"', 'sans-serif'],
        sub:    ['"Montserrat"', 'sans-serif'],
        body:   ['"Quicksand"', 'sans-serif'],
      },
      colors: {
        zine: {
          pink:    '#ec4899',
          fuchsia: '#d946ef',
          violet:  '#8b5cf6',
          rose:    '#f43f5e',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
}
