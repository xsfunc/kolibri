import { useUnit } from "effector-react";
import {
  $donateOpen,
  donateClosed,
  $amount,
  $currency,
  $txStatus,
  $txError,
  $donatePending,
  amountChanged,
  currencyChanged,
  donateSubmitted,
} from "../model/model";
import { DONATE_ADDRESS, CURRENCIES } from "../model/transfer";
import { $isConnected, $isInitializing } from "@/entities/wallet";
import { connectWalletFx } from "@/features/connect-wallet";
import { Dialog } from "@/shared/ui/Dialog";
import { Button } from "@/shared/ui/Button";
import { CopyButton } from "@/shared/ui/CopyButton";
import { css } from "styled-system/css";

export type { TxStatus } from "../model/model";

export const DonateDialog = () => {
  const { open, close, isConnected, isInitializing, amount, currency, txStatus, txError, pending } =
    useUnit({
      open: $donateOpen,
      close: donateClosed,
      isConnected: $isConnected,
      isInitializing: $isInitializing,
      amount: $amount,
      currency: $currency,
      txStatus: $txStatus,
      txError: $txError,
      pending: $donatePending,
    });

  const canDonate = amount && Number(amount) > 0 && !pending && isConnected;

  return (
    <Dialog open={open} onClose={close} title="Donate">
      <div className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.sm)" })}>
        <div
          className={css({
            padding: "10px",
            borderRadius: "token(radii.md)",
            border: "1px solid token(colors.outline-variant)",
            bg: "rgba(0, 255, 163, 0.04)",
          })}
        >
          <p
            className={css({
              textStyle: "body-sm",
              color: "token(colors.on-surface-variant)",
              margin: "0 0 8px",
            })}
          >
            You can use this form or donate manually to address{" "}
            <code
              className={css({
                bg: "token(colors.surface-container)",
                color: "token(colors.primary-fixed-dim)",
                padding: "2px 6px",
                borderRadius: "token(radii.sm)",
                fontSize: "11px",
                lineHeight: "16px",
                fontWeight: "500",
                fontFamily: "mono",
              })}
            >
              {DONATE_ADDRESS}
            </code>
            <CopyButton value={DONATE_ADDRESS} label="Copy donation address" /> Send any currency or
            NFT. Thank you!
          </p>
        </div>

        <div>
          <span
            className={css({
              display: "block",
              textStyle: "label-md",
              color: "token(colors.on-surface-variant)",
              marginBottom: "6px",
            })}
          >
            Amount
          </span>
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              bg: "token(colors.surface-container)",
              border: "1px solid token(colors.outline-variant)",
              borderRadius: "token(radii.md)",
              overflow: "hidden",
              transition: "border-color 150ms ease, box-shadow 150ms ease",
              _focusWithin: {
                borderColor: "token(colors.surface-tint)",
                boxShadow: "0 0 0 1px token(colors.surface-tint)",
              },
            })}
          >
            <input
              type="number"
              min="0"
              step="0.1"
              value={amount}
              onChange={(e) => amountChanged(e.target.value)}
              placeholder="0"
              disabled={txStatus === "pending"}
              className={css({
                bg: "transparent",
                border: "none",
                outline: "none",
                color: "token(colors.on-surface)",
                padding: "8px 12px",
                fontSize: "16px",
                lineHeight: "24px",
                width: "100%",
                _placeholder: { color: "token(colors.on-surface-variant)" },
                _disabled: { opacity: "0.5" },
              })}
            />
            <div
              className={css({
                display: "flex",
                gap: "2px",
                padding: "4px 6px",
                flexShrink: "0",
                bg: "token(colors.surface-container-lowest)",
                borderRadius: "token(radii.md)",
                marginRight: "4px",
              })}
            >
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => currencyChanged(c)}
                  className={css({
                    padding: "3px 8px",
                    borderRadius: "token(radii.full)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "600",
                    letterSpacing: "0.03em",
                    transition: "all 150ms ease",
                    bg: currency === c ? "rgba(0, 255, 163, 0.15)" : "transparent",
                    color:
                      currency === c
                        ? "token(colors.primary-fixed-dim)"
                        : "token(colors.on-surface-variant)",
                    _hover: {
                      bg: currency === c ? "rgba(0, 255, 163, 0.15)" : "rgba(255, 255, 255, 0.06)",
                    },
                    _active: { transform: "scale(0.93)" },
                  })}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {txStatus === "pending" && (
          <div
            className={css({
              padding: "10px",
              borderRadius: "token(radii.md)",
              bg: "rgba(0, 255, 163, 0.06)",
              border: "1px solid token(colors.outline-variant)",
              textStyle: "body-sm",
              color: "token(colors.on-surface-variant)",
              textAlign: "center",
            })}
          >
            Waiting for confirmation...
          </div>
        )}

        {txStatus === "success" && (
          <div
            className={css({
              padding: "10px",
              borderRadius: "token(radii.md)",
              bg: "rgba(0, 255, 163, 0.1)",
              border: "1px solid token(colors.primary-fixed-dim)",
              textStyle: "body-sm",
              color: "token(colors.primary-fixed-dim)",
              textAlign: "center",
            })}
          >
            Donation sent successfully!
          </div>
        )}

        {txStatus === "error" && (
          <div
            className={css({
              padding: "10px",
              borderRadius: "token(radii.md)",
              bg: "rgba(255, 180, 171, 0.1)",
              border: "1px solid token(colors.error)",
              textStyle: "body-sm",
              color: "token(colors.error)",
              textAlign: "center",
            })}
          >
            {txError}
          </div>
        )}

        {!isConnected ? (
          <Button
            onClick={() => void connectWalletFx()}
            disabled={isInitializing || txStatus === "pending"}
            variant="primary"
          >
            {isInitializing ? "…" : "Connect Wallet"}
          </Button>
        ) : (
          <Button
            onClick={() => donateSubmitted()}
            disabled={!canDonate}
            loading={pending}
            variant="primary"
          >
            Donate
          </Button>
        )}
      </div>
    </Dialog>
  );
};
