/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{tsx,css}'],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: [
        'Monaco',
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace'
      ]
    },
    container: {
      center: true,
      screens: {
        sm: '50rem'
      }
    },
    extend: {
      colors: {
        slate: {
          850: 'hsl(222deg 47% 16%)'
        },
        primary: '#B91C1C'
      },
      lineHeight: {
        '5.5': '1.375rem',
        '22' : '22px'
      },
      spacing: {
        '7.5': '1.875rem',  // Thêm gap-7.5 tương đương 30px (1.875rem)
        '15': '3.75rem',
      }
    }
  },
  plugins: []
};
