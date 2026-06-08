import { createEffect, createStore, sample, attach } from "effector";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import type { InterestData } from "@/shared/api/tezos/kolibri/types";
import {
  ovensLoaded,
  ovenUpdated,
  ovenLoadProgress,
  ovenAddressesLoading,
  ovensReset,
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

async function fetchSingleOven(
  wallet: BeaconWallet,
  ovenAddress: string,
  interestData: InterestData,
): Promise<OvenData> {
  const client = getOvenClient(wallet, ovenAddress);

  const ovenStorage = await client.getOvenStorage();

  const [baker, balance] = await Promise.all([client.getBaker(), client.getBalance()]);

  const borrowedTokens = await client.getBorrowedTokens(ovenStorage);
  const stabilityFee = await client.getStabilityFees(new Date(), ovenStorage, interestData);
  const isLiquidated = await client.isLiquidated(ovenStorage);

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
    const total = addresses.length;

    ovenAddressesLoading(addresses);
    ovenLoadProgress({ loaded: 0, total });

    const interestData = await stableCoinClient.getInterestData();

    const result: Record<string, OvenData> = {};

    for (let i = 0; i < addresses.length; i++) {
      const data = await fetchSingleOven(wallet, addresses[i], interestData);
      const oven = { ...data, ovenOwner: pkh };
      result[addresses[i]] = oven;
      ovenUpdated({ address: addresses[i], data: oven });
      ovenLoadProgress({ loaded: i + 1, total });
    }

    return result;
  },
);

const refreshOvenRawFx = createEffect(
  async ({ ovenAddress, wallet }: { ovenAddress: string; wallet: BeaconWallet }) => {
    const interestData = await stableCoinClient.getInterestData();
    const data = await fetchSingleOven(wallet, ovenAddress, interestData);
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

export const $refreshingOvenAddress = createStore<string | null>(null)
  .on(refreshOvenFx, (_, ovenAddress) => ovenAddress)
  .on(refreshOvenFx.done, () => null)
  .on(refreshOvenFx.fail, () => null)
  .on(ovensReset, () => null);

sample({
  clock: loadOvensFx.fail,
  target: ovensReset,
});
