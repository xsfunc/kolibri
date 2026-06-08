import { useUnit } from "effector-react";
import { connectWalletFx } from "../model/model";
import { Button } from "@/shared/ui/Button";

export const ConnectButton = () => {
  const { connect, pending } = useUnit({
    connect: connectWalletFx,
    pending: connectWalletFx.pending,
  });

  return (
    <Button variant="ghost" onClick={() => connect()} loading={pending}>
      Connect Wallet
    </Button>
  );
};
