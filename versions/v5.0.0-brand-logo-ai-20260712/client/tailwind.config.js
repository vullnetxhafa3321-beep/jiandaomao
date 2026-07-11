/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        title: ['Fredoka', '"ZCOOL KuaiLe"', 'sans-serif'],
        body: ['Nunito', 'PingFang SC', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#F7EFE4',
          dark: '#2C241C',
          muted: '#8A7E72',
          wood: '#D4C0A8',
          green: '#C7C48C',
          border: '#2C241C',
          sky: '#2E5BFF',
          sea: '#70B8E8',
          red: '#E23D3D',
          yellow: '#F5D76E',
        },
      },
      boxShadow: {
        block: '4px 4px 0 rgba(44, 36, 28, 0.18)',
        'block-sm': '3px 3px 0 rgba(44, 36, 28, 0.16)',
        sign: '0 4px 0 #B82A2A',
      },
    },
  },
  plugins: [],
};
