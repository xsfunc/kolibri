import { useState } from "react";
import { useUnit } from "effector-react";
import { depositFx } from "../model/model";
import BigNumber from "bignumber.js";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { css } from "../../../../styled-system/css";

interface DepositPanelProps {
  ovenAddress: string;
  onClose: () => void;
}

export const DepositPanel = ({ ovenAddress, onClose }: DepositPanelProps) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const { deposit, pending } = useUnit({ deposit: depositFx, pending: depositFx.pending });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    const mutez = new BigNumber(amount).multipliedBy(1e6).integerValue().toString();
    try {
      await deposit({ ovenAddress, amount: mutez });
      onClose();
    } catch {
      setError("Deposit failed");
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
        id="deposit-amount"
      />
      <Button type="submit" disabled={pending || !amount} loading={pending}>
        Deposit
      </Button>
    </form>
  );
};
