import { sample, combine, createEvent } from "effector";
import { restoreSessionFx } from "@/features/connect-wallet";
import { loadGlobalDataFx, loadOvensFx, ovensReset } from "@/entities/oven";
import { walletConnected, walletDisconnected, $walletPKH, $isConnected } from "@/entities/wallet";
import { rpcNodeChanged } from "@/entities/rpc";

export const appStarted = createEvent();

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

// ─── On RPC node change — reload data ─────────────────────────────────────────

const $rpcReloadPayload = combine({
  pkh: $walletPKH,
  isConnected: $isConnected,
});

sample({
  clock: rpcNodeChanged,
  target: [ovensReset, loadGlobalDataFx],
});

sample({
  clock: rpcNodeChanged,
  source: $rpcReloadPayload,
  filter: ({ isConnected }) => isConnected,
  fn: ({ pkh }) => pkh!,
  target: loadOvensFx,
});
