import { sample } from "effector";
import { appStarted } from "@/shared/model/init";
import { restoreSessionFx } from "@/features/connect-wallet/model/model";
import { loadGlobalDataFx, loadOvensFx } from "@/entities/oven/model/loadOvens";
import { walletConnected, walletDisconnected } from "@/entities/wallet/model/model";
import { ovensReset } from "@/entities/oven/model/model";

// ─── On app start ────────────────────────────────────────────────────────────

sample({
  clock: appStarted,
  target: [restoreSessionFx, loadGlobalDataFx],
});

sample({
  clock: walletConnected,
  fn: ({ pkh }) => pkh,
  target: loadOvensFx,
});

// ─── On wallet disconnect — reset ovens ──────────────────────────────────────

sample({
  clock: walletDisconnected,
  target: ovensReset,
});
