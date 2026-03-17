/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#3D5A3E",
          light: "#4A6B4B",
          dark: "#2E4530",
        },
        sage: {
          DEFAULT: "#8B9E7C",
          light: "#A8B89C",
          dark: "#6B7E5C",
        },
        cream: {
          DEFAULT: "#FAF8F5",
          dark: "#F0ECE6",
        },
        ivory: "#FFFDF8",
        gold: {
          DEFAULT: "#C4A76C",
          light: "#D4BE8E",
          dark: "#A88B4A",
        },
        dark: {
          DEFAULT: "#2D2D2D",
          light: "#4A4A4A",
        },
        rating: {
          clean: "#4CAF50",
          caution: "#FFC107",
          avoid: "#F44336",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.06)",
        "card-lg": "0 4px 16px rgba(0, 0, 0, 0.08)",
        soft: "0 1px 4px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
