import { useEffect } from "react";
import { Providers } from "./providers";
import { Navbar } from "../widgets/navbar";
import { OvensPage } from "../pages/ovens";
import { RpcSettingsDialog } from "../features/rpc-settings";
import { appStarted } from "../shared/model/init";
import "./styles/global.css";
import "./model/init";

export const App = () => {
  useEffect(() => {
    appStarted();
  }, []);

  return (
    <Providers>
      <Navbar />
      <OvensPage />
      <RpcSettingsDialog />
    </Providers>
  );
};
