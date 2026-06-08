import { useUnit } from "effector-react";
import { $priceData, $minterData } from "@/entities/oven/model/model";
import { $globalDataPending } from "@/entities/oven/model/loadOvens";
import { card, skeleton } from "@/shared/ui/styles";
import { css, cx } from "../../../../styled-system/css";
import { TrendingUp, Shield, Percent } from "lucide-react";

const statCards = [
  {
    key: "xtz-price",
    icon: TrendingUp,
    iconBg: "rgba(0, 218, 248, 0.15)",
    iconColor: "token(colors.secondary-fixed-dim)",
    label: "XTZ Price",
    getValue: (priceData: { price: { toFixed: (n: number) => string } } | null) =>
      priceData ? `$${priceData.price.toFixed(4)}` : "—",
  },
  {
    key: "stability-fee",
    icon: Shield,
    iconBg: "rgba(0, 226, 144, 0.15)",
    iconColor: "token(colors.primary-fixed-dim)",
    label: "Stability Fee",
    getValue: (
      _: unknown,
      minterData: { stabilityFee: { toFixed: (n: number) => string } | null },
    ) => (minterData.stabilityFee != null ? `${minterData.stabilityFee!.toFixed(2)}%` : "—"),
  },
  {
    key: "collateral-rate",
    icon: Percent,
    iconBg: "rgba(228, 196, 81, 0.15)",
    iconColor: "token(colors.tertiary-fixed-dim)",
    label: "Collateral Rate",
    getValue: (
      _: unknown,
      minterData: { collateralRate: { toFixed: (n: number) => string } | null },
    ) => (minterData.collateralRate != null ? `${minterData.collateralRate!.toFixed(2)}%` : "—"),
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
