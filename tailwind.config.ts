import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0a0a0f",
        "surface-1": "#111118",
        "surface-2": "#1a1a24",
        "surface-3": "#222230",
        primary: {
          DEFAULT: "#0f766e",
          hover: "#14b8a6",
          light: "#99f6e4",
          faint: "#0f766e20",
        },
        ink: {
          DEFAULT: "#f0f0f5",
          muted: "#a0a0b0",
          subtle: "#606070",
        },
        hairline: {
          DEFAULT: "#2a2a38",
          strong: "#3a3a4a",
        },
        hot: "#ef4444",
        warm: "#f59e0b",
        cold: "#6366f1",
        success: "#22c55e",
      },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "count-up": "countUp 1s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(15, 118, 110, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(15, 118, 110, 0.6)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
