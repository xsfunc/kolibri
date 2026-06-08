import { useUnit } from "effector-react";
import { $walletBalance, $walletBalanceXTZ, $isConnected } from "@/entities/wallet/model/model";
import { loadWalletBalancesFx } from "@/entities/wallet/model/loadBalances";
import { card, skeleton } from "@/shared/ui/styles";
import { css, cx } from "../../../../styled-system/css";
import { Wallet } from "lucide-react";

export const WalletBalances = () => {
  const { kUSD, xtz, isConnected, loading } = useUnit({
    kUSD: $walletBalance,
    xtz: $walletBalanceXTZ,
    isConnected: $isConnected,
    loading: loadWalletBalancesFx.pending,
  });

  const isLoading = !isConnected || loading || kUSD == null;

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
            borderRadius: "token(radii.DEFAULT)",
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
            kUSD
          </span>
          {isLoading ? (
            <div className={skeleton({ shape: "heading" })} />
          ) : (
            <span
              className={css({
                textStyle: "body-md",
                fontVariantNumeric: "tabular-nums",
                fontWeight: "600",
              })}
            >
              {kUSD!.toFixed(2)}
            </span>
          )}
        </div>
        <div
          className={css({
            bg: "token(colors.surface-container-low)",
            padding: "token(spacing.sm)",
            borderRadius: "token(radii.DEFAULT)",
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
            XTZ
          </span>
          {isLoading ? (
            <div className={skeleton({ shape: "heading" })} />
          ) : (
            <span
              className={css({
                textStyle: "body-md",
                fontVariantNumeric: "tabular-nums",
                fontWeight: "600",
              })}
            >
              {xtz != null ? xtz.toFixed(4) : "—"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
