import { useUnit } from "effector-react";
import { $ownedOvens } from "../model/model";
import { card, chip } from "@/shared/ui/styles";
import { css } from "../../../../styled-system/css";
import { Button } from "@/shared/ui/Button";
import { Progress } from "@/shared/ui/Progress";
import { truncateAddress } from "@/shared/lib/format";

interface OvenCardProps {
  ovenAddress: string;
  onAction: (action: string) => void;
}

export const OvenCard = ({ ovenAddress, onAction }: OvenCardProps) => {
  const ovens = useUnit($ownedOvens);
  const oven = ovens?.[ovenAddress];

  if (!oven) return null;

  const collateralLevel =
    oven.outstandingTokens.isZero() || oven.balance.isZero()
      ? ("safe" as const)
      : oven.outstandingTokens.dividedBy(oven.balance).gt(0.8)
        ? ("danger" as const)
        : oven.outstandingTokens.dividedBy(oven.balance).gt(0.6)
          ? ("warning" as const)
          : ("safe" as const);

  return (
    <div className={card()}>
      <div
        className={css({
          textStyle: "label-md",
          color: "token(colors.on-surface-variant)",
          fontFamily: "monospace",
        })}
      >
        {truncateAddress(ovenAddress)}
      </div>

      {oven.isLiquidated && <div className={chip({ color: "error" })}>Liquidated</div>}

      <div className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.xs)" })}>
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            paddingBottom: "token(spacing.xs)",
          })}
        >
          <span
            className={css({ textStyle: "label-md", color: "token(colors.on-surface-variant)" })}
          >
            Balance
          </span>
          <span
            className={css({
              textStyle: "body-md",
              fontVariantNumeric: "tabular-nums",
              textAlign: "right",
            })}
          >
            {oven.balance.dividedBy(1e6).toFixed(4)} XTZ
          </span>
        </div>
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            paddingBottom: "token(spacing.xs)",
          })}
        >
          <span
            className={css({ textStyle: "label-md", color: "token(colors.on-surface-variant)" })}
          >
            Borrowed
          </span>
          <span
            className={css({
              textStyle: "body-md",
              fontVariantNumeric: "tabular-nums",
              textAlign: "right",
            })}
          >
            {oven.borrowedTokens.dividedBy(1e18).toFixed(2)} kUSD
          </span>
        </div>
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            paddingBottom: "token(spacing.xs)",
          })}
        >
          <span
            className={css({ textStyle: "label-md", color: "token(colors.on-surface-variant)" })}
          >
            Outstanding
          </span>
          <span
            className={css({
              textStyle: "body-md",
              fontVariantNumeric: "tabular-nums",
              textAlign: "right",
            })}
          >
            {oven.outstandingTokens.dividedBy(1e18).toFixed(2)} kUSD
          </span>
        </div>
        <div className={css({ display: "flex", justifyContent: "space-between" })}>
          <span
            className={css({ textStyle: "label-md", color: "token(colors.on-surface-variant)" })}
          >
            Baker
          </span>
          <span className={css({ textStyle: "body-sm", color: "token(colors.on-surface)" })}>
            {oven.baker ?? "None"}
          </span>
        </div>
      </div>

      <Progress
        value={oven.outstandingTokens.isZero() ? 0 : 50}
        max={100}
        level={collateralLevel}
        label="Collateral ratio"
      />

      <div className={css({ display: "flex", gap: "token(spacing.xs)", flexWrap: "wrap" })}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction("deposit")}
          aria-label={`Deposit to oven ${truncateAddress(ovenAddress)}`}
        >
          Deposit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction("withdraw")}
          aria-label={`Withdraw from oven ${truncateAddress(ovenAddress)}`}
        >
          Withdraw
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction("borrow")}
          aria-label={`Borrow from oven ${truncateAddress(ovenAddress)}`}
        >
          Borrow
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction("repay")}
          aria-label={`Repay to oven ${truncateAddress(ovenAddress)}`}
        >
          Repay
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction("baker")}
          aria-label={`Set baker for oven ${truncateAddress(ovenAddress)}`}
        >
          Set Baker
        </Button>
      </div>
    </div>
  );
};
