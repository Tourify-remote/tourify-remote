/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        metro: { 
          red: '#E30513', 
          dark: '#141414', 
          gray: '#F5F6F7',
          blue: '#003f7f',
          'light-blue': '#0066cc',
          orange: '#ff6600'
        },
        // Keep existing metro colors for backward compatibility
        'metro-blue': '#003f7f',
        'metro-light-blue': '#0066cc',
        'metro-orange': '#ff6600',
        'metro-gray': '#666666'
      },
      fontFamily: { 
        sans: ['Inter','system-ui','sans-serif'] 
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}