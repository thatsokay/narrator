const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: {
    content: ['./src/{**,}/*.tsx', './public/index.html'],
  },
  theme: {
    extend: {
      colors: {
        primary: '#cb443e',
        surface: {
          0: '#121212',
          1: '#1e1e1e',
          2: '#232323',
          3: '#252525',
          4: '#272727',
          6: '#2c2c2c',
          8: '#2e2e2e',
          12: '#333333',
          16: '#363636',
          24: '#383838',
        },
        grey: {
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      fontFamily: {
        sans: ['"PT Sans"', ...defaultTheme.fontFamily.sans],
        serif: ['"PT Serif Caption"', ...defaultTheme.fontFamily.serif],
        label: [
          '"PT Sans Caption"',
          '"PT Sans"',
          ...defaultTheme.fontFamily.sans,
        ],
      },
      borderRadius: {
        xs: '0.0625rem',
      },
    },
  },
  variants: {},
  plugins: [],
}
