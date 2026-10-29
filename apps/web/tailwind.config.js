/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        sky: {
          bright: '#38bdf8',
          deep: '#0284c7',
        },
        cartoon: {
          yellow: '#facc15',
          gold: '#eab308',
          orange: '#fb923c',
          coral: '#f87171',
          crimson: '#dc2626',
          purple: '#a855f7',
          cyan: '#06b6d4',
          grass: '#84cc16',
          slate: '#1e293b',
          cloud: '#f8fafc',
        }
      },
      borderWidth: {
        '3': '3px',
        '6': '6px',
      },
      fontFamily: {
        sans: ['Fredoka', 'Nunito', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fredoka', 'Comic Sans MS', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'cartoon': '0 6px 0 0 rgba(0, 0, 0, 0.25)',
        'cartoon-sm': '0 3px 0 0 rgba(0, 0, 0, 0.2)',
        'cartoon-lg': '0 8px 0 0 rgba(0, 0, 0, 0.3)',
        'cartoon-pressed': '0 1px 0 0 rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'bob': 'bob 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
