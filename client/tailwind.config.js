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
          bg: '#dcf86f',
          dark: '#1c2331',
          muted: '#4a5568',
        },
      },
    },
  },
  plugins: [],
};
