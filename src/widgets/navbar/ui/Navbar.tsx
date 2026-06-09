import { useUnit } from "effector-react";
import { $isConnected } from "@/entities/wallet/model/model";
import { ConnectButton } from "@/features/connect-wallet/ui/ConnectButton";
import { WalletInfo } from "@/features/connect-wallet/ui/WalletInfo";
import { rpcSettingsOpened } from "@/features/rpc-settings";
import { button } from "@/shared/ui/styles";
import { css } from "../../../../styled-system/css";
import { CodeXml, Settings } from "lucide-react";

export const Navbar = () => {
  const isConnected = useUnit($isConnected);

  return (
    <header
      className={css({
        position: "fixed",
        top: "0",
        width: "100%",
        zIndex: "50",
        bg: "rgba(18, 20, 20, 0.6)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "64px",
        paddingLeft: { base: "token(spacing.margin-mobile)", md: "token(spacing.margin-desktop)" },
        paddingRight: { base: "token(spacing.margin-mobile)", md: "token(spacing.margin-desktop)" },
      })}
    >
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "0",
        })}
      >
        <span
          className={css({
            fontSize: "16px",
            lineHeight: "1.2",
            color: "token(colors.primary-fixed-dim)",
            fontWeight: "800",
            letterSpacing: "-0.04em",
          })}
        >
          Kolibri
        </span>
        <span
          className={css({
            fontSize: "11px",
            lineHeight: "1.2",
            color: "token(colors.on-surface-variant)",
          })}
        >
          Dashboard by{" "}
          <a
            href="https://x.com/xsfunc"
            target="_blank"
            rel="noopener noreferrer"
            className={css({
              color: "token(colors.on-surface-variant)",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
              _hover: { color: "token(colors.primary-fixed-dim)" },
            })}
          >
            xsfunc
          </a>
        </span>
      </div>
      <div className={css({ display: "flex", alignItems: "center", gap: "token(spacing.sm)" })}>
        <a
          href="https://github.com/xsfunc/kolibri"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          title="Github Repository"
          className={button({ variant: "icon", size: "sm" })}
          style={{ color: "var(--colors-on-surface-variant)" }}
        >
          <CodeXml size={16} />
        </a>
        {isConnected ? <WalletInfo /> : <ConnectButton />}
        <button
          onClick={() => rpcSettingsOpened()}
          aria-label="RPC settings"
          className={button({ variant: "icon", size: "sm" })}
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
