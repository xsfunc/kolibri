import { useUnit } from "effector-react";
import { connectWalletFx } from "../model/model";
import { card } from "@/shared/ui/styles";
import { css, cx } from "../../../../styled-system/css";
import { Wallet } from "lucide-react";
import { Button } from "@/shared/ui/Button";

export const ConnectPrompt = () => {
  const { connect, pending } = useUnit({
    connect: connectWalletFx,
    pending: connectWalletFx.pending,
  });

  return (
    <section
      className={css({
        display: "flex",
        justifyContent: "center",
        paddingTop: "token(spacing.xl)",
      })}
    >
      <div
        className={card()}
        style={{ maxWidth: "400px", width: "100%", alignItems: "center", textAlign: "center" }}
      >
        <div
          className={css({
            width: "56px",
            height: "56px",
            borderRadius: "token(radii.full)",
            bg: "rgba(0, 226, 144, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "token(spacing.lg)",
          })}
        >
          <Wallet size={28} className={cx(css({ color: "token(colors.primary-fixed-dim)" }))} />
        </div>
        <h2
          className={css({
            textStyle: "headline-sm",
            color: "token(colors.on-surface)",
            fontWeight: "600",
            margin: "0 0 token(spacing.sm)",
          })}
        >
          Connect Your Wallet
        </h2>
        <p
          className={css({
            textStyle: "body-sm",
            color: "token(colors.on-surface-variant)",
            margin: "0 0 token(spacing.lg)",
          })}
        >
          To manage your ovens and view your positions
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => connect()}
          loading={pending}
          className={css({ width: "100%" })}
        >
          Connect Wallet
        </Button>
      </div>
    </section>
  );
};
