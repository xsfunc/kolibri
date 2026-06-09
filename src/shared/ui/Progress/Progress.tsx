import { Progress as BaseProgress } from "@base-ui/react/progress";
import { progressTrack } from "@/shared/ui/styles";
import { css, cva } from "styled-system/css";

interface ProgressProps {
  value: number;
  max?: number;
  level?: "safe" | "warning" | "danger";
  label?: string;
}

const indicatorVariant = cva({
  base: {
    height: "100%",
    borderRadius: "token(radii.full)",
    transition: "width 300ms ease",
  },
  variants: {
    level: {
      safe: {
        bg: "token(colors.primary-fixed-dim)",
        boxShadow: "0 0 8px rgba(0, 226, 144, 0.6)",
      },
      warning: {
        bg: "token(colors.tertiary-fixed-dim)",
        boxShadow: "0 0 8px rgba(228, 196, 81, 0.6)",
      },
      danger: {
        bg: "token(colors.error)",
        boxShadow: "0 0 8px rgba(255, 180, 171, 0.6)",
      },
    },
  },
});

export const Progress = ({ value, max = 100, level = "safe", label }: ProgressProps) => (
  <BaseProgress.Root value={value} max={max} data-level={level}>
    {label && (
      <BaseProgress.Label
        className={css({
          textStyle: "label-md",
          color: "token(colors.on-surface-variant)",
          marginBottom: "token(spacing.xs)",
        })}
      >
        {label}
      </BaseProgress.Label>
    )}
    <BaseProgress.Track className={progressTrack()}>
      <BaseProgress.Indicator
        className={indicatorVariant({ level })}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </BaseProgress.Track>
  </BaseProgress.Root>
);
