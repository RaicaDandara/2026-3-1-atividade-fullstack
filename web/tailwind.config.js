/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        diatinf: {
          primary: '#CE701B',
          orange: '#F1881D',
          yellow: '#FDC616',
          cream: '#F9EBC2',
          'blue-light': '#A4BCCC',
          'blue-dark': '#0C3453',
        }
      }
    },
  },
  plugins: [],
}

