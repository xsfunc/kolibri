import { BigNumber } from "@/shared/lib/bignumber";

export { BigNumber };

export const MUTEZ = new BigNumber(10).pow(6);
export const SHARD = new BigNumber(10).pow(18);
export const MUTEZ_TO_SHARD = new BigNumber(10).pow(12);
export const COLLATERAL_DIVISOR = new BigNumber(10).pow(20);
export const COMPOUND_PERIOD_SECONDS = 60;
export const COMPOUNDS_PER_YEAR = (365 * 24 * 60 * 60) / COMPOUND_PERIOD_SECONDS;
