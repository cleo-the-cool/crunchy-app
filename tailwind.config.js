/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        sage: "#8B9E7C",
        peach: "#F4A574",
        cream: "#FAF8F5",
        dark: "#2D2D2D",
      },
    },
  },
  plugins: [],
};
