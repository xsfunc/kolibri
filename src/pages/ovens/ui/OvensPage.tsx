import { useUnit } from "effector-react";
import { Stats } from "@/widgets/stats";
import { WalletBalances } from "@/widgets/wallet-balances";
import { OvenList } from "@/widgets/oven-list";
import { ConnectPrompt } from "@/features/connect-wallet";
import { $walletState } from "@/entities/wallet";
import { card, skeleton } from "@/shared/ui/styles";
import { css, cx } from "styled-system/css";

export const OvensPage = () => {
  const walletState = useUnit($walletState);

  return (
    <main
      className={css({
        paddingTop: "88px",
        paddingBottom: "token(spacing.xl)",
        paddingLeft: { base: "token(spacing.margin-mobile)", md: "token(spacing.margin-desktop)" },
        paddingRight: { base: "token(spacing.margin-mobile)", md: "token(spacing.margin-desktop)" },
        maxWidth: "token(sizes.content-max)",
        width: "100%",
        margin: "0 auto",
      })}
    >
      <div className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.lg)" })}>
        <Stats />
        {walletState === "CONNECTED" && <WalletBalances />}
        {walletState === "CONNECTED" ? (
          <OvenList />
        ) : walletState === "INITIALIZING" ? (
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
              <div className={cx(skeleton({ shape: "circle" }), css({ margin: "0 auto" }))} />
              <div className={cx(skeleton({ shape: "heading" }), css({ margin: "0 auto" }))} />
              <div className={cx(skeleton({ shape: "text" }), css({ margin: "0 auto" }))} />
              <div
                className={cx(
                  skeleton({ shape: "block" }),
                  css({ maxWidth: "200px", margin: "0 auto" }),
                )}
              />
            </div>
          </section>
        ) : (
          <ConnectPrompt />
        )}
      </div>
    </main>
  );
};
