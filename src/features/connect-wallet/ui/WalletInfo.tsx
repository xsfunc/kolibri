import { useUnit } from "effector-react";
import { $walletPKH, $isConnected } from "@/entities/wallet/model/model";
import { disconnectFx } from "../model/model";
import { css } from "../../../../styled-system/css";
import { Button } from "@/shared/ui/Button";
import { truncateAddress } from "@/shared/lib/format";
import { LogOut } from "lucide-react";

export const WalletInfo = () => {
  const { pkh, isConnected, disconnect, pending } = useUnit({
    pkh: $walletPKH,
    isConnected: $isConnected,
    disconnect: disconnectFx,
    pending: disconnectFx.pending,
  });

  const short = pkh ? truncateAddress(pkh) : "";

  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        gap: "token(spacing.sm)",
        bg: "rgba(0, 255, 163, 0.08)",
        borderRadius: "token(radii.full)",
        px: "3",
        py: "2",
      })}
    >
      <span
        className={css({
          textStyle: "label-md",
          fontFamily: "monospace",
          color: "token(colors.primary-fixed-dim)",
        })}
        title={pkh ?? ""}
      >
        {short}
      </span>
      <Button
        variant="icon"
        size="sm"
        onClick={() => disconnect()}
        disabled={pending || !isConnected}
        aria-label="Disconnect wallet"
      >
        <LogOut size={14} />
      </Button>
    </div>
  );
};
