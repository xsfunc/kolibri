import { useUnit } from "effector-react";
import { Dialog } from "@/shared/ui/Dialog";
import { DepositPanel } from "./DepositPanel";
import { WithdrawPanel } from "./WithdrawPanel";
import { BorrowPanel } from "./BorrowPanel";
import { RepayPanel } from "./RepayPanel";
import { numberWithCommas, formatUsd } from "@/shared/lib/format";
import {
  type Tab,
  $activeTab,
  tabChanged,
  dialogClosed,
  $activeOvenCalc,
  $dialogOpen,
} from "../model/model";
import { getUtilLevel, levelStyles } from "@/shared/lib/utilization-levels";
import { css } from "../../../../styled-system/css";

const TAB_ITEMS: { value: Tab; label: string }[] = [
  { value: "deposit", label: "Deposit" },
  { value: "withdraw", label: "Withdraw" },
  { value: "borrow", label: "Borrow" },
  { value: "repay", label: "Repay" },
];

export const OvenManageDialog = () => {
  const tab = useUnit($activeTab);
  const onTabChange = useUnit(tabChanged);
  const calc = useUnit($activeOvenCalc);
  const open = useUnit($dialogOpen);
  const onClose = useUnit(dialogClosed);

  const collateralXtz = calc?.collateralXtz;
  const debtKusd = calc?.debtKusd;
  const utilizationPct = calc?.utilizationPct ?? 0;
  const maxDebt = calc?.maxDebt;
  const collateralValueUsd = calc?.collateralValueUsd;
  const healthLevel = getUtilLevel(utilizationPct);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Manage Oven"
      description="Deposit, withdraw, borrow, or repay in this oven."
    >
      <div className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.md)" })}>
        <div
          className={css({
            padding: "10px",
            borderRadius: "token(radii.md)",
            border: "1px solid token(colors.outline-variant)",
            bg: "rgba(0, 255, 163, 0.04)",
          })}
        >
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            })}
          >
            <span
              className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
            >
              Collateral
            </span>
            <span
              className={css({
                textStyle: "body-sm",
                fontWeight: "700",
                fontVariantNumeric: "tabular-nums",
              })}
            >
              {collateralXtz ? `${numberWithCommas(collateralXtz.toFixed(2))} XTZ` : "—"}
            </span>
          </div>
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            })}
          >
            <span
              className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
            >
              Debt
            </span>
            <span
              className={css({
                textStyle: "body-sm",
                fontWeight: "700",
                fontVariantNumeric: "tabular-nums",
              })}
            >
              {debtKusd ? `${numberWithCommas(debtKusd.toFixed(2))} kUSD` : "0.00 kUSD"}
            </span>
          </div>
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            })}
          >
            <span
              className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
            >
              Max Debt
            </span>
            <span
              className={css({
                textStyle: "body-sm",
                fontWeight: "700",
                fontVariantNumeric: "tabular-nums",
              })}
            >
              {maxDebt ? `${numberWithCommas(maxDebt.toFixed(2))} kUSD` : "—"}
            </span>
          </div>
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            })}
          >
            <span
              className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
            >
              Utilization
            </span>
            <span
              className={css({
                textStyle: "body-sm",
                fontWeight: "700",
                fontVariantNumeric: "tabular-nums",
                color: levelStyles[healthLevel],
              })}
            >
              {utilizationPct.toFixed(2)}%
            </span>
          </div>
          {collateralValueUsd && (
            <div
              className={css({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "6px",
                paddingTop: "6px",
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              })}
            >
              <span
                className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
              >
                Collateral Value
              </span>
              <span
                className={css({
                  textStyle: "body-sm",
                  fontWeight: "700",
                  fontVariantNumeric: "tabular-nums",
                })}
              >
                {formatUsd(collateralValueUsd.toNumber())}
              </span>
            </div>
          )}
        </div>

        <div
          className={css({
            display: "flex",
            gap: "2px",
            padding: "4px",
            bg: "token(colors.surface-container-lowest)",
            borderRadius: "token(radii.md)",
          })}
        >
          {TAB_ITEMS.map((item) => (
            <button
              key={item.value}
              onClick={() => onTabChange(item.value)}
              className={css({
                flex: "1",
                padding: "6px 8px",
                borderRadius: "token(radii.md)",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.03em",
                transition: "all 150ms ease",
                bg: tab === item.value ? "rgba(0, 255, 163, 0.15)" : "transparent",
                color:
                  tab === item.value
                    ? "token(colors.primary-fixed-dim)"
                    : "token(colors.on-surface-variant)",
                _hover: {
                  bg: tab === item.value ? "rgba(0, 255, 163, 0.15)" : "rgba(255, 255, 255, 0.06)",
                },
                _active: { transform: "scale(0.93)" },
              })}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "deposit" && <DepositPanel />}
        {tab === "withdraw" && <WithdrawPanel />}
        {tab === "borrow" && <BorrowPanel />}
        {tab === "repay" && <RepayPanel />}
      </div>
    </Dialog>
  );
};
