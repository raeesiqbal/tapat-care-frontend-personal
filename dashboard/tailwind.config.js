/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@tapat-care/design-tokens/tailwind-preset")],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../packages/ui-primitives/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
