import { useState } from "react";
import { useUnit } from "effector-react";
import { withdrawFx } from "../model/model";
import BigNumber from "bignumber.js";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { css } from "../../../../styled-system/css";

interface WithdrawPanelProps {
  ovenAddress: string;
  onClose: () => void;
  disabled?: boolean;
}

export const WithdrawPanel = ({ ovenAddress, onClose, disabled }: WithdrawPanelProps) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const { withdraw, pending } = useUnit({ withdraw: withdrawFx, pending: withdrawFx.pending });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    const mutez = new BigNumber(amount).multipliedBy(1e6).integerValue().toString();
    try {
      await withdraw({ ovenAddress, amount: mutez });
      onClose();
    } catch {
      setError("Withdrawal failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.md)" })}
    >
      <Input
        label="Amount (XTZ)"
        type="number"
        min="0"
        step="0.000001"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          setError("");
        }}
        placeholder="0.000000"
        suffix="XTZ"
        error={error}
        id="withdraw-amount"
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled || pending || !amount} loading={pending}>
        Withdraw
      </Button>
    </form>
  );
};
