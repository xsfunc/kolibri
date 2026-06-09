import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { dialogBackdrop, dialogPopup, button } from "@/shared/ui/styles";
import { css } from "styled-system/css";
import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  titleTextStyle?: string;
  descTextStyle?: string;
}

export const Dialog = ({
  open,
  onClose,
  title,
  description,
  children,
  className,
  titleTextStyle = "headline-sm",
  descTextStyle = "body-sm",
}: DialogProps) => (
  <BaseDialog.Root
    open={open}
    onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}
  >
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={dialogBackdrop()} />
      <BaseDialog.Popup className={`${dialogPopup()} ${className ?? ""}`}>
        {title && (
          <BaseDialog.Title
            className={css({
              textStyle: titleTextStyle,
              color: "token(colors.on-surface)",
              margin: "0 0 token(spacing.md)",
            })}
          >
            {title}
          </BaseDialog.Title>
        )}
        {description && (
          <BaseDialog.Description
            className={css({
              textStyle: descTextStyle,
              color: "token(colors.on-surface-variant)",
              marginBottom: "token(spacing.md)",
            })}
          >
            {description}
          </BaseDialog.Description>
        )}
        {children}
        <BaseDialog.Close
          className={button({ variant: "icon", size: "sm" })}
          style={{ position: "absolute", top: "16px", right: "16px" }}
        >
          ✕
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  </BaseDialog.Root>
);
