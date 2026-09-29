import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F4EEE8",
        "surface-1": "#ffffff",
        "surface-2": "#FAF6F1",
        "surface-3": "#F0E8DF",
        primary: {
          DEFAULT: "#059669",
          hover: "#047857",
          light: "#d1fae5",
          faint: "rgba(5, 150, 105, 0.08)",
        },
        terracotta: {
          DEFAULT: "#059669",
          hover: "#047857",
          light: "#ECFDF5",
        },
        ink: {
          DEFAULT: "#111827",
          muted: "#374151",
          subtle: "#6B7280",
        },
        hairline: {
          DEFAULT: "#EADFD5",
          strong: "#D8C9BC",
        },
        hot: "#dc2626",
        warm: "#d97706",
        cold: "#2563eb",
        success: "#059669",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        "4xl": "32px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "scale-in": "scaleIn 0.25s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "count-up": "countUp 0.8s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(5, 150, 105, 0.15)" },
          "50%": { boxShadow: "0 0 30px rgba(5, 150, 105, 0.3)" },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
