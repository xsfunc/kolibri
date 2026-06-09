import { useUnit } from "effector-react";
import {
  $walletBalance,
  $walletBalanceXTZ,
  $isConnected,
  loadWalletBalancesFx,
} from "@/entities/wallet";
import { $priceData, $kusdPriceData } from "@/entities/oven";
import { card, skeleton } from "@/shared/ui/styles";
import { formatToken, formatUsd } from "@/shared/lib/format";
import { css, cx } from "styled-system/css";
import { Wallet } from "lucide-react";

export const WalletBalances = () => {
  const { kUSD, xtz, isConnected, loading, priceData, kusdPriceData } = useUnit({
    kUSD: $walletBalance,
    xtz: $walletBalanceXTZ,
    isConnected: $isConnected,
    loading: loadWalletBalancesFx.pending,
    priceData: $priceData,
    kusdPriceData: $kusdPriceData,
  });

  const isLoading = !isConnected || loading || kUSD == null;

  const xtzUsd =
    xtz != null && priceData != null && !xtz.isZero() ? xtz.multipliedBy(priceData.price) : null;

  const kusdUsd =
    kUSD != null && kusdPriceData != null && !kUSD.isZero()
      ? kUSD.multipliedBy(kusdPriceData.price)
      : null;

  return (
    <div className={card()}>
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "token(spacing.sm)",
          marginBottom: "token(spacing.md)",
        })}
      >
        <div
          className={css({
            width: "32px",
            height: "32px",
            borderRadius: "token(radii.full)",
            bg: "rgba(0, 226, 144, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Wallet size={16} className={cx(css({ color: "token(colors.primary-fixed-dim)" }))} />
        </div>
        <span
          className={css({
            textStyle: "label-md",
            color: "token(colors.on-surface-variant)",
            textTransform: "uppercase",
          })}
        >
          Wallet Balances
        </span>
      </div>
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "token(spacing.md)",
        })}
      >
        <div
          className={css({
            bg: "token(colors.surface-container-low)",
            padding: "token(spacing.sm)",
            borderRadius: "token(radii.sm)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          })}
        >
          <span
            className={css({
              textStyle: "label-sm",
              color: "token(colors.on-surface-variant)",
              display: "block",
              marginBottom: "token(spacing.xs)",
            })}
          >
            kUSD{kusdUsd != null ? ` (${formatUsd(kusdUsd.toNumber())})` : ""}
          </span>
          {isLoading ? (
            <div
              className={cx(
                skeleton({ shape: "inline" }),
                css({
                  textStyle: "body-md",
                  fontWeight: "600",
                  fontVariantNumeric: "tabular-nums",
                  height: "24px",
                }),
              )}
              style={{ width: "10ch" }}
            />
          ) : (
            <span
              className={css({
                textStyle: "body-md",
                fontVariantNumeric: "tabular-nums",
                fontWeight: "600",
              })}
            >
              {formatToken(kUSD!.toNumber(), "kUSD")}
            </span>
          )}
        </div>
        <div
          className={css({
            bg: "token(colors.surface-container-low)",
            padding: "token(spacing.sm)",
            borderRadius: "token(radii.sm)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          })}
        >
          <span
            className={css({
              textStyle: "label-sm",
              color: "token(colors.on-surface-variant)",
              display: "block",
              marginBottom: "token(spacing.xs)",
            })}
          >
            XTZ{xtzUsd != null ? ` (${formatUsd(xtzUsd.toNumber())})` : ""}
          </span>
          {isLoading ? (
            <div
              className={cx(
                skeleton({ shape: "inline" }),
                css({
                  textStyle: "body-md",
                  fontWeight: "600",
                  fontVariantNumeric: "tabular-nums",
                  height: "24px",
                }),
              )}
              style={{ width: "10ch" }}
            />
          ) : (
            <span
              className={css({
                textStyle: "body-md",
                fontVariantNumeric: "tabular-nums",
                fontWeight: "600",
              })}
            >
              {xtz != null ? formatToken(xtz.toNumber(), "XTZ", 4) : "—"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
