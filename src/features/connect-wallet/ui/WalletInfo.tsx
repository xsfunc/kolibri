import { useUnit } from "effector-react";
import { $walletPKH, $isConnected } from "@/entities/wallet/model/model";
import { disconnectFx } from "../model/model";
import { Button } from "@/shared/ui/Button";
import { css } from "../../../../styled-system/css";
import { truncateAddress } from "@/shared/lib/format";

export const WalletInfo = () => {
  const { pkh, isConnected, disconnect, pending } = useUnit({
    pkh: $walletPKH,
    isConnected: $isConnected,
    disconnect: disconnectFx,
    pending: disconnectFx.pending,
  });

  const short = pkh ? truncateAddress(pkh) : "";

  return (
    <div className={css({ display: "flex", alignItems: "center", gap: "token(spacing.sm)" })}>
      <span
        className={css({
          textStyle: "body-sm",
          fontFamily: "monospace",
          color: "token(colors.on-surface)",
        })}
        title={pkh ?? ""}
      >
        {short}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => disconnect()}
        disabled={pending || !isConnected}
        loading={pending}
      >
        Disconnect
      </Button>
    </div>
  );
};
