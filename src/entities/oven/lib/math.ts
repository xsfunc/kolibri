import { BigNumber, MUTEZ, SHARD } from "@/shared/config/constants";

/**
 * Domain math for ovens (CDP vaults).
 *
 * Raw on-chain units:
 *   - XTZ collateral balance is in mutez (1 XTZ = 1e6 mutez)
 *   - kUSD debt is in shard units (1 kUSD = 1e18 shard)
 *
 * `collateralRate` is the required collateralization ratio expressed as a
 * percentage (e.g. 200 = 200%), matching the Minter contract semantics used
 * throughout the UI.
 */

/** Collateralization percentage divisor (collateralRate is a percentage). */
const PERCENT = new BigNumber(100);

/** Convert raw mutez balance to XTZ. */
export function mutezToXtz(mutez: BigNumber): BigNumber {
  return mutez.dividedBy(MUTEZ);
}

/** Convert raw shard debt to kUSD. */
export function shardToKusd(shard: BigNumber): BigNumber {
  return shard.dividedBy(SHARD);
}

/** Convert an XTZ amount to raw mutez (integer). Accepts a string or BigNumber. */
export function xtzToMutez(xtz: BigNumber.Value): BigNumber {
  return new BigNumber(xtz).multipliedBy(MUTEZ).integerValue();
}

/** Convert a kUSD amount to raw shard units (integer). Accepts a string or BigNumber. */
export function kusdToShard(kusd: BigNumber.Value): BigNumber {
  return new BigNumber(kusd).multipliedBy(SHARD).integerValue();
}

/** USD value of the collateral, or null if price is unknown. */
export function collateralValueUsd(
  collateralXtz: BigNumber,
  price: BigNumber | null,
): BigNumber | null {
  return price ? collateralXtz.multipliedBy(price) : null;
}

/** Maximum mintable debt (kUSD) for a given collateral value and rate. */
export function maxDebt(
  collateralValueUsd: BigNumber | null,
  collateralRate: BigNumber | null,
): BigNumber | null {
  return collateralValueUsd && collateralRate
    ? collateralValueUsd.multipliedBy(PERCENT).dividedBy(collateralRate)
    : null;
}

/**
 * Utilization as a percentage clamped to [0, 100].
 * Returns 0 when debt or maxDebt is zero/unknown.
 */
export function utilizationPct(debtKusd: BigNumber, maxDebt: BigNumber | null): number {
  if (!maxDebt || debtKusd.isZero() || maxDebt.isZero()) return 0;
  return Math.min(100, debtKusd.dividedBy(maxDebt).multipliedBy(100).toNumber());
}

/** XTZ price at which the oven becomes liquidatable, or null if no debt. */
export function liquidationPrice(
  collateralXtz: BigNumber,
  debtKusd: BigNumber,
  collateralRate: BigNumber | null,
): BigNumber | null {
  if (debtKusd.isZero() || collateralXtz.isZero() || !collateralRate) return null;
  return debtKusd.multipliedBy(collateralRate).dividedBy(collateralXtz.multipliedBy(PERCENT));
}

/**
 * Health factor = collateral USD value / debt USD value.
 * Returns null when there is no debt or price is unknown.
 */
export function healthFactor(
  collateralXtz: BigNumber,
  debtKusd: BigNumber,
  price: BigNumber | null,
): BigNumber | null {
  if (!price || debtKusd.isZero()) return null;
  return collateralXtz.multipliedBy(price).dividedBy(debtKusd);
}
