import { useUnit } from "effector-react";
import { $ownedOvens, $ovenHealthMap, type HealthLevel } from "../model/model";
import { $refreshingOvenAddress } from "../model/loadOvens";
import { card } from "@/shared/ui/styles";
import { css } from "../../../../styled-system/css";
import { Button } from "@/shared/ui/Button";
import { Progress } from "@/shared/ui/Progress";
import { truncateAddress } from "@/shared/lib/format";
import { Flame } from "lucide-react";

interface OvenCardProps {
  ovenAddress: string;
  onAction: (action: string) => void;
}

const borderColors: Record<HealthLevel, string> = {
  safe: "token(colors.primary-fixed-dim)",
  warning: "token(colors.tertiary-fixed-dim)",
  danger: "token(colors.error)",
};

const healthColors: Record<HealthLevel, string> = {
  safe: "token(colors.primary-fixed-dim)",
  warning: "token(colors.tertiary-fixed-dim)",
  danger: "token(colors.error)",
};

export const OvenCard = ({ ovenAddress, onAction }: OvenCardProps) => {
  const { ovens, refreshingAddress, healthMap } = useUnit({
    ovens: $ownedOvens,
    refreshingAddress: $refreshingOvenAddress,
    healthMap: $ovenHealthMap,
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
  const healthFactor = health?.factor;
  const collateralLevel =
    oven.outstandingTokens.isZero() || oven.balance.isZero()
      ? ("safe" as const)
      : oven.outstandingTokens.dividedBy(oven.balance).gt(0.8)
        ? ("danger" as const)
        : oven.outstandingTokens.dividedBy(oven.balance).gt(0.6)
          ? ("warning" as const)
          : ("safe" as const);

  const collateralPct = oven.balance.isZero()
    ? 0
    : Math.min(
        100,
        Math.round((1 - oven.outstandingTokens.dividedBy(oven.balance).toNumber()) * 100),
      );

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
          marginBottom: "token(spacing.lg)",
        })}
      >
        <div>
          <h4
            className={css({
              textStyle: "headline-sm",
              fontWeight: "700",
              margin: "0",
            })}
          >
            Oven {truncateAddress(ovenAddress)}
          </h4>
          <p
            className={css({
              textStyle: "body-sm",
              color: "token(colors.on-surface-variant)",
              margin: "0",
            })}
          >
            {oven.isLiquidated ? "Liquidated" : "Active Lending Position"}
          </p>
        </div>
        <div className={css({ display: "flex", flexDirection: "column", alignItems: "flex-end" })}>
          <span
            className={css({
              textStyle: "label-md",
              color: "token(colors.on-surface-variant)",
            })}
          >
            Health Factor
          </span>
          <span
            className={css({
              textStyle: "headline-sm",
              fontWeight: "700",
              color: healthColors[healthLevel],
            })}
          >
            {healthFactor ? healthFactor.toFixed(1) : "—"}
          </span>
        </div>
      </div>

      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "token(spacing.md)",
          marginBottom: "token(spacing.lg)",
        })}
      >
        <div
          className={css({
            bg: "token(colors.surface-container-low)",
            padding: "token(spacing.sm)",
            borderRadius: "token(radii.DEFAULT)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          })}
        >
          <p
            className={css({
              textStyle: "label-sm",
              color: "token(colors.on-surface-variant)",
              marginBottom: "token(spacing.xs)",
            })}
          >
            Collateral
          </p>
          <p
            className={css({
              textStyle: "body-md",
              fontVariantNumeric: "tabular-nums",
              fontWeight: "600",
            })}
          >
            {oven.balance.dividedBy(1e6).toFixed(4)} XTZ
          </p>
        </div>
        <div
          className={css({
            bg: "token(colors.surface-container-low)",
            padding: "token(spacing.sm)",
            borderRadius: "token(radii.DEFAULT)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          })}
        >
          <p
            className={css({
              textStyle: "label-sm",
              color: "token(colors.on-surface-variant)",
              marginBottom: "token(spacing.xs)",
            })}
          >
            Debt
          </p>
          <p
            className={css({
              textStyle: "body-md",
              fontVariantNumeric: "tabular-nums",
              fontWeight: "600",
            })}
          >
            {oven.outstandingTokens.dividedBy(1e18).toFixed(2)} kUSD
          </p>
        </div>
      </div>

      <div className={css({ marginBottom: "token(spacing.lg)" })}>
        <Progress value={collateralPct} max={100} level={collateralLevel} />
      </div>

      <Button
        variant="ghost"
        onClick={() => onAction("deposit")}
        disabled={isRefreshing}
        aria-label={`Manage oven ${truncateAddress(ovenAddress)}`}
        className={css({ width: "100%" })}
      >
        <Flame size={16} />
        Manage
      </Button>
    </div>
  );
};
