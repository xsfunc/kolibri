import { useState, useEffect } from "react";
import { useUnit } from "effector-react";
import { $rpcNode, rpcNodeChanged } from "@/shared/api/tezos/rpc";
import { $rpcSettingsOpen, rpcSettingsClosed } from "../model/model";
import { Dialog } from "@/shared/ui/Dialog";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { css } from "../../../../styled-system/css";

const PRESETS = [
  { label: "tzkt (Default)", value: "https://rpc.tzkt.io/mainnet" },
  { label: "SmartPy", value: "https://mainnet.smartpy.io" },
  { label: "Tezarago", value: "https://mainnet.tezarago.com" },
] as const;

const CUSTOM_VALUE = "__custom__";

export const RpcSettingsDialog = () => {
  const { open, currentRpc, close } = useUnit({
    open: $rpcSettingsOpen,
    currentRpc: $rpcNode,
    close: rpcSettingsClosed,
  });

  const [selected, setSelected] = useState(CUSTOM_VALUE);
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
    >
      <div className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.md)" })}>
        {PRESETS.map((preset) => (
          <label
            key={preset.value}
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "token(spacing.sm)",
              cursor: "pointer",
              textStyle: "body-md",
              color: "token(colors.on-surface)",
            })}
          >
            <input
              type="radio"
              name="rpc-preset"
              value={preset.value}
              checked={selected === preset.value}
              onChange={() => setSelected(preset.value)}
            />
            <span>{preset.label}</span>
            <span
              className={css({
                textStyle: "body-sm",
                color: "token(colors.on-surface-variant)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              })}
            >
              {preset.value}
            </span>
          </label>
        ))}

        <label
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "token(spacing.sm)",
            cursor: "pointer",
            textStyle: "body-md",
            color: "token(colors.on-surface)",
          })}
        >
          <input
            type="radio"
            name="rpc-preset"
            value={CUSTOM_VALUE}
            checked={selected === CUSTOM_VALUE}
            onChange={() => setSelected(CUSTOM_VALUE)}
          />
          <span>Custom</span>
        </label>

        {selected === CUSTOM_VALUE && (
          <Input
            label="Custom RPC URL"
            placeholder="https://..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
        )}

        <Button onClick={handleApply} disabled={!effectiveUrl}>
          Apply
        </Button>
      </div>
    </Dialog>
  );
};
