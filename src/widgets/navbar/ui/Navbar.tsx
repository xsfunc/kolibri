import { useUnit } from "effector-react";
import { $isConnected } from "@/entities/wallet/model/model";
import { ConnectButton } from "@/features/connect-wallet/ui/ConnectButton";
import { WalletInfo } from "@/features/connect-wallet/ui/WalletInfo";
import { rpcSettingsOpened } from "@/features/rpc-settings";
import { Button } from "@/shared/ui/Button";
import { css } from "../../../../styled-system/css";

export const Navbar = () => {
  const isConnected = useUnit($isConnected);

  return (
    <nav
      aria-label="Main"
      className={css({
        borderTop: "3px solid token(colors.primary-container)",
        padding: "0 token(spacing.margin-desktop)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "56px",
      })}
    >
      <span className={css({ textStyle: "headline-sm", color: "token(colors.surface-tint)" })}>
        Kolibri
      </span>
      <div className={css({ display: "flex", alignItems: "center", gap: "token(spacing.sm)" })}>
        {isConnected ? <WalletInfo /> : <ConnectButton />}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => rpcSettingsOpened()}
          aria-label="RPC settings"
        >
          ⚙
        </Button>
      </div>
    </nav>
  );
};
