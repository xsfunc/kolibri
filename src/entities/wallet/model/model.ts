import { createStore, createEvent } from "effector";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import type { BigNumber } from "@/shared/lib/bignumber";

// ─── Types ───────────────────────────────────────────────────────────────────

export type WalletState = "INITIALIZING" | "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR";

export interface WalletConnectedPayload {
  wallet: BeaconWallet;
  pkh: string;
}

export interface WalletBalances {
  kUSD: BigNumber;
  xtz: BigNumber;
}

// ─── Events ──────────────────────────────────────────────────────────────────

/** Wallet successfully connected (Beacon returned pkh) */
export const walletConnected = createEvent<WalletConnectedPayload>();

/** User disconnected wallet */
export const walletDisconnected = createEvent();

/** Intermediate state — connecting in progress */
export const walletConnecting = createEvent();

/** Connection error */
export const walletErrored = createEvent<string>();

/** Balances updated */
export const balancesUpdated = createEvent<WalletBalances>();

/** Session check finished with no active wallet */
export const sessionCheckDone = createEvent();

// ─── Stores ──────────────────────────────────────────────────────────────────

export const $walletState = createStore<WalletState>("INITIALIZING")
  .on(walletConnecting, () => "CONNECTING")
  .on(walletConnected, () => "CONNECTED")
  .on(walletDisconnected, () => "DISCONNECTED")
  .on(walletErrored, () => "ERROR")
  .on(sessionCheckDone, () => "DISCONNECTED");

export const $walletPKH = createStore<string | null>(null)
  .on(walletConnected, (_, { pkh }) => pkh)
  .on(walletDisconnected, () => null);

export const $wallet = createStore<BeaconWallet | null>(null)
  .on(walletConnected, (_, { wallet }) => wallet)
  .on(walletDisconnected, () => null);

export const $walletBalance = createStore<BigNumber | null>(null)
  .on(balancesUpdated, (_, { kUSD }) => kUSD)
  .on(walletDisconnected, () => null);

export const $walletBalanceXTZ = createStore<BigNumber | null>(null)
  .on(balancesUpdated, (_, { xtz }) => xtz)
  .on(walletDisconnected, () => null);

// ─── Derived ─────────────────────────────────────────────────────────────────

/** true if wallet is connected and pkh is known */
export const $isConnected = $walletState.map((s) => s === "CONNECTED");

/** true while session restore is in progress */
export const $isInitializing = $walletState.map((s) => s === "INITIALIZING");
