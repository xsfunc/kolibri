import { createEffect, sample, attach } from "effector";
import { getOvenClient } from "@/shared/api/tezos/sdk";
import { $wallet } from "@/entities/wallet";
import { refreshOvenFx } from "@/entities/oven";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SetBakerParams {
  ovenAddress: string;
  baker: string | null;
}

// ─── Raw effect ──────────────────────────────────────────────────────────────

const setBakerRawFx = createEffect(async ({ ovenAddress, baker }: SetBakerParams) => {
  const client = getOvenClient(ovenAddress);
  await client.setBaker(baker);
  return ovenAddress;
});

// ─── Attached effect (guard: wallet must be connected) ───────────────────────

export const setBakerFx = attach({
  source: $wallet,
  effect: setBakerRawFx,
  mapParams: (params: SetBakerParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return params;
  },
});

// ─── Wiring: after setting baker → refresh oven ──────────────────────────────

sample({
  clock: setBakerFx.doneData,
  target: refreshOvenFx,
});
