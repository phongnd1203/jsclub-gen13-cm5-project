/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/views/**/*.ejs"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
