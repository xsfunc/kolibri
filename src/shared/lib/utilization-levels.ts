import { css } from "../../../styled-system/css";

export type UtilLevel = "safe" | "warning" | "danger";

export function getUtilLevel(pct: number): UtilLevel {
  if (pct <= 65) return "safe";
  if (pct <= 85) return "warning";
  return "danger";
}

export const levelStyles = {
  safe: css({ color: "token(colors.primary-fixed-dim)" }),
  warning: css({ color: "token(colors.tertiary-fixed-dim)" }),
  danger: css({ color: "token(colors.error)" }),
} as const;

export const levelColors: Record<UtilLevel, string> = {
  safe: "token(colors.primary-fixed-dim)",
  warning: "token(colors.tertiary-fixed-dim)",
  danger: "token(colors.error)",
};

export const levelOutlinedVariant: Record<
  UtilLevel,
  "outlined" | "outlined-warning" | "outlined-danger"
> = {
  safe: "outlined",
  warning: "outlined-warning",
  danger: "outlined-danger",
};
