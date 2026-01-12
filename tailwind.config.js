import { colors } from './theme.js';

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
      colors
    }
  },
  plugins: [],
}
