/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './blocks/**/*.{js,html}',
    './scripts/**/*.js',
    './head.html',
    './nav.html',
    './footer.html',
    './404.html',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#D91100',
          600: '#D91100',
          700: '#ae0d00',
          800: '#830a00',
          900: '#580700'
        }
      }
    }
  },
  plugins: [],
}
