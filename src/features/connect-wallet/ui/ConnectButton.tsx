import { useUnit } from "effector-react";
import { connectWalletFx } from "../model/model";
import { button } from "@/shared/ui/styles";

export const ConnectButton = () => {
  const { connect, pending } = useUnit({
    connect: connectWalletFx,
    pending: connectWalletFx.pending,
  });

  return (
    <button
      onClick={() => connect()}
      disabled={pending}
      className={button({ variant: "primary", size: "sm" })}
    >
      {pending ? "…" : "Connect Wallet"}
    </button>
  );
};
