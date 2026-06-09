import { useEffect, lazy, Suspense } from "react";
import { Providers } from "./providers";
import { Navbar } from "../widgets/navbar";
import { OvensPage } from "../pages/ovens";
import { appStarted } from "../shared/model/init";
import "./styles/global.css";
import "./model/init";

const RpcSettingsDialog = lazy(() =>
  import("@/features/rpc-settings/ui/RpcSettingsDialog").then((m) => ({
    default: m.RpcSettingsDialog,
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
      </Suspense>
    </Providers>
  );
};
