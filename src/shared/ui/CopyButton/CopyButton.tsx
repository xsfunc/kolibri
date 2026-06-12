import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { css } from "styled-system/css";

interface CopyButtonProps {
  value: string;
  label?: string;
  size?: number;
}

export const CopyButton = ({ value, label = "Copy to clipboard", size = 12 }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={copied ? "Copied" : label}
      className={css({
        display: "inline-flex",
        alignItems: "center",
        verticalAlign: "-0.125em",
        marginLeft: "4px",
        padding: "2px",
        border: "none",
        borderRadius: "token(radii.sm)",
        bg: "transparent",
        cursor: "pointer",
        color: "token(colors.on-surface-variant)",
        transition: "color 150ms ease",
        _hover: { color: "token(colors.primary-fixed-dim)" },
        _active: { transform: "scale(0.9)" },
      })}
    >
      {copied ? (
        <Check size={size} className={css({ color: "token(colors.primary-fixed-dim)" })} />
      ) : (
        <Copy size={size} />
      )}
    </button>
  );
};
