import { createStore, createEvent, createEffect } from "effector";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BakerInfo {
  address: string;
  alias: string | null;
  stakingBalance: number;
  numDelegators: number;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export const bakersLoaded = createEvent<BakerInfo[]>();
export const bakerSearchChanged = createEvent<string>();

// ─── Effects ─────────────────────────────────────────────────────────────────

export const loadBakersFx = createEffect(async () => {
  const response = await fetch(
    "https://api.tzkt.io/v1/delegates?active=true&sort.desc=stakingBalance&limit=100",
  );
  const data: BakerInfo[] = await response.json();
  return data.map((b) => ({
    address: b.address,
    alias: b.alias ?? null,
    stakingBalance: b.stakingBalance ?? 0,
    numDelegators: b.numDelegators ?? 0,
  }));
});

// ─── Stores ──────────────────────────────────────────────────────────────────

export const $bakers = createStore<BakerInfo[]>([])
  .on(bakersLoaded, (_, bakers) => bakers)
  .on(loadBakersFx.doneData, (_, bakers) => bakers);

export const $bakerSearch = createStore<string>("").on(bakerSearchChanged, (_, query) => query);

export const $bakersLoading = loadBakersFx.pending;

/** Filtered bakers based on search query */
export const $filteredBakers = $bakers.map((bakers) => bakers); // filtered in component via $bakerSearch
