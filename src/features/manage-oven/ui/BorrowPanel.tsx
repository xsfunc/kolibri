import { useUnit } from "effector-react";
import { Button } from "@/shared/ui/Button";
import {
  $borrowAmount,
  borrowAmountChanged,
  $borrowError,
  $borrowPending,
  borrowMaxClicked,
  borrowSubmitted,
  $currentUtilization,
  $borrowProjectedUtil,
} from "../model/model";
import { UtilizationPreview } from "./UtilizationPreview";
import { css } from "../../../../styled-system/css";

export const BorrowPanel = () => {
  const amount = useUnit($borrowAmount);
  const error = useUnit($borrowError);
  const pending = useUnit($borrowPending);
  const onAmountChange = useUnit(borrowAmountChanged);
  const onMax = useUnit(borrowMaxClicked);
  const onSubmit = useUnit(borrowSubmitted);
  const currentUtil = useUnit($currentUtilization);
  const projectedUtil = useUnit($borrowProjectedUtil);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.md)" })}
    >
      <div>
        <span
          className={css({
            display: "block",
            textStyle: "label-md",
            color: "token(colors.on-surface-variant)",
            marginBottom: "6px",
          })}
        >
          Amount
        </span>
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            bg: "token(colors.surface-container)",
            border: "1px solid token(colors.outline-variant)",
            borderRadius: "token(radii.md)",
            overflow: "hidden",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
            _focusWithin: {
              borderColor: "token(colors.surface-tint)",
              boxShadow: "0 0 0 1px token(colors.surface-tint)",
            },
          })}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            disabled={pending}
            className={css({
              bg: "transparent",
              border: "none",
              outline: "none",
              color: "token(colors.on-surface)",
              padding: "8px 12px",
              fontSize: "16px",
              lineHeight: "24px",
              width: "100%",
              _placeholder: { color: "token(colors.on-surface-variant)" },
              _disabled: { opacity: "0.5" },
            })}
          />
          <button
            type="button"
            onClick={() => onMax()}
            disabled={pending}
            className={css({
              padding: "2px 8px",
              borderRadius: "token(radii.full)",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "0.03em",
              transition: "all 150ms ease",
              bg: "rgba(0, 255, 163, 0.15)",
              color: "token(colors.primary-fixed-dim)",
              _hover: { bg: "rgba(0, 255, 163, 0.25)" },
              _active: { transform: "scale(0.93)" },
              _disabled: { opacity: "0.5", cursor: "not-allowed" },
            })}
          >
            MAX
          </button>
          <span
            className={css({
              padding: "0 10px",
              color: "token(colors.on-surface-variant)",
              textStyle: "body-sm",
              fontWeight: "600",
              flexShrink: "0",
            })}
          >
            kUSD
          </span>
        </div>
        <UtilizationPreview current={currentUtil} projected={projectedUtil} />
        {error && (
          <p
            className={css({
              textStyle: "body-sm",
              color: "token(colors.error)",
              marginTop: "6px",
              margin: "6px 0 0",
            })}
          >
            {error}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending || !amount} loading={pending}>
        Borrow
      </Button>
    </form>
  );
};
