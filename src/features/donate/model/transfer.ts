import { createEffect, attach } from "effector";
import { tezosToolkit, NETWORK_CONTRACTS } from "@/shared/api/tezos/sdk";
import { $wallet, $walletPKH } from "@/entities/wallet";
import { BigNumber } from "@/shared/lib/bignumber";
import { MUTEZ, SHARD } from "@/shared/config/constants";

export type Currency = "XTZ" | "USDT" | "kUSD";
export const CURRENCIES: Currency[] = ["XTZ", "USDT", "kUSD"];
export const DONATE_ADDRESS = "tz1UVGqvZd7LxLtA2ZDTMz74fXJWqxRjqJS4";
const USDT_CONTRACT = "KT1XnTn74bUtxHfDtBmm2bGZAQfhPbvKWR8o";
const KUSD_CONTRACT = NETWORK_CONTRACTS.TOKEN!;

interface DonateParams {
  amount: string;
}

const donateXtzRawFx = createEffect(async ({ amount }: DonateParams) => {
  const mutezAmount = new BigNumber(amount).multipliedBy(MUTEZ).integerValue().toNumber();
  const op = await tezosToolkit.wallet
    .transfer({ to: DONATE_ADDRESS, amount: mutezAmount, mutez: true })
    .send();
  await op.confirmation(1);
  return op.opHash;
});

const donateKusdRawFx = createEffect(async ({ amount, pkh }: DonateParams & { pkh: string }) => {
  const shardAmount = new BigNumber(amount).multipliedBy(SHARD).integerValue();
  const contract = await tezosToolkit.wallet.at(KUSD_CONTRACT);
  const op = await contract.methodsObject
    .transfer({ from: pkh, to: DONATE_ADDRESS, value: shardAmount })
    .send();
  await op.confirmation(1);
  return op.opHash;
});

const donateUsdtRawFx = createEffect(async ({ amount, pkh }: DonateParams & { pkh: string }) => {
  const microAmount = new BigNumber(amount).multipliedBy(1e6).integerValue().toNumber();
  const contract = await tezosToolkit.wallet.at(USDT_CONTRACT);
  const op = await contract.methodsObject
    .transfer([
      {
        from_: pkh,
        txs: [{ to_: DONATE_ADDRESS, token_id: 0, amount: microAmount }],
      },
    ])
    .send();
  await op.confirmation(1);
  return op.opHash;
});

export const donateXtzFx = attach({
  source: $wallet,
  effect: donateXtzRawFx,
  mapParams: (params: DonateParams, wallet) => {
    if (!wallet) throw new Error("Wallet not connected");
    return params;
  },
});

export const donateKusdFx = attach({
  source: $walletPKH,
  effect: donateKusdRawFx,
  mapParams: (params: DonateParams, pkh) => {
    if (!pkh) throw new Error("Wallet not connected");
    return { ...params, pkh };
  },
});

export const donateUsdtFx = attach({
  source: $walletPKH,
  effect: donateUsdtRawFx,
  mapParams: (params: DonateParams, pkh) => {
    if (!pkh) throw new Error("Wallet not connected");
    return { ...params, pkh };
  },
});
