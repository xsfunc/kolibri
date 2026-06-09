import { combine } from "effector";
import type { BigNumber } from "@/shared/lib/bignumber";
import { $ownedOvens, $priceData, $minterData, type OvenData } from "./model";

export interface OvenCalculations {
  collateralXtz: BigNumber;
  debtKusd: BigNumber;
  collateralValueUsd: BigNumber | null;
  maxDebt: BigNumber | null;
  utilizationPct: number;
  liquidationPrice: BigNumber | null;
}

function computeOvenCalculations(
  oven: OvenData,
  price: BigNumber | null,
  collateralRate: BigNumber | null,
): OvenCalculations {
  const collateralXtz = oven.balance.dividedBy(1e6);
  const debtKusd = oven.outstandingTokens.dividedBy(1e18);

  const collateralValueUsd = price ? collateralXtz.multipliedBy(price) : null;

  const maxDebt =
    collateralValueUsd && collateralRate
      ? collateralValueUsd.multipliedBy(100).dividedBy(collateralRate)
      : null;

  const utilizationPct =
    maxDebt && !debtKusd.isZero() && !maxDebt.isZero()
      ? Math.min(100, debtKusd.dividedBy(maxDebt).multipliedBy(100).toNumber())
      : 0;

  const liquidationPrice =
    !debtKusd.isZero() && !collateralXtz.isZero() && collateralRate
      ? debtKusd.multipliedBy(collateralRate).dividedBy(collateralXtz)
      : null;

  return { collateralXtz, debtKusd, collateralValueUsd, maxDebt, utilizationPct, liquidationPrice };
}

export const $ovenCalculations = combine(
  $ownedOvens,
  $priceData,
  $minterData,
  (ovens, priceData, minterData) => {
    if (!ovens) return {} as Record<string, OvenCalculations>;
    const map: Record<string, OvenCalculations> = {};
    for (const [addr, oven] of Object.entries(ovens)) {
      if (oven)
        map[addr] = computeOvenCalculations(
          oven,
          priceData?.price ?? null,
          minterData.collateralRate,
        );
    }
    return map;
  },
);
