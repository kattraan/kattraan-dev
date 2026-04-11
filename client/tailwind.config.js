/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'satoshi': ['Satoshi', 'sans-serif'],
      },
      colors: {
        primary: {
          dark: '#0a0a0a',
          green: '#0d1f14',
          purple: '#8b5cf6',
          pink: '#ec4899',
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0d1f14 0%, #1a0d1a 50%, #4c1d4d 100%)',
        'gradient-glow': 'radial-gradient(circle at 30% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
        'gradient-navbar': 'linear-gradient(to right, rgba(217, 217, 217, 0.28) 0%, rgba(217, 217, 217, 0.06) 100%)',
        'gradient-navbar-border': 'linear-gradient(to right, rgba(243, 243, 243, 0.95) 0%, rgba(255, 255, 255, 0.21) 26%, rgba(255, 255, 255, 0) 69%, rgba(255, 255, 255, 0.53) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(236, 72, 153, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
        'glow-sm': '0 0 10px rgba(236, 72, 153, 0.2)',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}

