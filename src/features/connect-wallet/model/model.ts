import { createEffect, sample, attach } from "effector";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { BeaconEvent } from "@taquito/beacon-wallet";
import { NetworkType } from "@ecadlabs/beacon-types";
import {
  walletConnected,
  walletConnecting,
  walletDisconnected,
  walletErrored,
  $wallet,
} from "@/entities/wallet/model/model";

// ─── Effects ─────────────────────────────────────────────────────────────────

export const connectWalletFx = createEffect(async () => {
  const wallet = new BeaconWallet({ name: "Kolibri", network: { type: NetworkType.MAINNET } });
  wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, () => {});
  await wallet.requestPermissions();
  const pkh = await wallet.getPKH();
  return { wallet, pkh };
});

export const disconnectWalletFx = createEffect(async (wallet: BeaconWallet) => {
  await wallet.clearActiveAccount();
});

export const restoreSessionFx = createEffect(async () => {
  const wallet = new BeaconWallet({ name: "Kolibri", network: { type: NetworkType.MAINNET } });
  wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, () => {});
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
  target: walletConnecting,
});

sample({
  clock: connectWalletFx.doneData,
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
  target: walletConnected,
});

sample({
  clock: disconnectFx.done,
  target: walletDisconnected,
});
