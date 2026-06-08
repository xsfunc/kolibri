import { useState } from "react";
import { Dialog } from "@/shared/ui/Dialog";
import { Tabs } from "@/shared/ui/Tabs";
import { DepositPanel } from "./DepositPanel";
import { WithdrawPanel } from "./WithdrawPanel";
import { BorrowPanel } from "./BorrowPanel";
import { RepayPanel } from "./RepayPanel";
import { css } from "../../../../styled-system/css";
import { Construction } from "lucide-react";

interface OvenManageDialogProps {
  ovenAddress: string;
  open: boolean;
  onClose: () => void;
  initialTab?: string;
}

type Tab = "deposit" | "withdraw" | "borrow" | "repay";

export const OvenManageDialog = ({
  ovenAddress,
  open,
  onClose,
  initialTab = "deposit",
}: OvenManageDialogProps) => {
  const [tab, setTab] = useState<Tab>((initialTab as Tab) ?? "deposit");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Manage Oven"
      description="Deposit, withdraw, borrow, or repay in this oven."
    >
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "token(spacing.sm)",
          bg: "rgba(228, 196, 81, 0.1)",
          border: "1px solid token(colors.tertiary-fixed-dim)",
          borderRadius: "token(radii.DEFAULT)",
          padding: "token(spacing.sm) token(spacing.md)",
          marginBottom: "token(spacing.md)",
          color: "token(colors.tertiary-fixed-dim)",
          textStyle: "body-sm",
          fontWeight: "500",
        })}
      >
        <Construction size={16} />
        This functionality is currently under development
      </div>
      <div className={css({ pointerEvents: "none", opacity: 0.5 })}>
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
          items={[
            {
              value: "deposit",
              label: "Deposit",
              content: <DepositPanel ovenAddress={ovenAddress} onClose={onClose} disabled />,
            },
            {
              value: "withdraw",
              label: "Withdraw",
              content: <WithdrawPanel ovenAddress={ovenAddress} onClose={onClose} disabled />,
            },
            {
              value: "borrow",
              label: "Borrow",
              content: <BorrowPanel ovenAddress={ovenAddress} onClose={onClose} disabled />,
            },
            {
              value: "repay",
              label: "Repay",
              content: <RepayPanel ovenAddress={ovenAddress} onClose={onClose} disabled />,
            },
          ]}
        />
      </div>
    </Dialog>
  );
};
