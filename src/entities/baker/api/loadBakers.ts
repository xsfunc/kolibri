import { createEffect } from "effector";
import type { BakerInfo } from "../model/model";

const TZKT_API = "https://api.tzkt.io/v1";

export const loadBakersFx = createEffect(async (): Promise<BakerInfo[]> => {
  const response = await fetch(
    `${TZKT_API}/delegates?active=true&sort.desc=stakingBalance&limit=100`,
  );
  const data: BakerInfo[] = await response.json();
  return data.map((b) => ({
    address: b.address,
    alias: b.alias ?? null,
    stakingBalance: b.stakingBalance ?? 0,
    numDelegators: b.numDelegators ?? 0,
  }));
});
