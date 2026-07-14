/** @type {import('tailwindcss').Config} */
const preset = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--tapat-color-brand-primary)",
          hover: "var(--tapat-color-brand-primary-hover)",
        },
        pink: "var(--tapat-color-brand-pink)",
        black: "var(--tapat-color-black)",
        white: "var(--tapat-color-white)",
        charcoal: {
          900: "var(--tapat-color-charcoal-900)",
        },
        gray: {
          50: "var(--tapat-color-gray-50)",
          100: "var(--tapat-color-gray-100)",
          200: "var(--tapat-color-gray-200)",
          300: "var(--tapat-color-gray-300)",
          400: "var(--tapat-color-gray-400)",
          500: "var(--tapat-color-gray-500)",
          600: "var(--tapat-color-gray-600)",
          700: "var(--tapat-color-gray-700)",
          800: "var(--tapat-color-gray-800)",
          900: "var(--tapat-color-gray-900)",
          "100-alt": "var(--tapat-color-gray-100-alt)",
          "100-50": "var(--tapat-color-gray-100-50)",
        },
        violet: {
          50: "var(--tapat-color-violet-50)",
          100: "var(--tapat-color-violet-100)",
          400: "var(--tapat-color-violet-400)",
          "500-alt": "var(--tapat-color-violet-500-alt)",
        },
        lightPink: {
          10: "var(--tapat-color-violet-100)",
          DEFAULT: "var(--tapat-color-violet-100)",
        },
        purple: {
          600: "var(--tapat-color-brand-purple-600)",
          700: "var(--tapat-color-brand-purple-700)",
          800: "var(--tapat-color-brand-purple-800)",
        },
        deepPurple: {
          800: "var(--tapat-color-brand-deep-purple-800)",
          900: "var(--tapat-color-brand-deep-purple-900)",
        },
        orange: {
          500: "var(--tapat-color-brand-orange)",
        },
        emerald: {
          500: "var(--tapat-color-brand-emerald)",
        },
        green: {
          500: "var(--tapat-color-brand-green)",
        },
        dashboard: {
          bg: "var(--tapat-color-dashboard-bg)",
          panel: "var(--tapat-color-dashboard-panel)",
          ink: "var(--tapat-color-dashboard-ink)",
          muted: "var(--tapat-color-dashboard-muted)",
          line: "var(--tapat-color-dashboard-line)",
          accent: "var(--tapat-color-dashboard-accent)",
          "accent-ink": "var(--tapat-color-dashboard-accent-ink)",
        },
      },
      borderRadius: {
        xs: "var(--tapat-radius-xs)",
        sm: "var(--tapat-radius-sm)",
        md: "var(--tapat-radius-md)",
        lg: "var(--tapat-radius-lg)",
        xl: "var(--tapat-radius-xl)",
        pill: "var(--tapat-radius-pill)",
      },
      boxShadow: {
        card: "var(--tapat-shadow-card)",
        panel: "var(--tapat-shadow-panel)",
        float: "var(--tapat-shadow-float)",
      },
      fontFamily: {
        sans: ["var(--tapat-font-sans)"],
      },
      fontSize: {
        "heading-1": [
          "var(--tapat-font-size-heading-1)",
          {
            lineHeight: "var(--tapat-line-height-heading-1)",
            letterSpacing: "var(--tapat-letter-spacing-heading)",
            fontWeight: "var(--tapat-font-weight-heading)",
          },
        ],
        "heading-2": [
          "var(--tapat-font-size-heading-2)",
          {
            lineHeight: "var(--tapat-line-height-heading-2)",
            letterSpacing: "var(--tapat-letter-spacing-heading)",
            fontWeight: "var(--tapat-font-weight-heading)",
          },
        ],
        "heading-3": [
          "var(--tapat-font-size-heading-3)",
          {
            lineHeight: "var(--tapat-line-height-heading-3)",
            letterSpacing: "var(--tapat-letter-spacing-heading)",
            fontWeight: "var(--tapat-font-weight-heading)",
          },
        ],
        "heading-4": [
          "var(--tapat-font-size-heading-4)",
          {
            lineHeight: "var(--tapat-line-height-heading-4)",
            letterSpacing: "var(--tapat-letter-spacing-heading)",
            fontWeight: "var(--tapat-font-weight-heading)",
          },
        ],
        "heading-5": [
          "var(--tapat-font-size-heading-5)",
          {
            lineHeight: "var(--tapat-line-height-heading-5)",
            letterSpacing: "var(--tapat-letter-spacing-heading)",
            fontWeight: "var(--tapat-font-weight-heading)",
          },
        ],
      },
    },
  },
};

module.exports = preset;
