import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { dialogBackdrop, dialogPopup } from "@/shared/ui/styles";
import { css } from "../../../../styled-system/css";
import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
}

export const Dialog = ({ open, onClose, title, description, children }: DialogProps) => (
  <BaseDialog.Root
    open={open}
    onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}
  >
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={dialogBackdrop()} />
      <BaseDialog.Popup className={dialogPopup()}>
        {title && (
          <BaseDialog.Title
            className={css({
              textStyle: "headline-sm",
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
              textStyle: "body-sm",
              color: "token(colors.on-surface-variant)",
              marginBottom: "token(spacing.md)",
            })}
          >
            {description}
          </BaseDialog.Description>
        )}
        {children}
        <BaseDialog.Close
          className={css({
            position: "absolute",
            top: "token(spacing.md)",
            right: "token(spacing.md)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.25rem",
            lineHeight: "1",
            color: "token(colors.on-surface-variant)",
            _hover: { color: "token(colors.on-surface)" },
          })}
        >
          ✕
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  </BaseDialog.Root>
);
