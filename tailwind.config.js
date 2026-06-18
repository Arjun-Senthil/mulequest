/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm dark slate backgrounds
        void:  '#0c0b09',
        panel: '#131210',
        raised:'#1a1815',
        edge:  '#2a2620',

        // Soft warm accent palette
        neon: {
          cyan:   '#5eead4',   // soft teal
          violet: '#c4b5fd',   // soft lavender
          amber:  '#fbbf24',   // warm amber (primary)
          green:  '#86efac',   // soft mint
          red:    '#fca5a5',   // soft coral
          pink:   '#f9a8d4',   // soft rose
        },

        // Warm ink — cream-tinted text grays
        ink: {
          50:  '#faf8f5',
          100: '#f0ece5',
          200: '#d6cfc6',
          300: '#b5ada2',
          400: '#8a8178',
          500: '#635b52',
          600: '#4a4340',
          700: '#302c28',
          800: '#1e1b18',
          900: '#0c0b09',
        },
      },

      fontFamily: {
        display: ['"Nunito"', 'system-ui', 'sans-serif'],
        body:    ['"Inter"', '"Nunito"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      boxShadow: {
        'sm-warm':    '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'md-warm':    '0 4px 6px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.2)',
        'lg-warm':    '0 10px 20px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25)',
        'glow-amber': '0 0 16px rgba(251,191,36,0.25), 0 0 32px rgba(251,191,36,0.10)',
        'glow-teal':  '0 0 16px rgba(94,234,212,0.20), 0 0 32px rgba(94,234,212,0.08)',
        'btn-amber':  '0 4px 0 #78350f, 0 6px 14px rgba(251,191,36,0.20)',
        'btn-ghost':  '0 3px 0 rgba(0,0,0,0.4)',
        'btn-red':    '0 4px 0 #7f1d1d, 0 6px 14px rgba(252,165,165,0.15)',
        'card':       '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'card-hover': '0 8px 20px rgba(0,0,0,0.45), 0 3px 6px rgba(0,0,0,0.25)',
      },

      keyframes: {
        fadein: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideup: {
          '0%':   { opacity: '0', transform: 'translateX(-50%) translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        pulse_soft: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        bounce2: {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%':      { transform: 'translateY(-5px)' },
          '60%':      { transform: 'translateY(-2px)' },
        },
        gradshift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },

      animation: {
        fadein:     'fadein 0.25s ease-out',
        slideup:    'slideup 0.28s ease-out',
        shimmer:    'shimmer 2.8s linear infinite',
        float:      'float 3s ease-in-out infinite',
        pulse_soft: 'pulse_soft 2s ease-in-out infinite',
        bounce2:    'bounce2 0.5s ease-in-out',
        gradshift:  'gradshift 5s ease infinite',
      },

      backgroundSize: {
        '200': '200%',
      },
    }
  },
  plugins: []
}
