import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { input } from "@/shared/ui/styles";
import { css } from "styled-system/css";
import type { InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  description?: string;
  suffix?: string;
}

export const Input = ({
  label,
  error,
  description,
  suffix,
  className,
  id,
  ...props
}: InputProps) => {
  const inputClasses = input();

  return (
    <Field.Root>
      {label && (
        <Field.Label
          className={css({
            display: "block",
            textStyle: "label-md",
            color: "token(colors.on-surface-variant)",
            marginBottom: "token(spacing.xs)",
          })}
          htmlFor={id}
        >
          {label}
        </Field.Label>
      )}
      <div className={css({ display: "flex", alignItems: "center" })}>
        <BaseInput id={id} className={`${inputClasses} ${className ?? ""}`} {...props} />
        {suffix && (
          <span
            className={css({
              marginLeft: "token(spacing.xs)",
              color: "token(colors.on-surface-variant)",
              textStyle: "body-sm",
              flexShrink: "0",
            })}
          >
            {suffix}
          </span>
        )}
      </div>
      {description && (
        <Field.Description
          className={css({
            textStyle: "body-sm",
            color: "token(colors.on-surface-variant)",
            marginTop: "token(spacing.xs)",
          })}
        >
          {description}
        </Field.Description>
      )}
      {error && (
        <Field.Error
          className={css({
            textStyle: "body-sm",
            color: "token(colors.error)",
            marginTop: "token(spacing.xs)",
          })}
        >
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
};
