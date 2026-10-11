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
        midnight: {
          deep: '#080D12',
          surface: '#0D151B',
          panel: '#121F25',
          border: '#1B2B30',
          hover: '#19282E',
          card: 'rgba(18, 31, 37, 0.75)',
        },
        mint: {
          highlight: '#D8FFE8',
          lime: '#B6FF5C',
          cyan: '#50E3C2',
          glow: 'rgba(182, 255, 92, 0.25)',
        },
        paper: {
          primary: '#F5F7F5',
          secondary: '#9BAEB0',
          muted: '#63777A',
        },
        status: {
          caution: '#FFCB70',
          risk: '#FF777F',
          success: '#50E3C2',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'mint-glow': '0 0 25px -5px rgba(182, 255, 92, 0.25)',
        'cyan-glow': '0 0 25px -5px rgba(80, 227, 194, 0.25)',
        'risk-glow': '0 0 25px -5px rgba(255, 119, 127, 0.25)',
        'panel': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
