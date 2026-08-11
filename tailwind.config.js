/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        macaron: {
          bg: "#FAF7F2",       /* Soft warm creamy background - NO BLACK */
          card: "#FFFFFF",     /* Clean white container */
          border: "#F3EFEA",   /* Soft warm border */
          rose: "#FCE7F3",     /* Light macaron rose pink */
          roseText: "#9D174D", /* Dark rose text */
          roseAccent: "#F43F5E",
          lavender: "#F3E8FF", /* Soft delicate lavender */
          lavenderText: "#6B21A8",
          peach: "#FFF1F2",    /* Creamy blush peach */
          peachText: "#9F1239",
          mint: "#ECFDF5",     /* Soft mint */
          mintText: "#047857",
          sky: "#F0F9FF",      /* Soft sky blue */
          skyText: "#0369A1",
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(225, 29, 72, 0.05), 0 4px 15px -2px rgba(100, 116, 139, 0.04)',
        'rose-glow': '0 8px 25px -4px rgba(244, 63, 94, 0.15)',
      }
    },
  },
  plugins: [],
}
