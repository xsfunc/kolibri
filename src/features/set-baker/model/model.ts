import type { BeaconWallet } from "@taquito/beacon-wallet";
import { createEffect, sample, attach } from "effector";
import { getOvenClient } from "@/shared/api/tezos/sdk";
import { $wallet } from "@/entities/wallet/model/model";
import { refreshOvenFx } from "@/entities/oven/model/loadOvens";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SetBakerParams {
  ovenAddress: string;
  baker: string | null;
}

interface SetBakerInternal extends SetBakerParams {
  wallet: BeaconWallet;
}

// ─── Raw effect (accept wallet explicitly) ───────────────────────────────────

const setBakerRawFx = createEffect(async ({ ovenAddress, baker, wallet }: SetBakerInternal) => {
  const client = getOvenClient(wallet, ovenAddress);
  await client.setBaker(baker);
  return ovenAddress;
});

// ─── Attached effect (auto-inject wallet from store) ─────────────────────────

export const setBakerFx = attach({
  source: $wallet,
  effect: setBakerRawFx,
  mapParams: (params: SetBakerParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return { ...params, wallet };
  },
});

// ─── Wiring: after setting baker → refresh oven ──────────────────────────────

sample({
  clock: setBakerFx.doneData,
  target: refreshOvenFx,
});
