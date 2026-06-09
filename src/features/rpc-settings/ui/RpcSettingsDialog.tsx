import { useState, useEffect } from "react";
import { useUnit } from "effector-react";
import { $rpcNode, rpcNodeChanged } from "@/entities/rpc";
import { $rpcSettingsOpen, rpcSettingsClosed } from "../model/model";
import { Dialog } from "@/shared/ui/Dialog";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { RadioGroup, RadioCard } from "@/shared/ui/Radio";
import { css } from "styled-system/css";

const PRESETS = [
  { label: "tzkt", value: "https://rpc.tzkt.io/mainnet" },
  { label: "SmartPy", value: "https://mainnet.smartpy.io" },
  { label: "Trilitech", value: "https://tezos-mainnet.octez.io" },
] as const;

const CUSTOM_VALUE = "__custom__";

export const RpcSettingsDialog = () => {
  const { open, currentRpc, close } = useUnit({
    open: $rpcSettingsOpen,
    currentRpc: $rpcNode,
    close: rpcSettingsClosed,
  });

  const [selected, setSelected] = useState<string>(CUSTOM_VALUE);
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    if (open) {
      const match = PRESETS.find((p) => p.value === currentRpc);
      setSelected(match ? match.value : CUSTOM_VALUE);
      setCustomUrl(match ? "" : currentRpc);
    }
  }, [open, currentRpc]);

  const effectiveUrl = selected === CUSTOM_VALUE ? customUrl.trim() : selected;

  const handleApply = () => {
    if (effectiveUrl) {
      rpcNodeChanged(effectiveUrl);
      close();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="RPC Node"
      description="Select a preset or enter a custom Tezos RPC endpoint."
      titleTextStyle="body-lg"
      descTextStyle="label-md"
    >
      <RadioGroup
        value={selected}
        onValueChange={setSelected}
        name="rpc-preset"
        className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.sm)" })}
      >
        {PRESETS.map((preset) => (
          <RadioCard key={preset.value} value={preset.value}>
            <div
              className={css({
                display: "flex",
                flexDirection: "column",
                minWidth: "0",
                flex: "1",
              })}
            >
              <span
                className={css({
                  textStyle: "body-sm",
                  color: "token(colors.on-surface)",
                })}
              >
                {preset.label}
              </span>
              <span
                className={css({
                  textStyle: "label-md",
                  color: "token(colors.on-surface-variant)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                })}
              >
                {preset.value}
              </span>
            </div>
          </RadioCard>
        ))}

        <RadioCard value={CUSTOM_VALUE}>
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              minWidth: "0",
              flex: "1",
              gap: "token(spacing.xs)",
            })}
          >
            <span
              className={css({
                textStyle: "body-sm",
                color: "token(colors.on-surface)",
              })}
            >
              Custom
            </span>
            {selected === CUSTOM_VALUE && (
              <Input
                label="Custom RPC URL"
                placeholder="https://..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
            )}
          </div>
        </RadioCard>
      </RadioGroup>

      <Button
        onClick={handleApply}
        disabled={!effectiveUrl}
        className={css({ marginTop: "token(spacing.md)" })}
      >
        Apply
      </Button>
    </Dialog>
  );
};
