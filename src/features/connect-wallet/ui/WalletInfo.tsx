import { useUnit } from "effector-react";
import { $walletPKH, $isConnected } from "@/entities/wallet/model/model";
import { disconnectFx } from "../model/model";
import { button } from "@/shared/ui/styles";
import { css } from "../../../../styled-system/css";
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
        gap: "token(spacing.xs)",
        bg: "rgba(0, 255, 163, 0.08)",
        borderRadius: "token(radii.full)",
        px: "3",
        py: "1",
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
      <button
        onClick={() => disconnect()}
        disabled={pending || !isConnected}
        aria-label="Disconnect wallet"
        className={button({ variant: "icon", size: "sm" })}
      >
        <LogOut size={14} />
      </button>
    </div>
  );
};
