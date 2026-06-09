import { useUnit } from "effector-react";
import {
  $priceData,
  $minterData,
  $kusdPriceData,
  type PriceData,
  type MinterData,
  type KusdPriceData,
  $globalDataPending,
  $kusdPricePending,
} from "@/entities/oven";
import { card, skeleton } from "@/shared/ui/styles";
import { formatUsd, formatPercent } from "@/shared/lib/format";
import { css } from "styled-system/css";
import { TrendingUp, Shield, Percent, Coins } from "lucide-react";

type KusdPriceLevel = "safe" | "warning" | "danger";

function getKusdPriceLevel(price: number): KusdPriceLevel {
  if (price <= 1.01) return "safe";
  if (price <= 1.05) return "warning";
  return "danger";
}

const kusdPriceColors: Record<KusdPriceLevel, { iconBg: string; iconColor: string }> = {
  safe: {
    iconBg: "rgba(0, 226, 144, 0.15)",
    iconColor: "#00e290",
  },
  warning: {
    iconBg: "rgba(228, 196, 81, 0.15)",
    iconColor: "#e4c451",
  },
  danger: {
    iconBg: "rgba(147, 0, 10, 0.15)",
    iconColor: "#ffb4ab",
  },
};

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
    key: "kusd-price",
    icon: Coins,
    iconBg: "",
    iconColor: "",
    label: "kUSD Price",
    getValue: (kusdPriceData: KusdPriceData | null) =>
      kusdPriceData ? formatUsd(kusdPriceData.price.toNumber(), 2) : "—",
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
  const { priceData, minterData, kusdPriceData, globalLoading, kusdLoading } = useUnit({
    priceData: $priceData,
    minterData: $minterData,
    kusdPriceData: $kusdPriceData,
    globalLoading: $globalDataPending,
    kusdLoading: $kusdPricePending,
  });

  return (
    <div
      className={css({
        display: "grid",
        gridTemplateColumns: { base: "1fr", md: "repeat(4, 1fr)" },
        gap: "token(spacing.md)",
      })}
    >
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const isKusd = stat.key === "kusd-price";
        const value = isKusd
          ? stat.getValue(kusdPriceData)
          : stat.key === "xtz-price"
            ? stat.getValue(priceData)
            : stat.getValue(null, minterData);
        const loading = isKusd ? kusdLoading : globalLoading;
        const hasData = value !== "—" || !loading;

        let iconBg: string;
        let iconColor: string;
        if (isKusd && kusdPriceData) {
          const level = getKusdPriceLevel(kusdPriceData.price.toNumber());
          iconBg = kusdPriceColors[level].iconBg;
          iconColor = kusdPriceColors[level].iconColor;
        } else {
          iconBg = stat.iconBg;
          iconColor = stat.iconColor;
        }

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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: "0",
                })}
                style={{ backgroundColor: iconBg }}
              >
                <Icon size={20} style={{ color: iconColor }} />
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
