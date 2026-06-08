import BigNumber from "bignumber.js";
import { SHARD } from "../config/constants";

const MUTEZ_TO_SHARD = new BigNumber(10).pow(12);

export const customGetCollateralUtilization = (
  price: BigNumber,
  balance: BigNumber,
  outstandingTokens: BigNumber,
): BigNumber => {
  if (balance.isZero() || price.isZero() || outstandingTokens.isZero()) {
    return new BigNumber(0);
  }

  const priceShard = price.multipliedBy(MUTEZ_TO_SHARD);
  const collateralValue = balance
    .multipliedBy(MUTEZ_TO_SHARD)
    .multipliedBy(priceShard)
    .dividedBy(SHARD);

  return new BigNumber(
    outstandingTokens.times(SHARD).dividedBy(collateralValue).toFixed(0, BigNumber.ROUND_DOWN),
  );
};
