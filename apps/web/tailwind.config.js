/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, refined color palette for pipe & cigar enthusiasts
        ember: {
          50: '#fef7ee',
          100: '#fdebd3',
          200: '#fad4a5',
          300: '#f6b66d',
          400: '#f18e32',
          500: '#ed710a',
          600: '#de5705',
          700: '#b83f08',
          800: '#93320e',
          900: '#772b0f',
        },
        tobacco: {
          50: '#faf8f3',
          100: '#f0ebe0',
          200: '#e1d5c0',
          300: '#cdb89a',
          400: '#b79876',
          500: '#a4825e',
          600: '#8b6d4f',
          700: '#705843',
          800: '#5e4a3a',
          900: '#504033',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in',
        'fade-out': 'fadeOut 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
