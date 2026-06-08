import { useEffect } from "react";
import { Providers } from "./providers";
import { Navbar } from "../widgets/navbar";
import { OvensPage } from "../pages/ovens";
import { RpcSettingsDialog } from "../features/rpc-settings";
import { appStarted } from "../shared/model/init";
import "./styles/global.css";
// Import app init graph to register all sample wiring
import "./model/init";

export const App = () => {
  useEffect(() => {
    appStarted();
  }, []);

  return (
    <Providers>
      <div className="root">
        <Navbar />
        <OvensPage />
        <RpcSettingsDialog />
      </div>
    </Providers>
  );
};
