import { useEffect, lazy, Suspense } from "react";
import { Providers } from "./providers";
import { Navbar } from "@/widgets/navbar";
import { OvensPage } from "@/pages/ovens";
import { appStarted } from "./model/init";
import "./styles/global.css";

const RpcSettingsDialog = lazy(() =>
  import("@/features/rpc-settings").then((m) => ({
    default: m.RpcSettingsDialog,
  })),
);

const DonateDialog = lazy(() =>
  import("@/features/donate").then((m) => ({
    default: m.DonateDialog,
  })),
);

export const App = () => {
  useEffect(() => {
    appStarted();
  }, []);

  return (
    <Providers>
      <Navbar />
      <OvensPage />
      <Suspense>
        <RpcSettingsDialog />
        <DonateDialog />
      </Suspense>
    </Providers>
  );
};
