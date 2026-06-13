/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#07090f',
        panel: '#0d1117',
        raised: '#131a24',
        edge: '#1f2a3a',
        neon: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          amber: '#fbbf24',
          green: '#34d399',
          red: '#f87171',
          pink: '#f472b6'
        },
        mule: '#00a0df'
      },
      fontFamily: {
        display: ['"Rajdhani"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 18px rgba(34, 211, 238, 0.25)',
        'glow-violet': '0 0 18px rgba(167, 139, 250, 0.25)',
        'glow-amber': '0 0 18px rgba(251, 191, 36, 0.25)'
      },
      keyframes: {
        pulseline: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 }
        }
      },
      animation: {
        pulseline: 'pulseline 2.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
