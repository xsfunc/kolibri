import { useUnit } from "effector-react";
import { Stats } from "../../../widgets/stats";
import { WalletBalances } from "../../../widgets/wallet-balances";
import { OvenList } from "../../../widgets/oven-list";
import { ConnectPrompt } from "../../../features/connect-wallet";
import { $isConnected } from "../../../entities/wallet/model/model";
import { css } from "../../../../styled-system/css";

export const OvensPage = () => {
  const isConnected = useUnit($isConnected);

  return (
    <main
      className={css({
        paddingTop: "88px",
        paddingBottom: "token(spacing.xl)",
        paddingLeft: { base: "token(spacing.margin-mobile)", md: "token(spacing.margin-desktop)" },
        paddingRight: { base: "token(spacing.margin-mobile)", md: "token(spacing.margin-desktop)" },
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto",
      })}
    >
      <div className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.lg)" })}>
        <Stats />
        <WalletBalances />
        {isConnected ? <OvenList /> : <ConnectPrompt />}
      </div>
    </main>
  );
};
