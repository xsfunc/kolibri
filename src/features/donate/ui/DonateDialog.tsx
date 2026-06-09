import { useState, useCallback } from "react";
import { useUnit } from "effector-react";
import { $donateOpen, donateClosed } from "../model/model";
import {
  donateXtzFx,
  donateKusdFx,
  donateUsdtFx,
  DONATE_ADDRESS,
  CURRENCIES,
  type Currency,
} from "../model/transfer";
import { $isConnected, $isInitializing } from "@/entities/wallet";
import { connectWalletFx } from "@/features/connect-wallet";
import { Dialog } from "@/shared/ui/Dialog";
import { Button } from "@/shared/ui/Button";
import { Copy } from "lucide-react";
import { css } from "styled-system/css";

type TxStatus = "idle" | "pending" | "success" | "error";

export const DonateDialog = () => {
  const [amount, setAmount] = useState("10");
  const [currency, setCurrency] = useState<Currency>("XTZ");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txError, setTxError] = useState("");

  const open = useUnit($donateOpen);
  const close = useUnit(donateClosed);
  const isConnected = useUnit($isConnected);
  const isInitializing = useUnit($isInitializing);

  const xtzPending = useUnit(donateXtzFx.pending);
  const kusdPending = useUnit(donateKusdFx.pending);
  const usdtPending = useUnit(donateUsdtFx.pending);
  const pending = xtzPending || kusdPending || usdtPending;

  const handleCurrencyChange = useCallback((c: Currency) => {
    setCurrency(c);
    setTxStatus("idle");
    setTxError("");
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(DONATE_ADDRESS);
    } catch {
      // ignore
    }
  }, []);

  const handleConnect = useCallback(() => {
    void connectWalletFx();
  }, []);

  const handleDonate = useCallback(async () => {
    if (!amount || Number(amount) <= 0) {
      setTxError("Amount must be greater than 0");
      return;
    }

    setTxStatus("pending");
    setTxError("");

    try {
      switch (currency) {
        case "XTZ":
          await donateXtzFx({ amount });
          break;
        case "kUSD":
          await donateKusdFx({ amount });
          break;
        case "USDT":
          await donateUsdtFx({ amount });
          break;
      }
      setTxStatus("success");
    } catch (err) {
      setTxStatus("error");
      setTxError(err instanceof Error ? err.message : "Transaction failed");
    }
  }, [amount, currency]);

  const handleClose = useCallback(() => {
    setTxStatus("idle");
    setTxError("");
    setAmount("10");
    setCurrency("XTZ");
    close();
  }, [close]);

  const canDonate = amount && Number(amount) > 0 && !pending && isConnected;

  return (
    <Dialog open={open} onClose={handleClose} title="Donate">
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
            <button
              onClick={handleCopy}
              className={css({
                bg: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                marginLeft: "4px",
                color: "token(colors.on-surface-variant)",
                _hover: { color: "token(colors.primary-fixed-dim)" },
                _active: { transform: "scale(0.9)" },
                verticalAlign: "middle",
              })}
            >
              <Copy size={12} />
            </button>{" "}
            Send any currency or NFT. Thank you!
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
              onChange={(e) => {
                setAmount(e.target.value);
                setTxStatus("idle");
                setTxError("");
              }}
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
                  onClick={() => handleCurrencyChange(c)}
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
            onClick={handleConnect}
            disabled={isInitializing || txStatus === "pending"}
            variant="primary"
          >
            {isInitializing ? "…" : "Connect Wallet"}
          </Button>
        ) : (
          <Button onClick={handleDonate} disabled={!canDonate} loading={pending} variant="primary">
            Donate
          </Button>
        )}
      </div>
    </Dialog>
  );
};
