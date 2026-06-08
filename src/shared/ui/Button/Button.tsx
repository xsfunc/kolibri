import { button } from "@/shared/ui/styles";
import { Button as BaseButton } from "@base-ui/react/button";
import type { ReactNode, ComponentPropsWithoutRef } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?:
    | "primary"
    | "ghost"
    | "danger"
    | "outlined"
    | "outlined-warning"
    | "outlined-danger"
    | "icon";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  onClick,
  type = "button",
  className,
  style,
  "aria-label": ariaLabel,
}: ButtonProps) => {
  const recipeClasses = button({ variant, size });

  return (
    <BaseButton
      render={(props: ComponentPropsWithoutRef<"button">) => (
        <button
          {...props}
          className={`${recipeClasses} ${className ?? ""}`}
          style={style}
          disabled={disabled || loading}
          aria-busy={loading}
          aria-label={ariaLabel}
          onClick={onClick}
          type={type}
        />
      )}
    >
      {loading ? <span aria-hidden="true">…</span> : children}
    </BaseButton>
  );
};
