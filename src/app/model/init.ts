import { sample, combine } from "effector";
import { appStarted } from "@/shared/model/init";
import { restoreSessionFx } from "@/features/connect-wallet/model/model";
import { loadGlobalDataFx, loadOvensFx } from "@/entities/oven/model/loadOvens";
import { walletConnected, walletDisconnected } from "@/entities/wallet/model/model";
import { ovensReset } from "@/entities/oven/model/model";
import { rpcNodeChanged } from "@/shared/api/tezos/rpc";
import { $walletPKH, $isConnected } from "@/entities/wallet/model/model";
import "@/entities/wallet/model/loadBalances";

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
