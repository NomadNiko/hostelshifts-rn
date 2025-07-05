/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Oxanium_400Regular'],
        medium: ['Oxanium_500Medium'],
        semibold: ['Oxanium_600SemiBold'],
        bold: ['Oxanium_700Bold'],
      },
    },
  },
  plugins: [],
};
