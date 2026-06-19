/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          teal: '#128C7E',
          'teal-dark': '#075E54',
          green: '#25D366',
          light: '#34B7F1',
          'bg-gray': '#ECE5DD',
          'chat-gray': '#F0F2F5',
          'chat-green': '#E1F3D4',
        }
      }
    },
  },
  plugins: [],
}
