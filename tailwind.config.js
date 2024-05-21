/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSmoothing: {
        antialiased: "antialiased",
        subpixel: "subpixel-antialiased",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".antialiased": {
          "-webkit-font-smoothing": "antialiased",
          "-moz-osx-font-smoothing": "grayscale",
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
