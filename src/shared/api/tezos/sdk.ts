import type { BeaconWallet } from "@taquito/beacon-wallet";

import { TezosToolkit } from "@taquito/taquito";
import { getRpcNode } from "./rpc";
import {
  CONTRACTS,
  HarbingerClient,
  KusdPriceClient,
  StableCoinClient,
  TokenClient,
  OvenClient,
  Network,
} from "./kolibri";

export const tezosToolkit = new TezosToolkit(getRpcNode());

const CONTRACTS_MAIN = CONTRACTS.MAIN;

const ovenClientCache = new Map<string, OvenClient>();
const tokenClient = new TokenClient(tezosToolkit, CONTRACTS_MAIN.TOKEN!);
const kusdPriceClient = new KusdPriceClient(tezosToolkit, CONTRACTS_MAIN.DEXES.QUIPUSWAP.POOL!);
const harbingerClient = new HarbingerClient(
  tezosToolkit,
  CONTRACTS_MAIN.HARBINGER_NORMALIZER!,
  CONTRACTS_MAIN.MINTER!,
);
const stableCoinClient = new StableCoinClient(
  tezosToolkit,
  Network.Mainnet,
  CONTRACTS_MAIN.OVEN_REGISTRY!,
  CONTRACTS_MAIN.MINTER!,
  CONTRACTS_MAIN.OVEN_FACTORY!,
);

export const getOvenClient = (ovenAddress: string): OvenClient => {
  const cached = ovenClientCache.get(ovenAddress);
  if (cached) return cached;
  const client = new OvenClient(tezosToolkit, ovenAddress, stableCoinClient, harbingerClient);
  ovenClientCache.set(ovenAddress, client);
  return client;
};

export function setWalletProvider(wallet: BeaconWallet): void {
  tezosToolkit.setWalletProvider(wallet);
}

export function clearWalletProvider(): void {
  tezosToolkit.setWalletProvider(undefined as never);
}

export function clearOvenCache(): void {
  ovenClientCache.clear();
}

export { stableCoinClient, tokenClient, kusdPriceClient, CONTRACTS_MAIN as NETWORK_CONTRACTS };
