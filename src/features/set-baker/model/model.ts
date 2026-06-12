import { attach, combine, createEffect, createEvent, createStore, sample } from "effector";
import { getOvenClient } from "@/shared/api/tezos";
import { $wallet } from "@/entities/wallet";
import { refreshOvenFx } from "@/entities/oven";
import { $bakers, loadBakersFx } from "@/entities/baker";

// ─── Types ───────────────────────────────────────────────────────────────────

export const NO_BAKER_VALUE = "__none__";

interface SetBakerParams {
  ovenAddress: string;
  baker: string | null;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export const bakerDialogOpened = createEvent<string>();
export const bakerDialogClosed = createEvent();
export const bakerSelected = createEvent<string | null>();
export const bakerSubmitted = createEvent();
export const bakerSetConfirmed = createEvent<string>();

// ─── Stores ──────────────────────────────────────────────────────────────────

export const $bakerOvenAddress = createStore<string | null>(null)
  .on(bakerDialogOpened, (_, ovenAddress) => ovenAddress)
  .reset(bakerDialogClosed);

export const $bakerDialogOpen = $bakerOvenAddress.map((ovenAddress) => ovenAddress !== null);
export const $selectedBaker = createStore<string | null>(null)
  .on(bakerSelected, (_, baker) => baker)
  .reset(bakerDialogClosed);

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

// ─── Wiring ──────────────────────────────────────────────────────────────────

sample({
  clock: bakerDialogOpened,
  source: $bakers,
  filter: (bakers) => bakers.length === 0,
  fn: () => undefined,
  target: loadBakersFx,
});

sample({
  clock: bakerSubmitted,
  source: combine({ ovenAddress: $bakerOvenAddress, baker: $selectedBaker }),
  filter: ({ ovenAddress }) => ovenAddress !== null,
  fn: ({ ovenAddress, baker }) => ({
    ovenAddress: ovenAddress!,
    baker: baker === NO_BAKER_VALUE ? null : baker,
  }),
  target: setBakerFx,
});

sample({
  clock: setBakerFx.doneData,
  target: [refreshOvenFx, bakerSetConfirmed],
});

sample({ clock: bakerSetConfirmed, target: bakerDialogClosed });
