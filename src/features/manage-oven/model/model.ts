import { createEffect, createEvent, sample, attach } from "effector";
import { getOvenClient } from "@/shared/api/tezos/sdk";
import { $wallet } from "@/entities/wallet";
import { refreshOvenFx } from "@/entities/oven";
import { BigNumber } from "@/shared/lib/bignumber";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OvenActionParams {
  ovenAddress: string;
  amount: string;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export const txSubmitted = createEvent<string>();
export const txConfirmed = createEvent<string>();

// ─── Raw effects (verify wallet connected) ───────────────────────────────────

const depositRawFx = createEffect(async ({ ovenAddress, amount }: OvenActionParams) => {
  const client = getOvenClient(ovenAddress);
  await client.deposit(new BigNumber(amount));
  return ovenAddress;
});

const withdrawRawFx = createEffect(async ({ ovenAddress, amount }: OvenActionParams) => {
  const client = getOvenClient(ovenAddress);
  await client.withdraw(new BigNumber(amount));
  return ovenAddress;
});

const borrowRawFx = createEffect(async ({ ovenAddress, amount }: OvenActionParams) => {
  const client = getOvenClient(ovenAddress);
  await client.borrow(new BigNumber(amount));
  return ovenAddress;
});

const repayRawFx = createEffect(async ({ ovenAddress, amount }: OvenActionParams) => {
  const client = getOvenClient(ovenAddress);
  await client.repay(new BigNumber(amount));
  return ovenAddress;
});

// ─── Attached effects (guard: wallet must be connected) ──────────────────────

export const depositFx = attach({
  source: $wallet,
  effect: depositRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return params;
  },
});

export const withdrawFx = attach({
  source: $wallet,
  effect: withdrawRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return params;
  },
});

export const borrowFx = attach({
  source: $wallet,
  effect: borrowRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return params;
  },
});

export const repayFx = attach({
  source: $wallet,
  effect: repayRawFx,
  mapParams: (params: OvenActionParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return params;
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
