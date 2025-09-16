/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // primary: 'var(--colors-primary)',
        text: 'var(--colors-text)',
        label: 'var(--colors-label)',
        primary: '#2E90FF',
        'btn-primary': '#0056FF',
        scrollbar: 'var(--colors-scrollbar)',
        error: 'var(--colors-error)',
        line: 'var(--colors-line)',
        card: 'var(--colors-card)',
        card2: 'var(--colors-card2)',
        mask: 'var(--colors-mask)',
        footer: 'var(--colors-footer)',
        input: 'var(--colors-input)',
        tip: 'var(--colors-tip)',
        up: 'var(--colors-up)',
        down: 'var(--colors-down)'
      },
      keyframes: {
        beRotate: {
          '0%': {
            transform: 'rotate(0deg)'
          },
          '25%': {
            transform: 'rotate(90deg)'
          },
          '50%': {
            transform: 'rotate(180deg)'
          },
          '75%': {
            transform: 'rotate(270deg)'
          },
          '100%': {
            transform: 'rotate(360deg)'
          }
        },
        showIn: {
          '0%': {
            transform: 'translateX(100%)'
          },
          '100%': {
            transform: 'translateX(0)'
          }
        },
        showOut: {
          '0%': {
            transform: 'translateX(0)'
          },
          '100%': {
            transform: 'translateX(100%)'
          }
        }
      },
      animation: {
        refreshing: 'beRotate 1.5s linear infinite',
        xDrawerShow: 'showIn 0.3s',
        xDrawerHide: 'showOut 0.3s',
        // 'fade-in-up': 'fadeInUp 0.4s ease-out forwards'
      }
    },
    screens: {
      sm: '640px',
      // => @media (min-width: 640px) { ... }
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
  },
  plugins: []
}
