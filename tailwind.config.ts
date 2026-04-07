import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0D1117',
          900: '#161B25',
          800: '#1C2333',
          700: '#2D3748',
          400: '#8896A5',
          200: '#C8D3DF',
          50:  '#F0F3F7',
        },
        ember: {
          600: '#C4520A',
          500: '#E8630A',
          400: '#F07830',
          100: '#FFD4B0',
          50:  '#FFF0E6',
        },
        warm: {
          50:  '#FAFAF7',
          100: '#F4F4EF',
          200: '#EBEBE4',
          300: '#DCDCD4',
          400: '#B8B8AE',
          600: '#6B6B63',
          800: '#2E2E28',
          900: '#1A1A15',
        },
        status: {
          pending:         '#F59E0B',
          pending_bg:      '#FFFBEB',
          approved:        '#059669',
          approved_bg:     '#ECFDF5',
          rejected:        '#DC2626',
          rejected_bg:     '#FEF2F2',
          hod_approved:    '#E8630A',
          hod_approved_bg: '#FFF0E6',
          cancelled:       '#9CA3AF',
          cancelled_bg:    '#F9FAFB',
        },
        // Legacy compatibility mappings mapping to new design tokens
        accent: {
          DEFAULT: '#E8630A', // ember-500
          hover: '#C4520A',   // ember-600
        },
        brand: {
          900: '#0D1117', // ink-950
          500: '#8896A5', // ink-400
        },
        surface: {
          DEFAULT: '#FAFAF7', // warm-50
          card: '#F4F4EF',    // warm-100
          border: '#DCDCD4',  // warm-300
          muted: '#EBEBE4',   // warm-200
        },
        text: {
          primary: '#1A1A15', // warm-900
          secondary: '#6B6B63', // warm-600
          muted: '#B8B8AE',   // warm-400
        }
      },
      fontFamily: {
        sans:   ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif:  ['"DM Serif Display"', 'Georgia', 'serif'],
        mono:   ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        card:    '0 1px 4px rgba(13,17,23,0.06)',
        warm:    '0 2px 8px rgba(13,17,23,0.08)',
        ember:   '0 4px 14px rgba(232,99,10,0.25)',
        dropdown:'0 8px 24px rgba(13,17,23,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
