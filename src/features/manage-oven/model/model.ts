import { createEffect, createEvent, sample, attach } from "effector";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import { getOvenClient } from "@/shared/api/tezos/sdk";
import { $wallet } from "@/entities/wallet/model/model";
import { refreshOvenFx } from "@/entities/oven/model/loadOvens";
import BigNumber from "bignumber.js";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OvenActionParams {
  ovenAddress: string;
  amount: string;
}

interface OvenActionInternal extends OvenActionParams {
  wallet: BeaconWallet;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export const txSubmitted = createEvent<string>();
export const txConfirmed = createEvent<string>();

// ─── Raw effects (accept wallet explicitly) ──────────────────────────────────

const depositRawFx = createEffect(async ({ ovenAddress, amount, wallet }: OvenActionInternal) => {
  const client = getOvenClient(wallet, ovenAddress);
  await client.deposit(new BigNumber(amount));
  return ovenAddress;
});

const withdrawRawFx = createEffect(async ({ ovenAddress, amount, wallet }: OvenActionInternal) => {
  const client = getOvenClient(wallet, ovenAddress);
  await client.withdraw(new BigNumber(amount));
  return ovenAddress;
});

const borrowRawFx = createEffect(async ({ ovenAddress, amount, wallet }: OvenActionInternal) => {
  const client = getOvenClient(wallet, ovenAddress);
  await client.borrow(new BigNumber(amount));
  return ovenAddress;
});

const repayRawFx = createEffect(async ({ ovenAddress, amount, wallet }: OvenActionInternal) => {
  const client = getOvenClient(wallet, ovenAddress);
  await client.repay(new BigNumber(amount));
  return ovenAddress;
});

// ─── Attached effects (auto-inject wallet from store) ────────────────────────

export const depositFx = attach({
  source: $wallet,
  effect: depositRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return { ...params, wallet };
  },
});

export const withdrawFx = attach({
  source: $wallet,
  effect: withdrawRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return { ...params, wallet };
  },
});

export const borrowFx = attach({
  source: $wallet,
  effect: borrowRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return { ...params, wallet };
  },
});

export const repayFx = attach({
  source: $wallet,
  effect: repayRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return { ...params, wallet };
  },
});

// ─── Wiring: after any oven action → refresh oven + confirm tx ───────────────

const allOvenActionsDone = [
  depositFx.doneData,
  withdrawFx.doneData,
  borrowFx.doneData,
  repayFx.doneData,
];

sample({
  clock: allOvenActionsDone,
  target: refreshOvenFx,
});

sample({
  clock: allOvenActionsDone,
  target: txConfirmed,
});
