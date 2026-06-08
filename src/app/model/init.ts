import { sample } from "effector";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import { appStarted } from "@/shared/model/init";
import { restoreSessionFx } from "@/features/connect-wallet/model/model";
import { loadGlobalDataFx, loadOvensFx } from "@/entities/oven/model/loadOvens";
import { walletDisconnected } from "@/entities/wallet/model/model";
import { ovensReset } from "@/entities/oven/model/model";

// ─── On app start ────────────────────────────────────────────────────────────

// Restore Beacon session + load global data in parallel
sample({
  clock: appStarted,
  target: [restoreSessionFx, loadGlobalDataFx],
});

// If session restored — load user ovens
sample({
  clock: restoreSessionFx.doneData,
  filter: (payload): payload is { wallet: BeaconWallet; pkh: string } => payload !== null,
  fn: (payload: { wallet: BeaconWallet; pkh: string }) => payload.pkh,
  target: loadOvensFx,
});

// ─── On wallet disconnect — reset ovens ──────────────────────────────────────

sample({
  clock: walletDisconnected,
  target: ovensReset,
});
