import { css } from "styled-system/css";
import { REPO_URL, TELEGRAM_URL } from "@/shared/config/links";

const COMMIT_SHA = import.meta.env.VITE_COMMIT_SHA;

const linkStyle = css({
  color: "token(colors.on-surface-variant)",
  textDecoration: "none",
  textUnderlineOffset: "2px",
  _hover: { color: "token(colors.primary-fixed-dim)", textDecoration: "underline" },
});

export const Footer = () => {
  const shortSha = COMMIT_SHA ? COMMIT_SHA.slice(0, 7) : null;

  return (
    <footer
      className={css({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
        paddingY: "token(spacing.md)",
        paddingLeft: { base: "token(spacing.margin-mobile)", md: "token(spacing.margin-desktop)" },
        paddingRight: { base: "token(spacing.margin-mobile)", md: "token(spacing.margin-desktop)" },
        fontSize: "11px",
        lineHeight: "1.4",
        color: "token(colors.on-surface-variant)",
      })}
    >
      <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={linkStyle}>
        Open source
      </a>
      <span aria-hidden>·</span>
      {shortSha ? (
        <a
          href={`${REPO_URL}/commit/${COMMIT_SHA}`}
          target="_blank"
          rel="noopener noreferrer"
          className={linkStyle}
        >
          {shortSha}
        </a>
      ) : (
        <span>dev</span>
      )}
      <span aria-hidden>·</span>
      <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkStyle}>
        @xsfunc
      </a>
    </footer>
  );
};
