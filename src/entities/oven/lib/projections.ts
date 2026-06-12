import { BigNumber } from "@/shared/lib/bignumber";

/**
 * Projected utilization after a hypothetical oven action (deposit / withdraw /
 * borrow / repay). Pure BigNumber math; returns a clamped percentage in
 * [0, 100], or null when inputs are insufficient to project.
 *
 * All inputs are in human units: collateralXtz (XTZ), debtKusd (kUSD),
 * maxDebt (kUSD), amount (XTZ for deposit/withdraw, kUSD for borrow/repay).
 */

interface ProjectionInput {
  collateralXtz: BigNumber;
  debtKusd: BigNumber;
  maxDebt: BigNumber | null;
  amount: BigNumber;
}

const HUNDRED = new BigNumber(100);

function clamp(value: BigNumber): number {
  return BigNumber.min(HUNDRED, BigNumber.max(0, value)).toNumber();
}

/** Utilization after depositing `amount` XTZ of additional collateral. */
export function projectDepositUtil({
  collateralXtz,
  debtKusd,
  maxDebt,
  amount,
}: ProjectionInput): number | null {
  if (amount.lte(0) || !maxDebt) return null;
  if (collateralXtz.lte(0) || maxDebt.lte(0)) return debtKusd.gt(0) ? null : 0;
  const newMaxDebt = maxDebt.multipliedBy(collateralXtz.plus(amount).dividedBy(collateralXtz));
  if (debtKusd.lte(0) || newMaxDebt.lte(0)) return 0;
  return clamp(debtKusd.dividedBy(newMaxDebt).multipliedBy(HUNDRED));
}

/** Utilization after withdrawing `amount` XTZ of collateral. */
export function projectWithdrawUtil({
  collateralXtz,
  debtKusd,
  maxDebt,
  amount,
}: ProjectionInput): number | null {
  if (amount.lte(0) || !maxDebt) return null;
  if (collateralXtz.lte(0) || maxDebt.lte(0)) return null;
  const newColl = collateralXtz.minus(amount);
  if (newColl.lte(0)) return debtKusd.gt(0) ? 100 : 0;
  const newMaxDebt = maxDebt.multipliedBy(newColl.dividedBy(collateralXtz));
  if (debtKusd.lte(0) || newMaxDebt.lte(0)) return 0;
  return clamp(debtKusd.dividedBy(newMaxDebt).multipliedBy(HUNDRED));
}

/** Utilization after borrowing `amount` more kUSD. */
export function projectBorrowUtil({ debtKusd, maxDebt, amount }: ProjectionInput): number | null {
  if (amount.lte(0) || !maxDebt || maxDebt.lte(0)) return null;
  return clamp(debtKusd.plus(amount).dividedBy(maxDebt).multipliedBy(HUNDRED));
}

/** Utilization after repaying `amount` kUSD of debt. */
export function projectRepayUtil({ debtKusd, maxDebt, amount }: ProjectionInput): number | null {
  if (amount.lte(0) || !maxDebt || maxDebt.lte(0)) return null;
  return clamp(debtKusd.minus(amount).dividedBy(maxDebt).multipliedBy(HUNDRED));
}
