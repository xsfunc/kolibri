import { useUnit } from "effector-react";
import { Button } from "@/shared/ui/Button";
import {
  $depositAmount,
  depositAmountChanged,
  $depositError,
  $depositPending,
  depositMaxClicked,
  depositSubmitted,
  $currentUtilization,
  $depositProjectedUtil,
} from "../model/model";
import { UtilizationPreview } from "./UtilizationPreview";
import { css } from "../../../../styled-system/css";

export const DepositPanel = () => {
  const amount = useUnit($depositAmount);
  const error = useUnit($depositError);
  const pending = useUnit($depositPending);
  const onAmountChange = useUnit(depositAmountChanged);
  const onMax = useUnit(depositMaxClicked);
  const onSubmit = useUnit(depositSubmitted);
  const currentUtil = useUnit($currentUtilization);
  const projectedUtil = useUnit($depositProjectedUtil);

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
            step="0.000001"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.000000"
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
            XTZ
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
        Deposit
      </Button>
    </form>
  );
};
