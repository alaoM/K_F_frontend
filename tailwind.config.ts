/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
  keyframes: {
    marquee1: {
      "0%": { transform: "translateX(100%)" },
      "100%": { transform: "translateX(-100%)" },
    },
    marquee2: {
      "0%": { transform: "translateX(0%)" },
      "100%": { transform: "translateX(-200%)" },
    },
  },
  animation: {
    marquee1: "marquee1 50s linear infinite",
    marquee2: "marquee2 50s linear infinite",
  },
},
  },
  plugins: [],
}