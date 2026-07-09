/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@tapat-care/design-tokens/tailwind-preset")],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/ui-primitives/src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./containers/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./views/**/*.{js,ts,jsx,tsx,mdx}",
    "./widgets/**/*.{js,ts,jsx,tsx,mdx}",
    "./ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css,scss,js,ts,jsx,tsx,mdx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-from-center': 'slideFromCenter 1s ease-out forwards',
        'slide-from-bottom-left-jiggle': 'slideFromBottomLeftJiggle 1.2s ease-out forwards',
        'slide-to-center': 'slideToCenter 1s ease-out forwards',
        'slide-from-top-left': 'slideFromTopLeft 1s ease-out forwards',
        'slide-from-bottom-right': 'slideFromBottomRight 0.8s ease-out forwards',
        'fade-in-walter': 'fadeInWalter 1s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideFromCenter: {
          '0%': {
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: '0',
          },
          '30%': {
            opacity: '0.5',
          },
          '100%': {
            left: '97px',
            top: '106px',
            transform: 'translate(0, 0)',
            opacity: '1',
          },
        },
        slideFromBottomLeftJiggle: {
          '0%': {
            left: '100px',
            top: '320px',
            opacity: '0',
            transform: 'rotate(0deg)',
          },
          '30%': {
            opacity: '0.7',
          },
          '50%': {
            transform: 'rotate(-5deg)',
          },
          '60%': {
            transform: 'rotate(5deg)',
          },
          '70%': {
            transform: 'rotate(-3deg)',
          },
          '80%': {
            transform: 'rotate(3deg)',
          },
          '90%': {
            transform: 'rotate(-1deg)',
          },
          '100%': {
            left: '465px',
            top: '217px',
            opacity: '1',
            transform: 'rotate(0deg)',
          },
        },
        slideToCenter: {
          '0%': {
            left: '97px',
            top: '106px',
            transform: 'translate(0, 0) scale(0.9) rotate(0deg)',
            opacity: '0',
          },
          '40%': {
            opacity: '0.7',
          },
          '60%': {
            transform: 'translate(-50%, -50%) scale(1.05) rotate(-5deg)',
          },
          '70%': {
            transform: 'translate(-50%, -50%) scale(1.05) rotate(4deg)',
          },
          '80%': {
            transform: 'translate(-50%, -50%) scale(1.02) rotate(-2deg)',
          },
          '90%': {
            transform: 'translate(-50%, -50%) scale(1.01) rotate(1deg)',
          },
          '100%': {
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
            opacity: '1',
          },
        },
        slideFromTopLeft: {
          '0%': {
            transform: 'translate(-200px, -80px) scale(0.9) rotate(0deg)',
            opacity: '0',
          },
          '40%': {
            opacity: '0.7',
          },
          '60%': {
            transform: 'translate(-10px, -10px) scale(1.04) rotate(-4deg)',
            opacity: '0.9',
          },
          '70%': {
            transform: 'translate(-5px, -5px) scale(1.04) rotate(3deg)',
          },
          '80%': {
            transform: 'translate(-2px, -2px) scale(1.02) rotate(-2deg)',
          },
          '90%': {
            transform: 'translate(-1px, -1px) scale(1.01) rotate(1deg)',
          },
          '100%': {
            transform: 'translate(0, 0) scale(1) rotate(0deg)',
            opacity: '1',
          },
        },
        slideFromBottomRight: {
          '0%': {
            transform: 'translate(180px, 40px)',
            opacity: '0',
          },
          '40%': {
            transform: 'translate(100px, 20px)',
            opacity: '0.5',
          },
          '70%': {
            transform: 'translate(30px, 10px)',
            opacity: '0.8',
          },
          '100%': {
            transform: 'translate(0, 0)',
            opacity: '1',
          },
        },
        fadeInWalter: {
          '0%': {
            opacity: '0',
          },
          '50%': {
            opacity: '0.5',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}
