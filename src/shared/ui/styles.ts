import { cva } from "../../../styled-system/css";

export const button = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    fontWeight: "600",
    borderRadius: "token(radii.DEFAULT)",
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
        _hover: { bg: "token(colors.primary-fixed)" },
      },
      ghost: {
        bg: "transparent",
        border: "1px solid token(colors.primary-container)",
        color: "token(colors.primary-container)",
        _hover: { bg: "rgba(0, 255, 163, 0.08)" },
      },
      danger: {
        bg: "token(colors.error-container)",
        color: "token(colors.on-error-container)",
        _hover: { opacity: "0.9" },
      },
    },
    size: {
      sm: { h: "32px", px: "3", fontSize: "14px" },
      md: { h: "40px", px: "4", fontSize: "16px" },
      lg: { h: "48px", px: "6", fontSize: "18px" },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
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
    gap: "token(spacing.sm)",
    transition: "all 200ms ease",
    _hover: {
      bg: "rgba(40, 42, 42, 0.7)",
    },
  },
});

export const input = cva({
  base: {
    bg: "token(colors.surface-container)",
    border: "1px solid token(colors.outline-variant)",
    borderRadius: "token(radii.DEFAULT)",
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
    height: "8px",
    width: "100%",
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
