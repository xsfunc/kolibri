import { useUnit } from "effector-react";
import { Stats } from "../../../widgets/stats";
import { OvenList } from "../../../widgets/oven-list";
import { ConnectPrompt } from "../../../features/connect-wallet";
import { $isConnected } from "../../../entities/wallet/model/model";

export const OvensPage = () => {
  const isConnected = useUnit($isConnected);

  return (
    <main>
      <Stats />
      {isConnected ? <OvenList /> : <ConnectPrompt />}
    </main>
  );
};
