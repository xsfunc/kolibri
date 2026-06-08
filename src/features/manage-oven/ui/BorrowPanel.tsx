import { useState } from "react";
import { useUnit } from "effector-react";
import { borrowFx } from "../model/model";
import BigNumber from "bignumber.js";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { css } from "../../../../styled-system/css";

interface BorrowPanelProps {
  ovenAddress: string;
  onClose: () => void;
}

export const BorrowPanel = ({ ovenAddress, onClose }: BorrowPanelProps) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const { borrow, pending } = useUnit({ borrow: borrowFx, pending: borrowFx.pending });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    const shard = new BigNumber(amount).multipliedBy(1e18).integerValue().toString();
    try {
      await borrow({ ovenAddress, amount: shard });
      onClose();
    } catch {
      setError("Borrow failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.md)" })}
    >
      <Input
        label="Amount (kUSD)"
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          setError("");
        }}
        placeholder="0.00"
        suffix="kUSD"
        error={error}
        id="borrow-amount"
      />
      <Button type="submit" disabled={pending || !amount} loading={pending}>
        Borrow
      </Button>
    </form>
  );
};
