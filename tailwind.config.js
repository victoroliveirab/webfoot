/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        w3c: {
          blue: "blue",
          darkblue: "darkblue",
          darkgreen: "darkgreen",
          dodgerblue: "dodgerblue",
          gray: "gray",
          green: "green",
          lightgray: "lightgray",
          lightsteelblue: "lightsteelblue",
          limegreen: "limegreen",
          red: "red",
          yellow: "yellow",
        },
      },
      fontSize: {
        xxs: ["0.5rem", "0.75rem"],
      },
    },
  },
  plugins: [],
};
