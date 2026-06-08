import type { Mutez, Shard } from "./types";
import BigNumber from "bignumber.js";

const MUTEZ_DIGITS = 6;
const SHARD_DIGITS = 18;

const MUTEZ_TO_SHARD = new BigNumber(Math.pow(10, SHARD_DIGITS - MUTEZ_DIGITS));
const SHARD_PRECISION = new BigNumber(Math.pow(10, SHARD_DIGITS));

const ConversionUtils = {
  mutezToShard: (mutez: Mutez): Shard => {
    return mutez.times(MUTEZ_TO_SHARD);
  },

  shardToHumanReadablePercentage: (shard: Shard, precision?: number): string => {
    const percentageShard = shard.times(100);
    const humanReadable = ConversionUtils.shardToHumanReadableNumber(percentageShard, precision);
    return `${humanReadable}%`;
  },

  shardToHumanReadableNumber: (shard: Shard, precision?: number): string => {
    const humanReadable = shard.dividedBy(SHARD_PRECISION);
    if (precision === undefined) {
      return humanReadable.toString();
    } else {
      return humanReadable.toFixed(precision);
    }
  },
};

export default ConversionUtils;
