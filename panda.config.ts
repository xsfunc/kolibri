import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],

  theme: {
    extend: {
      breakpoints: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      tokens: {
        colors: {
          surface: { value: "#121414" },
          "surface-dim": { value: "#121414" },
          "surface-bright": { value: "#383939" },
          "surface-container-lowest": { value: "#0d0f0f" },
          "surface-container-low": { value: "#1a1c1c" },
          "surface-container": { value: "#1e2020" },
          "surface-container-high": { value: "#282a2a" },
          "surface-container-highest": { value: "#333535" },
          "on-surface": { value: "#e2e2e2" },
          "on-surface-variant": { value: "#b9cbbd" },
          "inverse-surface": { value: "#e2e2e2" },
          "inverse-on-surface": { value: "#2f3131" },
          outline: { value: "#849588" },
          "outline-variant": { value: "#3a4a3f" },
          "surface-tint": { value: "#00e290" },
          primary: { value: "#f5fff5" },
          "on-primary": { value: "#003920" },
          "primary-container": { value: "#00ffa3" },
          "on-primary-container": { value: "#007146" },
          "inverse-primary": { value: "#006d43" },
          secondary: { value: "#b9f1ff" },
          "on-secondary": { value: "#00363f" },
          "secondary-container": { value: "#00e0ff" },
          "on-secondary-container": { value: "#005f6d" },
          tertiary: { value: "#fffbff" },
          "on-tertiary": { value: "#3b2f00" },
          "tertiary-container": { value: "#ffdd67" },
          "on-tertiary-container": { value: "#766000" },
          error: { value: "#ffb4ab" },
          "on-error": { value: "#690005" },
          "error-container": { value: "#93000a" },
          "on-error-container": { value: "#ffdad6" },
          "primary-fixed": { value: "#52ffac" },
          "primary-fixed-dim": { value: "#00e290" },
          "on-primary-fixed": { value: "#002111" },
          "on-primary-fixed-variant": { value: "#005231" },
          "secondary-fixed": { value: "#a5eeff" },
          "secondary-fixed-dim": { value: "#00daf8" },
          "on-secondary-fixed": { value: "#001f25" },
          "on-secondary-fixed-variant": { value: "#004e5a" },
          "tertiary-fixed": { value: "#ffe17b" },
          "tertiary-fixed-dim": { value: "#e4c451" },
          "on-tertiary-fixed": { value: "#231b00" },
          "on-tertiary-fixed-variant": { value: "#564500" },
          background: { value: "#121414" },
          "on-background": { value: "#e2e2e2" },
          "surface-variant": { value: "#333535" },
        },
        fonts: {
          sans: {
            value:
              "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          },
          mono: {
            value:
              "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          },
        },
        radii: {
          sm: { value: "4px" },
          DEFAULT: { value: "8px" },
          md: { value: "12px" },
          lg: { value: "16px" },
          xl: { value: "24px" },
          full: { value: "9999px" },
        },
        spacing: {
          xs: { value: "4px" },
          sm: { value: "12px" },
          md: { value: "16px" },
          lg: { value: "24px" },
          xl: { value: "32px" },
          "margin-mobile": { value: "16px" },
          "margin-desktop": { value: "40px" },
          gutter: { value: "16px" },
        },
        shadows: {
          "card-glow": {
            value: "0 0 24px rgba(0, 255, 163, 0.12), 0 4px 16px rgba(0, 0, 0, 0.3)",
          },
          "dialog-glow": {
            value: "0 0 40px rgba(0, 255, 163, 0.08), 0 12px 48px rgba(0, 0, 0, 0.5)",
          },
          "fab-glow": {
            value: "0 0 20px rgba(0, 255, 163, 0.2)",
          },
        },
      },
      semanticTokens: {
        colors: {
          collateral: {
            safe: { value: "{colors.primary-container}" },
            warning: { value: "{colors.tertiary-container}" },
            danger: { value: "{colors.error}" },
          },
        },
      },
      textStyles: {
        "display-lg": {
          value: {
            fontFamily: "sans",
            fontSize: "40px",
            fontWeight: "700",
            lineHeight: "48px",
            letterSpacing: "-0.02em",
          },
        },
        "headline-lg": {
          value: {
            fontFamily: "sans",
            fontSize: "32px",
            fontWeight: "600",
            lineHeight: "40px",
            letterSpacing: "-0.01em",
          },
        },
        "headline-md": {
          value: {
            fontFamily: "sans",
            fontSize: "24px",
            fontWeight: "600",
            lineHeight: "32px",
          },
        },
        "headline-sm": {
          value: {
            fontFamily: "sans",
            fontSize: "20px",
            fontWeight: "600",
            lineHeight: "28px",
          },
        },
        "body-lg": {
          value: {
            fontFamily: "sans",
            fontSize: "18px",
            fontWeight: "400",
            lineHeight: "28px",
          },
        },
        "body-md": {
          value: {
            fontFamily: "sans",
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "24px",
          },
        },
        "body-sm": {
          value: {
            fontFamily: "sans",
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "20px",
          },
        },
        "label-md": {
          value: {
            fontFamily: "sans",
            fontSize: "12px",
            fontWeight: "600",
            lineHeight: "16px",
            letterSpacing: "0.05em",
          },
        },
        "label-sm": {
          value: {
            fontFamily: "sans",
            fontSize: "10px",
            fontWeight: "500",
            lineHeight: "14px",
          },
        },
      },
    },
  },

  outdir: "styled-system",
  globalCss: {
    ":root": {
      "--global-font-body": "var(--fonts-sans)",
      "--global-font-mono": "var(--fonts-mono)",
    },
    "@keyframes skeleton-pulse": {
      "0%, 100%": { opacity: "1" },
      "50%": { opacity: "0.4" },
    },
  },
});
