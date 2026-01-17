/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ika: {
          900: "#0b0f14",
          800: "#111720",
          700: "#18212c",
          600: "#1f2a38"
        },
        ink: {
          900: "#f2f4f7",
          700: "#c3c8d2",
          500: "#8c96a8"
        },
        accent: {
          600: "#e36b3a",
          500: "#e98a4f",
          400: "#f2a65a"
        },
        cool: {
          500: "#3a95a9",
          400: "#6bb6c5"
        },
        border: "rgba(242, 244, 247, 0.08)"
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        sans: ["Space Grotesk", "sans-serif"]
      },
      boxShadow: {
        card: "0 16px 32px rgba(0, 0, 0, 0.4)"
      }
    }
  },
  plugins: []
};
