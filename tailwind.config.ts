import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'DM Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: "#f0f9e8",
          500: "#8BC34A",
          600: "#7cb342",
        },
        sidebar: {
          DEFAULT: "#1e2a47",
          active: "#2c3e6b",
        },
        success: {
          50: "#f0fdf4",
          600: "#16a34a",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          600: "#dc2626",
        },
        info: {
          500: "#3b82f6",
        },
      },
      fontSize: {
        "kpi-value": ["28px", { lineHeight: "1.2", fontWeight: "700" }],
        "stat-value": ["22px", { lineHeight: "1.2", fontWeight: "700" }],
        "focus-count": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        "funnel-value": ["20px", { lineHeight: "1.2", fontWeight: "700" }],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        pill: "10px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.1)",
        lg: "0 2px 8px rgba(0,0,0,0.1)",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-2px)" },
          "40%": { transform: "translateX(2px)" },
          "60%": { transform: "translateX(-2px)" },
          "80%": { transform: "translateX(2px)" },
        },
        "slide-out": {
          "0%": { transform: "translateX(0)", opacity: "1", maxHeight: "100px" },
          "50%": { transform: "translateX(-100%)", opacity: "0", maxHeight: "100px" },
          "100%": { transform: "translateX(-100%)", opacity: "0", maxHeight: "0" },
        },
        "check-pop": {
          "0%": { transform: "scale(0.8)" },
          "100%": { transform: "scale(1)" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shake: "shake 200ms ease-in-out",
        "slide-out": "slide-out 300ms ease-in-out forwards",
        "check-pop": "check-pop 150ms ease-out",
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
