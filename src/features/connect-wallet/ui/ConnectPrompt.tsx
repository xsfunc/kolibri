import { useUnit } from "effector-react";
import { connectWalletFx } from "../model/model";
import { Button } from "@/shared/ui/Button";
import { css } from "../../../../styled-system/css";

export const ConnectPrompt = () => {
  const { connect, pending } = useUnit({
    connect: connectWalletFx,
    pending: connectWalletFx.pending,
  });

  return (
    <section
      className={css({ textAlign: "center", padding: "token(spacing.xl) token(spacing.lg)" })}
    >
      <h1
        className={css({
          textStyle: "headline-lg",
          color: "token(colors.on-surface)",
          marginBottom: "token(spacing.lg)",
        })}
      >
        Connect Your Wallet To Manage Your Ovens
      </h1>
      <Button variant="primary" size="lg" onClick={() => connect()} loading={pending}>
        Connect Wallet
      </Button>
    </section>
  );
};
