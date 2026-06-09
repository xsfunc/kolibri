import { css } from "../../../../styled-system/css";
import { levelStyles, getUtilLevel } from "@/shared/lib/utilization-levels";

interface UtilizationPreviewProps {
  current: number;
  projected: number | null;
}

export const UtilizationPreview = ({ current, projected }: UtilizationPreviewProps) => {
  const displayProjected = projected !== null ? Math.min(100, projected) : null;

  return (
    <div
      className={css({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "6px",
      })}
    >
      <span className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}>
        Utilization
      </span>
      <span
        className={css({
          textStyle: "body-sm",
          fontWeight: "700",
          fontVariantNumeric: "tabular-nums",
        })}
      >
        <span className={levelStyles[getUtilLevel(current)]}>{current.toFixed(2)}%</span>
        {displayProjected !== null && (
          <>
            {" → "}
            <span className={levelStyles[getUtilLevel(displayProjected)]}>
              {displayProjected.toFixed(2)}%
            </span>
          </>
        )}
      </span>
    </div>
  );
};
