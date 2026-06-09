import { useUnit } from "effector-react";
import {
  $priceData,
  $minterData,
  type PriceData,
  type MinterData,
  $globalDataPending,
} from "@/entities/oven";
import { card, skeleton } from "@/shared/ui/styles";
import { formatUsd, formatPercent } from "@/shared/lib/format";
import { css, cx } from "styled-system/css";
import { TrendingUp, Shield, Percent } from "lucide-react";

const statCards = [
  {
    key: "xtz-price",
    icon: TrendingUp,
    iconBg: "rgba(0, 218, 248, 0.15)",
    iconColor: "token(colors.secondary-fixed-dim)",
    label: "XTZ Price",
    getValue: (priceData: PriceData | null) =>
      priceData ? formatUsd(priceData.price.toNumber(), 4) : "—",
  },
  {
    key: "stability-fee",
    icon: Shield,
    iconBg: "rgba(0, 226, 144, 0.15)",
    iconColor: "token(colors.primary-fixed-dim)",
    label: "Stability Fee",
    getValue: (_: unknown, minterData: MinterData) =>
      minterData.stabilityFee != null ? formatPercent(minterData.stabilityFee!.toNumber()) : "—",
  },
  {
    key: "collateral-rate",
    icon: Percent,
    iconBg: "rgba(228, 196, 81, 0.15)",
    iconColor: "token(colors.tertiary-fixed-dim)",
    label: "Collateral Rate",
    getValue: (_: unknown, minterData: MinterData) =>
      minterData.collateralRate != null
        ? formatPercent(minterData.collateralRate!.toNumber())
        : "—",
  },
] as const;

export const Stats = () => {
  const { priceData, minterData, loading } = useUnit({
    priceData: $priceData,
    minterData: $minterData,
    loading: $globalDataPending,
  });

  return (
    <div
      className={css({
        display: "grid",
        gridTemplateColumns: { base: "1fr", md: "repeat(3, 1fr)" },
        gap: "token(spacing.md)",
      })}
    >
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const value =
          stat.key === "xtz-price" ? stat.getValue(priceData) : stat.getValue(null, minterData);
        const hasData = value !== "—" || !loading;

        return (
          <div key={stat.key} className={card()}>
            <div
              className={css({ display: "flex", alignItems: "center", gap: "token(spacing.sm)" })}
            >
              <div
                className={css({
                  width: "40px",
                  height: "40px",
                  borderRadius: "token(radii.full)",
                  bg: stat.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: "0",
                })}
              >
                <Icon size={20} className={cx(css({ color: stat.iconColor }))} />
              </div>
              <div className={css({ display: "flex", flexDirection: "column", minWidth: "0" })}>
                <span
                  className={css({
                    textStyle: "label-md",
                    color: "token(colors.on-surface-variant)",
                    textTransform: "uppercase",
                  })}
                >
                  {stat.label}
                </span>
                {loading && !hasData ? (
                  <div className={skeleton({ shape: "heading" })} />
                ) : (
                  <span
                    className={css({
                      textStyle: "body-lg",
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: "600",
                    })}
                  >
                    {value}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
