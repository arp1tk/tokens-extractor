import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#87ed82',
      },
      fontFamily: {
        main: ['var(--main-font, Onest, sans-serif)'],
        body: ['var(--paragraph-font, Inter, sans-serif)'],
      },
      keyframes: {
        'shape-float-b': {
          from: { transform: 'translateY(-10px)' },
          to: { transform: 'translateY(8px)' },
        },
        'shape-float-c': {
          from: { transform: 'translateY(10px) rotate(2deg)' },
          to: { transform: 'translateY(-10px) rotate(-2deg)' },
        },
        'shape-float-d': {
          from: { transform: 'translateY(8px) rotate(-2deg)' },
          to: { transform: 'translateY(-9px) rotate(2deg)' },
        },
        'te-dot-bounce': {
          '0%, 80%, 100%': { transform: 'scale(0.5)', opacity: '0.35' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'shape-b9': 'shape-float-b 9s ease-in-out infinite alternate',
        'shape-b12': 'shape-float-b 12s ease-in-out infinite alternate',
        'shape-c10': 'shape-float-c 10s ease-in-out infinite alternate',
        'shape-d11': 'shape-float-d 11s ease-in-out infinite alternate',
        'te-dot': 'te-dot-bounce 1.2s infinite ease-in-out both',
      },
    },
  },
  plugins: [],
};

export default config;
