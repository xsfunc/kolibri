import { createEffect, sample, attach } from "effector";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import {
  ovensLoaded,
  ovenUpdated,
  priceDataLoaded,
  minterDataLoaded,
  type OvenData,
  type PriceData,
} from "./model";
import {
  harbingerClient,
  stableCoinClient,
  getOvenClient,
  getMinterData,
} from "@/shared/api/tezos/sdk";
import { $wallet } from "@/entities/wallet/model/model";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchSingleOven(wallet: BeaconWallet, ovenAddress: string): Promise<OvenData> {
  const client = getOvenClient(wallet, ovenAddress);
  const [baker, balance, borrowedTokens, stabilityFee, isLiquidated] = await Promise.all([
    client.getBaker(),
    client.getBalance(),
    client.getBorrowedTokens(),
    client.getStabilityFees(),
    client.isLiquidated(),
  ]);

  const outstandingTokens = borrowedTokens.plus(stabilityFee);

  return {
    ovenAddress,
    ovenOwner: "",
    baker,
    balance,
    borrowedTokens,
    stabilityFee,
    outstandingTokens,
    isLiquidated,
  };
}

// ─── Raw effects (accept wallet explicitly) ──────────────────────────────────

const loadOvensRawFx = createEffect(
  async ({ pkh, wallet }: { pkh: string; wallet: BeaconWallet }) => {
    const addresses: string[] = await stableCoinClient.ovensOwnedByAddress(pkh);

    const ovens = await Promise.all(
      addresses.map(async (addr) => {
        const data = await fetchSingleOven(wallet, addr);
        return { ...data, ovenOwner: pkh };
      }),
    );

    return Object.fromEntries(ovens.map((o) => [o.ovenAddress, o]));
  },
);

const refreshOvenRawFx = createEffect(
  async ({ ovenAddress, wallet }: { ovenAddress: string; wallet: BeaconWallet }) => {
    const data = await fetchSingleOven(wallet, ovenAddress);
    return { address: ovenAddress, data };
  },
);

// ─── Attached effects (auto-inject wallet from store) ────────────────────────

export const loadOvensFx = attach({
  source: $wallet,
  effect: loadOvensRawFx,
  mapParams: (pkh: string, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return { pkh, wallet };
  },
});

export const refreshOvenFx = attach({
  source: $wallet,
  effect: refreshOvenRawFx,
  mapParams: (ovenAddress: string, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return { ovenAddress, wallet };
  },
});

/** Load global data (XTZ price, minter params) */
export const loadGlobalDataFx = createEffect(async () => {
  const [rawPriceData, minterData] = await Promise.all([
    harbingerClient.getPriceData(),
    getMinterData(),
  ]);
  const priceData: PriceData = {
    timestamp: Math.floor(rawPriceData.time.getTime() / 1000),
    price: rawPriceData.price,
  };
  return { priceData, minterData };
});

// ─── Wiring: effects → entity events ─────────────────────────────────────────

sample({
  clock: loadOvensFx.doneData,
  target: ovensLoaded,
});

sample({
  clock: refreshOvenFx.doneData,
  target: ovenUpdated,
});

sample({
  clock: loadGlobalDataFx.doneData,
  fn: ({ priceData }) => priceData,
  target: priceDataLoaded,
});

sample({
  clock: loadGlobalDataFx.doneData,
  fn: ({ minterData }) => minterData,
  target: minterDataLoaded,
});

// ─── Pending states ──────────────────────────────────────────────────────────

export const $ovensLoadPending = loadOvensFx.pending;
export const $globalDataPending = loadGlobalDataFx.pending;
