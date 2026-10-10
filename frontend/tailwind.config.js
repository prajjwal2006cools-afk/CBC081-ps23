/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        agro: {
          forest: "#14532D",
          leaf: "#22C55E",
          deep: "#0B1F17",
          soft: "#F7FAF5",
          card: "#FFFFFF",
          text: "#17251C",
          muted: "#647067",
          lime: "#BEF264",
          border: "#E2E8E0",
        },
        leaf: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "sans-serif"],
        heading: ['"Outfit"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
