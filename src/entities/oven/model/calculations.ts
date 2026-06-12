import type { BigNumber } from "@/shared/lib/bignumber";

import { combine } from "effector";
import { $ownedOvens, $priceData, $minterData, type OvenData } from "./model";
import * as ovenMath from "../lib";

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
  const collateralXtz = ovenMath.mutezToXtz(oven.balance);
  const debtKusd = ovenMath.shardToKusd(oven.outstandingTokens);
  const collateralValueUsd = ovenMath.collateralValueUsd(collateralXtz, price);
  const maxDebt = ovenMath.maxDebt(collateralValueUsd, collateralRate);
  const utilizationPct = ovenMath.utilizationPct(debtKusd, maxDebt);
  const liquidationPrice = ovenMath.liquidationPrice(collateralXtz, debtKusd, collateralRate);
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
