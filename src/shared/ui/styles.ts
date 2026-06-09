import { cva } from "styled-system/css";

export const button = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    fontWeight: "600",
    borderRadius: "token(radii.full)",
    transition: "all 150ms ease",
    cursor: "pointer",
    outline: "none",
    _focusVisible: {
      boxShadow: "0 0 0 2px token(colors.surface-tint)",
    },
    _disabled: {
      opacity: "0.5",
      cursor: "not-allowed",
    },
  },
  variants: {
    variant: {
      primary: {
        bg: "token(colors.primary-container)",
        color: "token(colors.on-primary)",
        _hover: { opacity: "0.85" },
        _active: { transform: "scale(0.95)" },
      },
      ghost: {
        bg: "rgba(0, 255, 163, 0.08)",
        border: "1px solid token(colors.primary-container)",
        color: "token(colors.primary-container)",
        _hover: { bg: "rgba(0, 255, 163, 0.15)" },
        _active: { transform: "scale(0.95)" },
      },
      danger: {
        bg: "token(colors.error-container)",
        color: "token(colors.on-error-container)",
        _hover: { opacity: "0.9" },
        _active: { transform: "scale(0.95)" },
      },
      outlined: {
        bg: "transparent",
        border: "1px solid",
        borderColor: "token(colors.primary-fixed-dim)",
        color: "token(colors.primary-fixed-dim)",
        _hover: { bg: "rgba(0, 226, 144, 0.05)" },
        _active: { transform: "scale(0.95)" },
      },
      "outlined-warning": {
        bg: "transparent",
        border: "1px solid",
        borderColor: "token(colors.tertiary-fixed-dim)",
        color: "token(colors.tertiary-fixed-dim)",
        _hover: { bg: "rgba(228, 196, 81, 0.05)" },
        _active: { transform: "scale(0.95)" },
      },
      "outlined-danger": {
        bg: "transparent",
        border: "1px solid",
        borderColor: "token(colors.error)",
        color: "token(colors.error)",
        _hover: { bg: "rgba(255, 180, 171, 0.05)" },
        _active: { transform: "scale(0.95)" },
      },
      icon: {
        bg: "transparent",
        border: "none",
        color: "token(colors.on-surface-variant)",
        px: "0",
        _hover: { bg: "rgba(255, 255, 255, 0.08)", color: "token(colors.on-surface)" },
        _active: { transform: "scale(0.95)" },
      },
    },
    size: {
      sm: { px: "3", py: "1.5", fontSize: "13px" },
      md: { px: "4", py: "2", fontSize: "14px" },
      lg: { px: "5", py: "2.5", fontSize: "16px" },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
  compoundVariants: [
    { variant: "icon", size: "sm", css: { width: "28px", height: "28px", px: "0" } },
    { variant: "icon", size: "md", css: { width: "36px", height: "36px", px: "0" } },
    { variant: "icon", size: "lg", css: { width: "44px", height: "44px", px: "0" } },
  ],
});

export const card = cva({
  base: {
    bg: "rgba(30, 32, 32, 0.6)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "token(radii.lg)",
    padding: "token(spacing.md)",
    display: "flex",
    flexDirection: "column",
    gap: "token(spacing.xs)",
  },
  variants: {
    interactive: {
      true: {
        transition: "all 200ms ease",
        cursor: "pointer",
        _hover: {
          bg: "rgba(40, 42, 42, 0.7)",
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    interactive: false,
  },
});

export const input = cva({
  base: {
    bg: "token(colors.surface-container)",
    border: "1px solid token(colors.outline-variant)",
    borderRadius: "token(radii.md)",
    color: "token(colors.on-surface)",
    padding: "8px 12px",
    fontSize: "16px",
    lineHeight: "24px",
    outline: "none",
    width: "100%",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    _focus: {
      borderColor: "token(colors.surface-tint)",
      boxShadow: "0 0 0 1px token(colors.surface-tint)",
    },
    _placeholder: {
      color: "token(colors.on-surface-variant)",
    },
  },
});

export const skeleton = cva({
  base: {
    bg: "rgba(255, 255, 255, 0.06)",
    borderRadius: "token(radii.DEFAULT)",
    animation: "skeleton-pulse 1.5s ease-in-out infinite",
  },
  variants: {
    shape: {
      inline: { borderRadius: "token(radii.sm)", _before: { content: '"\\00a0"' } },
      text: { height: "14px", width: "60%" },
      heading: { height: "22px", width: "40%" },
      circle: { borderRadius: "token(radii.full)", width: "40px", height: "40px" },
      block: { height: "48px", width: "100%" },
    },
  },
  defaultVariants: {
    shape: "text",
  },
});

export const chip = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "token(radii.full)",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.05em",
  },
  variants: {
    color: {
      primary: {
        bg: "rgba(0, 255, 163, 0.12)",
        color: "token(colors.primary-container)",
      },
      error: {
        bg: "rgba(255, 180, 171, 0.12)",
        color: "token(colors.error)",
      },
      warning: {
        bg: "rgba(255, 221, 103, 0.12)",
        color: "token(colors.tertiary-container)",
      },
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

export const progressTrack = cva({
  base: {
    bg: "token(colors.surface-container-highest)",
    borderRadius: "token(radii.full)",
    overflow: "hidden",
    height: "4px",
    width: "100%",
  },
});

export const radioCard = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "token(spacing.sm)",
    bg: "token(colors.surface-container)",
    border: "1px solid token(colors.outline-variant)",
    borderRadius: "token(radii.md)",
    padding: "token(spacing.sm)",
    cursor: "pointer",
    outline: "none",
    transition: "all 150ms ease",
    _hover: {
      bg: "token(colors.surface-container-high)",
    },
    _focusVisible: {
      boxShadow: "0 0 0 2px token(colors.surface-tint)",
    },
    "&[data-checked]": {
      borderColor: "token(colors.primary-container)",
      bg: "rgba(0, 255, 163, 0.06)",
    },
  },
});

export const dialogBackdrop = cva({
  base: {
    position: "fixed",
    inset: "0",
    bg: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(8px)",
    zIndex: "999",
    transition: "opacity 200ms ease",
  },
});

export const dialogPopup = cva({
  base: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bg: "rgba(40, 42, 42, 0.85)",
    backdropFilter: "blur(32px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "token(radii.lg)",
    padding: "token(spacing.lg)",
    minWidth: "360px",
    maxWidth: "480px",
    width: "100%",
    zIndex: "1000",
    boxShadow: "token(shadows.dialog-glow)",
  },
});
