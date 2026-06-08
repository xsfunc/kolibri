import { useUnit } from "effector-react";
import {
  $ownedOvens,
  $ovenHealthMap,
  $priceData,
  $minterData,
  type HealthLevel,
} from "../model/model";
import { $refreshingOvenAddress } from "../model/loadOvens";
import { card } from "@/shared/ui/styles";
import { css } from "../../../../styled-system/css";
import { Progress } from "@/shared/ui/Progress";
import { Button } from "@/shared/ui/Button";
import { truncateAddress, numberWithCommas, formatUsd } from "@/shared/lib/format";

interface OvenCardProps {
  ovenAddress: string;
  onAction: (action: string) => void;
}

const borderColors: Record<HealthLevel, string> = {
  safe: "token(colors.primary-fixed-dim)",
  warning: "token(colors.tertiary-fixed-dim)",
  danger: "token(colors.error)",
};

const textColors: Record<HealthLevel, string> = {
  safe: "token(colors.primary-fixed-dim)",
  warning: "token(colors.tertiary-fixed-dim)",
  danger: "token(colors.error)",
};

const outlinedVariant: Record<HealthLevel, "outlined" | "outlined-warning" | "outlined-danger"> = {
  safe: "outlined",
  warning: "outlined-warning",
  danger: "outlined-danger",
};

export const OvenCard = ({ ovenAddress, onAction }: OvenCardProps) => {
  const { ovens, refreshingAddress, healthMap, priceData, minterData } = useUnit({
    ovens: $ownedOvens,
    refreshingAddress: $refreshingOvenAddress,
    healthMap: $ovenHealthMap,
    priceData: $priceData,
    minterData: $minterData,
  });
  const oven = ovens?.[ovenAddress];
  const isRefreshing = refreshingAddress === ovenAddress;
  const health = healthMap[ovenAddress];

  if (!oven) {
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
        <div className={css({ opacity: 0.5, textStyle: "body-sm" })}>Loading oven data…</div>
      </div>
    );
  }

  const healthLevel: HealthLevel = health?.level ?? "safe";

  const collateralXtz = oven.balance.dividedBy(1e6);
  const debtKusd = oven.outstandingTokens.dividedBy(1e18);
  const price = priceData?.price ?? null;
  const collateralRate = minterData.collateralRate;

  const collateralValueUsd = price ? collateralXtz.multipliedBy(price) : null;

  const maxDebt =
    collateralValueUsd && collateralRate
      ? collateralValueUsd.multipliedBy(100).dividedBy(collateralRate)
      : null;

  const utilizationPct =
    maxDebt && !debtKusd.isZero() && !maxDebt.isZero()
      ? Math.min(100, debtKusd.dividedBy(maxDebt).multipliedBy(100).toNumber())
      : 0;

  const liquidationPrice =
    !debtKusd.isZero() && !collateralXtz.isZero() && collateralRate
      ? debtKusd.multipliedBy(collateralRate).dividedBy(collateralXtz)
      : null;

  return (
    <div
      className={card()}
      style={{ borderLeftWidth: "4px", borderLeftColor: borderColors[healthLevel] }}
    >
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "token(spacing.md)",
        })}
      >
        <div>
          <h4
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              margin: "0",
              color: textColors[healthLevel],
            })}
          >
            {truncateAddress(ovenAddress)}
          </h4>
          <p
            className={css({
              textStyle: "body-sm",
              color: "token(colors.on-surface-variant)",
              margin: "0",
            })}
          >
            Status: {oven.isLiquidated ? "liquidated" : "active"}
          </p>
        </div>
      </div>

      {oven.baker && (
        <p
          className={css({
            textStyle: "body-sm",
            color: "token(colors.on-surface-variant)",
            margin: "0",
          })}
        >
          Baker{" "}
          <span
            className={css({ color: "token(colors.primary-fixed-dim)", fontFamily: "monospace" })}
          >
            {truncateAddress(oven.baker)}
          </span>
        </p>
      )}

      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          marginBottom: "token(spacing.sm)",
        })}
      >
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
            Collateral Utilization
          </span>
          <span
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              fontVariantNumeric: "tabular-nums",
            })}
          >
            {utilizationPct.toFixed(2)}%
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
            Liquidatable at
          </span>
          <span
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              fontVariantNumeric: "tabular-nums",
            })}
          >
            {liquidationPrice ? `$${liquidationPrice.toFixed(2)} XTZ` : "none"}
          </span>
        </div>
      </div>

      <div className={css({ marginBottom: "token(spacing.sm)" })}>
        <Progress value={utilizationPct} max={100} level={healthLevel} />
      </div>

      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          marginBottom: "token(spacing.md)",
        })}
      >
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: "3px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
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
            {collateralValueUsd ? formatUsd(collateralValueUsd.toNumber()) : "—"} USD
          </span>
        </div>
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: "3px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          })}
        >
          <span
            className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
          >
            Balance
          </span>
          <span
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              fontVariantNumeric: "tabular-nums",
            })}
          >
            {numberWithCommas(collateralXtz.toFixed(2))} XTZ
          </span>
        </div>
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: "3px",
          })}
        >
          <span
            className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
          >
            Loan Amt
          </span>
          <span
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              fontVariantNumeric: "tabular-nums",
            })}
          >
            {numberWithCommas(debtKusd.toFixed(2))} kUSD
          </span>
        </div>
      </div>

      <Button
        variant={outlinedVariant[healthLevel]}
        size="sm"
        disabled={isRefreshing}
        onClick={() => onAction("deposit")}
        aria-label={`Manage oven ${truncateAddress(ovenAddress)}`}
        className={css({ width: "100%" })}
      >
        Manage
      </Button>
    </div>
  );
};
