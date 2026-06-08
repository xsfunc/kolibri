---
name: Kolibri
colors:
  surface: "#121414"
  surface-dim: "#121414"
  surface-bright: "#383939"
  surface-container-lowest: "#0d0f0f"
  surface-container-low: "#1a1c1c"
  surface-container: "#1e2020"
  surface-container-high: "#282a2a"
  surface-container-highest: "#333535"
  on-surface: "#e2e2e2"
  on-surface-variant: "#b9cbbd"
  inverse-surface: "#e2e2e2"
  inverse-on-surface: "#2f3131"
  outline: "#849588"
  outline-variant: "#3a4a3f"
  surface-tint: "#00e290"
  primary: "#f5fff5"
  on-primary: "#003920"
  primary-container: "#00ffa3"
  on-primary-container: "#007146"
  inverse-primary: "#006d43"
  secondary: "#b9f1ff"
  on-secondary: "#00363f"
  secondary-container: "#00e0ff"
  on-secondary-container: "#005f6d"
  tertiary: "#fffbff"
  on-tertiary: "#3b2f00"
  tertiary-container: "#ffdd67"
  on-tertiary-container: "#766000"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#52ffac"
  primary-fixed-dim: "#00e290"
  on-primary-fixed: "#002111"
  on-primary-fixed-variant: "#005231"
  secondary-fixed: "#a5eeff"
  secondary-fixed-dim: "#00daf8"
  on-secondary-fixed: "#001f25"
  on-secondary-fixed-variant: "#004e5a"
  tertiary-fixed: "#ffe17b"
  tertiary-fixed-dim: "#e4c451"
  on-tertiary-fixed: "#231b00"
  on-tertiary-fixed-variant: "#564500"
  background: "#121414"
  on-background: "#e2e2e2"
  surface-variant: "#333535"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: "700"
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: "500"
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: "600"
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 16px
  margin-desktop: 40px
  gutter: 16px
---

## Brand & Style

The design system is engineered to project a sense of institutional-grade security fused with the velocity of modern decentralized finance. It caters to a tech-savvy audience that values precision and transparency within the Tezos ecosystem.

The visual direction combines **High-Tech Minimalism** with **Glassmorphism**. This approach utilizes deep obsidian surfaces and vibrant phosphorescent accents to create a high-contrast, data-centric environment. The aesthetic is "technical-premium"—avoiding unnecessary ornamentation in favor of functional clarity and sophisticated depth. Every interaction should feel instantaneous and reliable, reinforcing the brand's position as a fast, secure gateway to liquidity.

## Colors

The palette is anchored in a **Dark Mode** foundation to reduce eye strain during prolonged financial monitoring and to emphasize the "high-tech" nature of the product.

- **Primary (Vibrant Green):** A high-visibility neon emerald used exclusively for primary actions, success states, and growth indicators. It should appear to "glow" against the dark background.
- **Secondary (Cyan):** Used for secondary data points, info links, or subtle UI accents to provide a cool-toned contrast to the green.
- **Neutrals:** A range of deep charcoals and pure blacks. The background is nearly black (#050505) to allow glassmorphism layers to pop, while surfaces use slightly lighter shades to establish hierarchy.
- **Semantic Colors:** Error states use a high-chroma red (#FF4B4B) to ensure critical warnings are never missed.

## Typography

The design system utilizes **Inter** for all typographic needs. Inter’s tall x-height and systematic design provide the legibility required for complex financial tables and balance readouts.

- **Scale:** Headlines use tight letter-spacing and semi-bold weights to appear "engineered."
- **Hierarchy:** Use `label-md` for metadata and section headers to create a rhythmic distinction between data labels and numerical values.
- **Numerics:** Since this is a DeFi app, ensure the use of tabular lining figures (monospaced numbers) where possible to prevent layout shifting when balances update in real-time.

## Layout & Spacing

This design system follows a strict **8px grid system** to ensure mathematical harmony across all components.

- **Mobile First:** The layout is primarily fluid within a 16px side margin. On mobile, cards typically span the full width minus margins.
- **Grid:** Use a 4-column grid for mobile and a 12-column grid for tablet/desktop views.
- **Rhythm:** Vertical spacing should be generous to allow the glassmorphism effects to "breathe." Use `lg` (24px) for section spacing and `md` (16px) for internal card padding.

## Elevation & Depth

Depth is achieved through a combination of **Glassmorphism** and **Subtle Outlines** rather than heavy shadows.

- **Layer 0 (Background):** Pure black or ultra-dark charcoal.
- **Layer 1 (Cards):** Semi-transparent surfaces (approx. 60% opacity) with a `16px` to `32px` backdrop-blur. Each card is finished with a `1px` solid border at 8% white opacity to define its edges against the dark background.
- **Layer 2 (Modals/Popovers):** Higher transparency (approx. 80% opacity) with a more pronounced white inner-stroke to simulate a closer physical proximity to the user.
- **Shadows:** Only used sparingly on floating action buttons (FABs) using a colored glow (#00FFA3 at 20% opacity) rather than a black shadow.

## Shapes

The shape language is "Soft-Tech." While the brand is professional, purely sharp corners are avoided to maintain a user-friendly and approachable feel.

- **Base Radius:** 8px for standard components like input fields and small buttons.
- **Large Radius:** 16px (rounded-lg) for main container cards.
- **Extreme Radius:** 24px (rounded-xl) for featured dashboard modules.
- **Interaction:** Buttons use the base radius to feel sturdy and intentional.

## Components

- **Buttons:** Primary buttons are solid `primary_color_hex` with black text for maximum contrast. Secondary buttons use a "ghost" style with the primary color outline and no fill.
- **Cards:** Defined by the glassmorphism rules. Use a subtle gradient (top-left to bottom-right) within the border to simulate a light source.
- **Inputs:** Darker than the card surface with a 1px border. On focus, the border transitions to the primary green with a subtle outer glow.
- **Chips/Badges:** Used for "LTV", "APY", or "Status." These use a desaturated version of the primary color with a low-opacity background for a "technical tag" look.
- **Data Rows:** Use thin dividers (1px, 5% white) and ensure numerical data is aligned to the right for easy scanning in lists.
- **Vault/Position Cards:** Specialized components that highlight the "Health Factor" using a progress bar that transitions from Red to Green.
