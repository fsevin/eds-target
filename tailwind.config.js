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
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
        'brand-gradient-light': 'linear-gradient(135deg, #fca5a5 0%, #f87171 50%, #ef4444 100%)',
        'brand-gradient-dark': 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)'
      }
    }
  },
  plugins: [],
}
