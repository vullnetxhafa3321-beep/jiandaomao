/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        title: ['"ZCOOL KuaiLe"', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#eae3d3',
          dark: '#4a3f35',
          muted: '#a2a8a4',
          wood: '#c2a88d',
          green: '#8cb866',
          border: '#5a4e45',
        },
      },
    },
  },
  plugins: [],
};
