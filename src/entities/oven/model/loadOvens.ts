import { createEffect, createStore, sample, attach } from "effector";
import { BigNumber } from "@/shared/lib/bignumber";
import { SHARD } from "@/shared/config/constants";
import type { InterestData } from "@/shared/api/tezos/kolibri";
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
import { stableCoinClient, getOvenClient, NETWORK_CONTRACTS } from "@/shared/api/tezos/sdk";
import { $wallet } from "@/entities/wallet/@x/oven";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchSingleOven(ovenAddress: string, interestData: InterestData): Promise<OvenData> {
  const client = getOvenClient(ovenAddress);

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

// ─── Raw effects ──────────────────────────────────────────────────────────────

const loadOvensRawFx = createEffect(async (pkh: string) => {
  const addresses: string[] = await stableCoinClient.ovensOwnedByAddress(pkh);
  const total = addresses.length;

  ovenAddressesLoading(addresses);
  ovenLoadProgress({ loaded: 0, total });

  const interestData = await stableCoinClient.getInterestData();

  const result: Record<string, OvenData> = {};

  for (let i = 0; i < addresses.length; i++) {
    const data = await fetchSingleOven(addresses[i], interestData);
    const oven = { ...data, ovenOwner: pkh };
    result[addresses[i]] = oven;
    ovenUpdated({ address: addresses[i], data: oven });
    ovenLoadProgress({ loaded: i + 1, total });
  }

  return result;
});

const refreshOvenRawFx = createEffect(async (ovenAddress: string) => {
  const interestData = await stableCoinClient.getInterestData();
  const data = await fetchSingleOven(ovenAddress, interestData);
  return { address: ovenAddress, data };
});

// ─── Attached effects (guard: wallet must be connected) ──────────────────────

export const loadOvensFx = attach({
  source: $wallet,
  effect: loadOvensRawFx,
  mapParams: (pkh: string, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return pkh;
  },
});

export const refreshOvenFx = attach({
  source: $wallet,
  effect: refreshOvenRawFx,
  mapParams: (ovenAddress: string, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return ovenAddress;
  },
});

const TZKT_API = "https://api.tzkt.io/v1";

interface TzktHeadResponse {
  quoteUsd: number;
}

interface MinterStorageResponse {
  stabilityFee: string;
  collateralizationPercentage: string;
}

/** Load global data (XTZ price, minter params) via TzKT API */
export const loadGlobalDataFx = createEffect(async () => {
  const [headRes, minterRes] = await Promise.all([
    fetch(`${TZKT_API}/head`),
    fetch(`${TZKT_API}/contracts/${NETWORK_CONTRACTS.MINTER!}/storage`),
  ]);

  const headData: TzktHeadResponse = await headRes.json();
  const minterStorage: MinterStorageResponse = await minterRes.json();

  const priceData: PriceData = {
    timestamp: Math.floor(Date.now() / 1000),
    price: new BigNumber(headData.quoteUsd),
  };

  const rawStabilityFee = new BigNumber(minterStorage.stabilityFee);
  const rawCollateralRate = new BigNumber(minterStorage.collateralizationPercentage);

  const minterData = {
    stabilityFee: rawStabilityFee.dividedBy(SHARD),
    collateralRate: rawCollateralRate.dividedBy(SHARD),
    collateralOperand: null,
    privateLiquidationThreshold: null,
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

sample({
  clock: loadGlobalDataFx.fail,
  target: ovensReset,
});
