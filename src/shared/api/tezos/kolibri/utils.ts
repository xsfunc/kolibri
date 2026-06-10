import { TezosToolkit, type WalletOperation } from "@taquito/taquito";
import BigNumber from "bignumber.js";
import { SHARD, COMPOUNDS_PER_YEAR, COMPOUND_PERIOD_SECONDS } from "@/shared/config/constants";
import Decimal from "decimal.js";
import type { KolibriOperation } from "./types";

export function wrapWalletOperation(op: WalletOperation): KolibriOperation {
  return {
    opHash: op.opHash,
    async confirmed(count = 1) {
      await op.confirmation(count);
    },
  };
}

export const interestRateToApy = (interestRatePerPeriod: BigNumber): Decimal => {
  const currentValueNoMantissa = new BigNumber(interestRatePerPeriod).dividedBy(SHARD);
  const currentValueDecimal = new Decimal(currentValueNoMantissa.toFixed(18)).times(
    COMPOUNDS_PER_YEAR,
  );
  const E = new Decimal(
    "2.7182818284590452353602874713526624977572470936999595749669676277240766303535475945713821785251664274",
  );
  const invertedLN = E.pow(currentValueDecimal);
  return invertedLN.minus(1).times(100);
};

export const compoundingLinearApproximation = (
  initial: BigNumber,
  interestRatePerPeriod: BigNumber,
  numPeriods: number,
): BigNumber => {
  return initial.times(SHARD.plus(interestRatePerPeriod.times(numPeriods))).div(SHARD);
};

export const getCompoundingPeriods = (since: Date, until: Date): number => {
  const deltaMs = until.getTime() - since.getTime();
  const deltaSecs = Math.floor(deltaMs / 1000);
  return Math.floor(deltaSecs / COMPOUND_PERIOD_SECONDS);
};

export const getTokenBalance = async (
  holder: string,
  tokenContractAddress: string,
  tezos: TezosToolkit,
  tokenContractStorage?: Record<string, unknown>,
): Promise<BigNumber> => {
  const resolvedTokenStorage =
    tokenContractStorage ??
    ((await (await tezos.contract.at(tokenContractAddress)).storage()) as Record<string, unknown>);
  const balances = resolvedTokenStorage.balances as unknown as {
    get: (key: string) => Promise<Record<string, unknown> | undefined>;
  };
  const balance = await balances.get(holder);
  return balance === undefined ? new BigNumber(0) : (balance.balance as BigNumber);
};
