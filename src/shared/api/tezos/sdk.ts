import type { BeaconWallet } from "@taquito/beacon-wallet";

import { TezosToolkit } from "@taquito/taquito";
import { DEFAULT_RPC } from "@/shared/config/links";
import {
  CONTRACTS,
  HarbingerClient,
  KusdPriceClient,
  LiquidityPoolClient,
  OvenClient,
  SavingsPoolClient,
  StableCoinClient,
  TokenClient,
  Network,
} from "./kolibri";

export const tezosToolkit = new TezosToolkit(DEFAULT_RPC);

const CONTRACTS_MAIN = CONTRACTS.MAIN;

const ovenClientCache = new Map<string, OvenClient>();
const tokenClient = new TokenClient(tezosToolkit, CONTRACTS_MAIN.TOKEN!);
const kusdPriceClient = new KusdPriceClient(tezosToolkit, CONTRACTS_MAIN.DEXES.QUIPUSWAP.POOL!);
const savingsPoolClient = new SavingsPoolClient(tezosToolkit, CONTRACTS_MAIN.SAVINGS_POOL!);
const liquidityPoolClient = new LiquidityPoolClient(tezosToolkit, CONTRACTS_MAIN.LIQUIDITY_POOL!);
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

export const setRpcNode = (url: string): void => {
  tezosToolkit.setRpcProvider(url);
};

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
  tezosToolkit.setWalletProvider(undefined);
}

export function clearOvenCache(): void {
  ovenClientCache.clear();
}

export {
  tokenClient,
  kusdPriceClient,
  stableCoinClient,
  savingsPoolClient,
  liquidityPoolClient,
  DEFAULT_RPC,
  CONTRACTS_MAIN as NETWORK_CONTRACTS,
};
