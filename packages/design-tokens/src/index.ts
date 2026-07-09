export const tapatColors = {
  brand: {
    primary: "#a36eff",
    primaryHover: "#6d28d9",
    pink: "#ec4899",
    orange: "#f97316",
    emerald: "#10b981",
    green: "#22c55e",
  },
  neutral: {
    white: "#ffffff",
    black: "#000000",
    gray50: "#f9fafb",
    gray100: "#f3f4f9",
    gray200: "#e5e7eb",
    gray300: "#d1d5db",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray600: "#4b5563",
    gray700: "#374151",
    gray800: "#1f2937",
    gray900: "#111827",
  },
  dashboard: {
    background: "#f4f6fb",
    panel: "#ffffff",
    ink: "#11213a",
    muted: "#5f6e86",
    line: "#d8deea",
    accent: "#7c3aed",
    accentInk: "#f5f3ff",
  },
} as const;

export const tapatRadii = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  pill: "999px",
} as const;

export const tapatShadows = {
  card:
    "0px 1.4px 1.3px 0px rgb(91 91 91 / 15%), 0px 16px 40px 0px rgb(0 0 0 / 2%), 0px 8px 8px 0px rgb(78 78 78 / 4%)",
  panel: "0 18px 48px rgb(17 24 39 / 8%)",
} as const;

export const tapatFonts = {
  sans:
    '"Graphik Trial", "Segoe UI", "Helvetica Neue", Arial, ui-sans-serif, system-ui, sans-serif',
} as const;
