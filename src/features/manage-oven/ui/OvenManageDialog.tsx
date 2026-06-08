import { useState } from "react";
import { Dialog } from "@/shared/ui/Dialog";
import { Tabs } from "@/shared/ui/Tabs";
import { DepositPanel } from "./DepositPanel";
import { WithdrawPanel } from "./WithdrawPanel";
import { BorrowPanel } from "./BorrowPanel";
import { RepayPanel } from "./RepayPanel";

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
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        items={[
          {
            value: "deposit",
            label: "Deposit",
            content: <DepositPanel ovenAddress={ovenAddress} onClose={onClose} />,
          },
          {
            value: "withdraw",
            label: "Withdraw",
            content: <WithdrawPanel ovenAddress={ovenAddress} onClose={onClose} />,
          },
          {
            value: "borrow",
            label: "Borrow",
            content: <BorrowPanel ovenAddress={ovenAddress} onClose={onClose} />,
          },
          {
            value: "repay",
            label: "Repay",
            content: <RepayPanel ovenAddress={ovenAddress} onClose={onClose} />,
          },
        ]}
      />
    </Dialog>
  );
};
