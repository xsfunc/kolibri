import { TezosToolkit } from "@taquito/taquito";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import { CONTRACTS, HarbingerClient, StableCoinClient, TokenClient, Network } from "./kolibri";
import { OvenClient } from "./kolibri";

const NODE_URL = "https://rpc.tzkt.io/mainnet";
const CONTRACTS_MAIN = CONTRACTS.MAIN;

export const tezosToolkit = new TezosToolkit(NODE_URL);

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

const tokenClient = new TokenClient(tezosToolkit, CONTRACTS_MAIN.TOKEN!);

const ovenClientCache = new Map<string, OvenClient>();

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

export { stableCoinClient, tokenClient, CONTRACTS_MAIN as NETWORK_CONTRACTS };
