/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: "#8B9E7C",
          light: "#A8B89C",
          dark: "#6B7E5C",
        },
        peach: {
          DEFAULT: "#F4A574",
          light: "#F7BF9A",
          dark: "#E88B4E",
        },
        cream: {
          DEFAULT: "#FAF8F5",
          dark: "#F0ECE6",
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
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-lg": "0 4px 16px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
