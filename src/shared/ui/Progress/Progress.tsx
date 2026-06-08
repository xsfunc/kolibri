import { Progress as BaseProgress } from "@base-ui/react/progress";
import { progressTrack } from "@/shared/ui/styles";
import { css } from "../../../../styled-system/css";

interface ProgressProps {
  value: number;
  max?: number;
  level?: "safe" | "warning" | "danger";
  label?: string;
}

const indicatorColors = {
  safe: "token(colors.primary-container)",
  warning: "token(colors.tertiary-container)",
  danger: "token(colors.error)",
};

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
        className={css({
          height: "100%",
          borderRadius: "token(radii.full)",
          transition: "width 300ms ease",
          bg: indicatorColors[level],
        })}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </BaseProgress.Track>
  </BaseProgress.Root>
);
