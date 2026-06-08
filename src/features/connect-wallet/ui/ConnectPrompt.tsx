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
        paddingTop: "token(spacing.md)",
      })}
    >
      <div
        className={cx(
          card(),
          css({
            width: "100%",
            alignItems: "center",
            textAlign: "center",
            gap: "token(spacing.sm)",
            paddingBlock: "token(spacing.xl)",
          }),
        )}
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
          })}
        >
          <Wallet size={28} className={cx(css({ color: "token(colors.primary-fixed-dim)" }))} />
        </div>
        <h2
          className={css({
            textStyle: "headline-sm",
            color: "token(colors.on-surface)",
            fontWeight: "600",
            margin: "0",
          })}
        >
          Connect Your Wallet
        </h2>
        <p
          className={css({
            textStyle: "body-sm",
            color: "token(colors.on-surface-variant)",
            margin: "0",
          })}
        >
          To manage your ovens and view your positions
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => connect()}
          loading={pending}
          className={css({ marginTop: "token(spacing.sm)" })}
        >
          Connect Wallet
        </Button>
      </div>
    </section>
  );
};
