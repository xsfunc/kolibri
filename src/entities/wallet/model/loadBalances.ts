import { createEffect, sample } from "effector";
import BigNumber from "bignumber.js";
import { tokenClient, tezosToolkit } from "@/shared/api/tezos/sdk";
import { balancesUpdated, walletConnected } from "./model";
import type { WalletBalances } from "./model";

const SHARD_PRECISION = new BigNumber(10).pow(18);
const MUTEZ_PRECISION = new BigNumber(10).pow(6);

export const loadWalletBalancesFx = createEffect(async (pkh: string): Promise<WalletBalances> => {
  const [kUSDRaw, xtzRaw] = await Promise.all([
    tokenClient.getBalance(pkh),
    tezosToolkit.tz.getBalance(pkh),
  ]);
  const kUSD = new BigNumber(kUSDRaw.toString()).div(SHARD_PRECISION);
  const xtz = new BigNumber(xtzRaw.toString()).div(MUTEZ_PRECISION);
  return { kUSD, xtz };
});

sample({
  clock: walletConnected,
  fn: ({ pkh }) => pkh,
  target: loadWalletBalancesFx,
});

sample({
  clock: loadWalletBalancesFx.doneData,
  target: balancesUpdated,
});
