import { createEffect, sample } from "effector";
import { BigNumber } from "@/shared/lib/bignumber";
import { tokenClient, tezosToolkit } from "@/shared/api/tezos";
import { SHARD, MUTEZ } from "@/shared/config/constants";
import { balancesUpdated, walletConnected } from "./model";
import type { WalletBalances } from "./model";

export const loadWalletBalancesFx = createEffect(async (pkh: string): Promise<WalletBalances> => {
  const [kUSDRaw, xtzRaw] = await Promise.all([
    tokenClient.getBalance(pkh),
    tezosToolkit.tz.getBalance(pkh),
  ]);

  const kUSD = new BigNumber(kUSDRaw.toString()).div(SHARD);
  const xtz = new BigNumber(xtzRaw.toString()).div(MUTEZ);
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
