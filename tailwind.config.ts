import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem', // px-5
        md: '2rem',         // px-8
        lg: '3rem',         // px-12
      },
      screens: {
        sm: '100%',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        bg: {
          canvas: '#FFFFFF',
          subtle: '#FAF8F5',
          muted: '#F4F2EE',
        },
        border: {
          hairline: '#ECE8E1',
          DEFAULT: '#E2DDD3',
        },
        text: {
          primary: '#1A1714',
          secondary: '#5C554C',
          muted: '#8A8278',
        },
        accent: {
          saffron: '#E4A13B',
          ember: '#C75A1E',
          crimson: '#A8201A',
          magenta: '#9B2C5E',
          plum: '#5B2A4E',
        },
        state: {
          success: '#3E7A4E',
          danger: '#A8201A',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        eyebrow: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.14em' }],
        caption: ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.6' }],
        h3: ['1.25rem', { lineHeight: '1.25', letterSpacing: '-0.005em' }],
        h2: ['1.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        h1: ['2rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        display: ['2.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      spacing: {
        18: '4.5rem',
      },
      maxWidth: {
        'container-default': '1280px',
        'container-editorial': '1440px',
        'container-text': '64ch',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '6px',
        md: '6px',
        lg: '10px',
        xl: '16px',
      },
      boxShadow: {
        rest: '0 1px 2px rgba(15,15,15,0.04)',
        lift: '0 8px 30px rgba(15,15,15,0.06)',
        float: '0 18px 50px rgba(15,15,15,0.10)',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
        exit: 'cubic-bezier(0.4, 0, 1, 1)',
        settle: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        instant: '120ms',
        fast: '200ms',
        base: '320ms',
        slow: '560ms',
        cinematic: '900ms',
        settle: '1200ms',
      },
    },
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
  },
  plugins: [],
};

export default config;
