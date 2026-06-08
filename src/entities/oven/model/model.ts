import { createStore, createEvent } from "effector";
import type BigNumber from "bignumber.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OvenData {
  ovenAddress: string;
  ovenOwner: string;
  baker: string | null;
  balance: BigNumber;
  borrowedTokens: BigNumber;
  stabilityFee: BigNumber;
  outstandingTokens: BigNumber;
  isLiquidated: boolean;
}

export interface PriceData {
  timestamp: number;
  price: BigNumber;
}

export interface MinterData {
  stabilityFee: BigNumber | null;
  collateralRate: BigNumber | null;
  collateralOperand: BigNumber | null;
  privateLiquidationThreshold: BigNumber | null;
}

// ─── Events ──────────────────────────────────────────────────────────────────

/** All ovens loaded (initial load) */
export const ovensLoaded = createEvent<Record<string, OvenData | null>>();

/** Single oven updated (after transaction) */
export const ovenUpdated = createEvent<{ address: string; data: OvenData }>();

/** Global price data loaded */
export const priceDataLoaded = createEvent<PriceData>();

/** Minter data loaded */
export const minterDataLoaded = createEvent<MinterData>();

/** User disconnected — reset ovens */
export const ovensReset = createEvent();

// ─── Stores ──────────────────────────────────────────────────────────────────

export const $ownedOvens = createStore<Record<string, OvenData | null> | null>(null)
  .on(ovensLoaded, (_, ovens) => ovens)
  .on(ovenUpdated, (state, { address, data }) =>
    state ? { ...state, [address]: data } : { [address]: data },
  )
  .on(ovensReset, () => null);

export const $priceData = createStore<PriceData | null>(null).on(
  priceDataLoaded,
  (_, data) => data,
);

export const $minterData = createStore<MinterData>({
  stabilityFee: null,
  collateralRate: null,
  collateralOperand: null,
  privateLiquidationThreshold: null,
}).on(minterDataLoaded, (_, data) => data);

// ─── Derived ─────────────────────────────────────────────────────────────────

/** Oven list as array (for list rendering) */
export const $ovenList = $ownedOvens.map((ovens) =>
  ovens ? Object.values(ovens).filter((o): o is OvenData => o !== null) : [],
);

/** true while ovens are not yet loaded */
export const $ovensLoading = $ownedOvens.map((o) => o === null);
