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
        plum: {
          light: '#8B4D7E',
          DEFAULT: '#6B2D5E',
          dark: '#4B1D3E',
        },
        lavender: {
          light: '#E4DBE9',
          DEFAULT: '#C4B5D4',
          dark: '#9B8AAB',
        },
        rose: {
          light: '#F08DA0',
          DEFAULT: '#E85D75',
          dark: '#D03D55',
        },
        cream: '#FAF8F5',
        gray: {
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
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
