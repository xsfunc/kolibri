import { createEffect, sample, attach, createEvent } from "effector";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import {
  walletConnected,
  walletConnecting,
  walletDisconnected,
  walletErrored,
  sessionCheckDone,
  $wallet,
  $walletState,
} from "@/entities/wallet";
import { setWalletProvider, clearWalletProvider } from "@/shared/api/tezos";

async function createWallet() {
  const { BeaconWallet } = await import("@taquito/beacon-wallet");
  const { BeaconEvent } = await import("@taquito/beacon-wallet");
  const { NetworkType } = await import("@ecadlabs/beacon-types");
  const wallet = new BeaconWallet({ name: "Kolibri", network: { type: NetworkType.MAINNET } });
  void wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, () => {});
  return wallet;
}

export const connectWalletFx = createEffect(async () => {
  const wallet = await createWallet();
  await wallet.requestPermissions();
  const pkh = await wallet.getPKH();
  return { wallet, pkh };
});

export const disconnectWalletFx = createEffect(async (wallet: BeaconWallet) => {
  await wallet.clearActiveAccount();
});

export const restoreSessionFx = createEffect(async () => {
  const wallet = await createWallet();
  const activeAccount = await wallet.client.getActiveAccount();
  if (!activeAccount) return null;
  const pkh = await wallet.getPKH();
  return { wallet, pkh };
});

// ─── Attached effect: disconnect with auto-injected wallet ───────────────────

export const disconnectFx = attach({
  source: $wallet,
  effect: disconnectWalletFx,
  mapParams: (_: void, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return wallet;
  },
});

// ─── Wiring: effects → entity events ─────────────────────────────────────────

sample({
  clock: connectWalletFx,
  source: $walletState,
  filter: (state) => state !== "INITIALIZING",
  target: walletConnecting,
});

sample({
  clock: connectWalletFx.doneData,
  fn: ({ wallet, pkh }) => {
    setWalletProvider(wallet);
    return { wallet, pkh };
  },
  target: walletConnected,
});

sample({
  clock: connectWalletFx.failData,
  fn: (err) => (err instanceof Error ? err.message : String(err)),
  target: walletErrored,
});

sample({
  clock: restoreSessionFx.doneData,
  filter: (payload): payload is { wallet: BeaconWallet; pkh: string } => payload !== null,
  fn: (payload) => {
    const { wallet, pkh } = payload as { wallet: BeaconWallet; pkh: string };
    setWalletProvider(wallet);
    return { wallet, pkh };
  },
  target: walletConnected,
});

sample({
  clock: restoreSessionFx.doneData,
  filter: (payload) => payload === null,
  target: sessionCheckDone,
});

sample({
  clock: restoreSessionFx.failData,
  target: sessionCheckDone,
});

const clearProviderFx = createEffect(() => {
  clearWalletProvider();
});

sample({
  clock: disconnectFx.done,
  target: clearProviderFx,
});

sample({
  clock: disconnectFx.done,
  target: walletDisconnected,
});

// ─── Timeout: fallback if restoreSessionFx hangs ────────────────────────────

const sessionTimeoutTick = createEvent();
const sessionTimeoutFx = createEffect(() => {
  setTimeout(() => sessionTimeoutTick(), 5000);
});

sample({
  clock: restoreSessionFx,
  target: sessionTimeoutFx,
});

sample({
  clock: sessionTimeoutTick,
  source: $walletState,
  filter: (state: string) => state === "INITIALIZING",
  target: sessionCheckDone,
});
