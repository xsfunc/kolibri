import { createStore, createEvent } from "effector";
import { loadBakersFx } from "../api/loadBakers";

export interface BakerInfo {
  address: string;
  alias: string | null;
  stakingBalance: number;
  numDelegators: number;
}

export const bakersLoaded = createEvent<BakerInfo[]>();
export const bakerSearchChanged = createEvent<string>();

export { loadBakersFx } from "../api/loadBakers";

export const $bakers = createStore<BakerInfo[]>([])
  .on(bakersLoaded, (_, bakers) => bakers)
  .on(loadBakersFx.doneData, (_, bakers) => bakers);

export const $bakerSearch = createStore<string>("").on(bakerSearchChanged, (_, query) => query);

export const $bakersLoading = loadBakersFx.pending;

export const $filteredBakers = $bakers.map((bakers) => bakers);
