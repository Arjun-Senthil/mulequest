/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep midnight-blue backgrounds (Pokemon night map feel)
        void:  '#080d1a',
        panel: '#0e1628',
        raised:'#162038',
        edge:  '#1e3050',

        // Pokemon Type Palette — mapped to existing class names so all components auto-update
        neon: {
          cyan:   '#60a5fa',   // Water type   — bright sky blue
          violet: '#c084fc',   // Psychic type — vivid purple
          amber:  '#fcd34d',   // Electric type— Pikachu gold
          green:  '#4ade80',   // Grass type   — vibrant green
          red:    '#f87171',   // Fire type    — warm red
          pink:   '#f9a8d4',   // Fairy type   — pastel rose
        },

        // Extended Pokemon type colors for variety
        poke: {
          electric: '#fcd34d',
          fire:     '#fb923c',
          water:    '#60a5fa',
          grass:    '#4ade80',
          psychic:  '#f472b6',
          dragon:   '#818cf8',
          ice:      '#a5f3fc',
          ghost:    '#a78bfa',
          dark:     '#78716c',
          steel:    '#94a3b8',
          poison:   '#c084fc',
          fighting: '#ef4444',
          gold:     '#fbbf24',
          legendary:'#f0abfc',
        },

        // Surface grays with blue tint
        ink: {
          50:  '#e8edf8',
          100: '#c9d3ea',
          200: '#9aaac8',
          300: '#7082a8',
          400: '#506090',
          500: '#374868',
          600: '#263350',
          700: '#1a2440',
          800: '#111830',
          900: '#080d1a',
        }
      },

      fontFamily: {
        pixel:   ['"Press Start 2P"', 'monospace'],
        display: ['"Nunito"', '"Rajdhani"', 'system-ui', 'sans-serif'],
        body:    ['"Nunito"', '"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      boxShadow: {
        // Pokemon-card style glows
        'glow':        '0 0 20px rgba(96,165,250,0.30), 0 0 40px rgba(96,165,250,0.10)',
        'glow-amber':  '0 0 20px rgba(252,211,77,0.35), 0 0 40px rgba(252,211,77,0.12)',
        'glow-violet': '0 0 20px rgba(192,132,252,0.30), 0 0 40px rgba(192,132,252,0.10)',
        'glow-green':  '0 0 20px rgba(74,222,128,0.30), 0 0 40px rgba(74,222,128,0.10)',
        'glow-red':    '0 0 20px rgba(248,113,113,0.30), 0 0 40px rgba(248,113,113,0.10)',
        // 3D press button shadows
        'btn-yellow':  '0 5px 0 #b38600, 0 8px 16px rgba(252,211,77,0.25)',
        'btn-blue':    '0 5px 0 #1a4fa0, 0 8px 16px rgba(96,165,250,0.25)',
        'btn-red':     '0 5px 0 #991b1b, 0 8px 16px rgba(248,113,113,0.25)',
        'btn-green':   '0 5px 0 #166534, 0 8px 16px rgba(74,222,128,0.25)',
        // Card depth
        'card':        '0 4px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
        'card-hover':  '0 12px 24px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)',
      },

      keyframes: {
        // Soft pulse (existing)
        pulseline: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1' }
        },
        // Floating up and down (badges, icons)
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' }
        },
        // Pokemon sprite bounce
        bounce2: {
          '0%, 100%': { transform: 'translateY(0) scaleY(1)' },
          '40%':      { transform: 'translateY(-8px) scaleY(1.05)' },
          '60%':      { transform: 'translateY(-4px) scaleY(0.98)' },
        },
        // Shimmer / scan-line
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        // HP bar fill
        hpfill: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--hp-pct, 100%)' }
        },
        // Sparkle twinkle
        twinkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.5)' },
          '50%':      { opacity: '1', transform: 'scale(1.2)' },
        },
        // Slide in from bottom (toast)
        slideup: {
          '0%':   { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        // Gradient shift background
        gradshift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        // XP gain flash
        xpflash: {
          '0%':   { opacity: '0', transform: 'scale(0.5) translateY(0)' },
          '40%':  { opacity: '1', transform: 'scale(1.2) translateY(-10px)' },
          '100%': { opacity: '0', transform: 'scale(0.8) translateY(-30px)' },
        },
        // Wiggle on hover
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%':      { transform: 'rotate(3deg)' },
        }
      },

      animation: {
        pulseline: 'pulseline 2.4s ease-in-out infinite',
        float:     'float 3s ease-in-out infinite',
        bounce2:   'bounce2 0.6s ease-in-out',
        shimmer:   'shimmer 2.5s linear infinite',
        twinkle:   'twinkle 1.5s ease-in-out infinite',
        slideup:   'slideup 0.3s ease-out',
        gradshift: 'gradshift 4s ease infinite',
        xpflash:   'xpflash 1.2s ease-out forwards',
        wiggle:    'wiggle 0.3s ease-in-out',
      },

      backgroundSize: {
        '200': '200%',
      }
    }
  },
  plugins: []
}
