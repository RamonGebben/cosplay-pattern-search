const config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#5A4581',
          gold: '#F4A842',
          turquoise: '#4ECDC4',
        },
        background: {
          lightGrey: '#F8F8F8',
        },
        content: {
          white: '#FFFFFF',
        },
        text: {
          darkGrey: '#333333',
        },
        header: {
          black: '#000000',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Open Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
