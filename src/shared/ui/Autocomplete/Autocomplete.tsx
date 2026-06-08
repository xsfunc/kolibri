import { useState, useRef, useEffect } from "react";
import { input } from "@/shared/ui/styles";
import { css } from "../../../../styled-system/css";

interface AutocompleteOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  label?: string;
  loading?: boolean;
}

export const Autocomplete = ({
  options,
  value,
  onChange,
  placeholder = "Search…",
  label,
  loading,
}: AutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      o.value.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={css({ position: "relative" })}>
      {label && (
        <label
          className={css({
            display: "block",
            textStyle: "label-md",
            color: "token(colors.on-surface-variant)",
            marginBottom: "token(spacing.xs)",
          })}
        >
          {label}
        </label>
      )}
      <input
        className={input()}
        placeholder={placeholder}
        value={selected ? selected.label : query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && (
        <div
          role="listbox"
          className={css({
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            bg: "rgba(40, 42, 42, 0.9)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "token(radii.DEFAULT)",
            marginTop: "token(spacing.xs)",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: "1100",
          })}
        >
          {loading ? (
            <div
              className={css({
                padding: "token(spacing.md)",
                textAlign: "center",
                color: "token(colors.on-surface-variant)",
                textStyle: "body-sm",
              })}
            >
              Loading…
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={css({
                  padding: "token(spacing.xs) token(spacing.md)",
                  cursor: "pointer",
                  transition: "background 150ms ease",
                  _hover: { bg: "rgba(0, 255, 163, 0.06)" },
                  bg: opt.value === value ? "rgba(0, 255, 163, 0.1)" : undefined,
                })}
                onClick={() => {
                  onChange(opt.value);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <div className={css({ textStyle: "body-sm", color: "token(colors.on-surface)" })}>
                  {opt.label}
                </div>
                {opt.sublabel && (
                  <div
                    className={css({
                      textStyle: "label-sm",
                      color: "token(colors.on-surface-variant)",
                    })}
                  >
                    {opt.sublabel}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
