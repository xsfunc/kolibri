import { useUnit } from "effector-react";
import { $priceData, $minterData } from "@/entities/oven/model/model";
import { $walletBalance, $walletBalanceXTZ, $isConnected } from "@/entities/wallet/model/model";
import { $globalDataPending } from "@/entities/oven/model/loadOvens";
import { card } from "@/shared/ui/styles";
import { css } from "../../../../styled-system/css";

export const Stats = () => {
  const { priceData, minterData, kUSD, xtz, isConnected, loading } = useUnit({
    priceData: $priceData,
    minterData: $minterData,
    kUSD: $walletBalance,
    xtz: $walletBalanceXTZ,
    isConnected: $isConnected,
    loading: $globalDataPending,
  });

  if (loading)
    return (
      <div
        className={css({
          padding: "token(spacing.md)",
          color: "token(colors.on-surface-variant)",
          textStyle: "body-sm",
        })}
      >
        Loading global data…
      </div>
    );

  return (
    <div className={card()}>
      <div className={css({ display: "flex", gap: "token(spacing.lg)", flexWrap: "wrap" })}>
        <div
          className={css({
            borderRight: "1px solid rgba(255,255,255,0.05)",
            paddingRight: "token(spacing.lg)",
          })}
        >
          <div
            className={css({ textStyle: "label-md", color: "token(colors.on-surface-variant)" })}
          >
            XTZ Price
          </div>
          <div className={css({ textStyle: "body-lg", fontVariantNumeric: "tabular-nums" })}>
            {priceData ? `$${priceData.price.toFixed(4)}` : "—"}
          </div>
        </div>
        <div
          className={css({
            borderRight: "1px solid rgba(255,255,255,0.05)",
            paddingRight: "token(spacing.lg)",
          })}
        >
          <div
            className={css({ textStyle: "label-md", color: "token(colors.on-surface-variant)" })}
          >
            Stability Fee
          </div>
          <div className={css({ textStyle: "body-lg", fontVariantNumeric: "tabular-nums" })}>
            {minterData.stabilityFee ? `${minterData.stabilityFee.toFixed(6)}` : "—"}
          </div>
        </div>
        <div
          className={css({
            borderRight: isConnected ? "1px solid rgba(255,255,255,0.05)" : undefined,
            paddingRight: "token(spacing.lg)",
          })}
        >
          <div
            className={css({ textStyle: "label-md", color: "token(colors.on-surface-variant)" })}
          >
            Collateral Rate
          </div>
          <div className={css({ textStyle: "body-lg", fontVariantNumeric: "tabular-nums" })}>
            {minterData.collateralRate ? `${minterData.collateralRate.toFixed(2)}%` : "—"}
          </div>
        </div>
        {isConnected && (
          <>
            <div
              className={css({
                borderRight: "1px solid rgba(255,255,255,0.05)",
                paddingRight: "token(spacing.lg)",
              })}
            >
              <div
                className={css({
                  textStyle: "label-md",
                  color: "token(colors.on-surface-variant)",
                })}
              >
                kUSD Balance
              </div>
              <div className={css({ textStyle: "body-lg", fontVariantNumeric: "tabular-nums" })}>
                {kUSD ? kUSD.toFixed(2) : "—"}
              </div>
            </div>
            <div>
              <div
                className={css({
                  textStyle: "label-md",
                  color: "token(colors.on-surface-variant)",
                })}
              >
                XTZ Balance
              </div>
              <div className={css({ textStyle: "body-lg", fontVariantNumeric: "tabular-nums" })}>
                {xtz ? xtz.toFixed(4) : "—"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
