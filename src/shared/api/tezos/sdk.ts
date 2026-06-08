import { TezosToolkit } from "@taquito/taquito";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import { CONTRACTS, HarbingerClient, StableCoinClient, TokenClient, Network } from "./kolibri";
import { OvenClient } from "./kolibri";
import type BigNumber from "bignumber.js";

const NODE_URL = "https://rpc.tzkt.io/mainnet";
const CONTRACTS_MAIN = CONTRACTS.MAIN;

export const tezosToolkit = new TezosToolkit(NODE_URL);

export const harbingerClient = new HarbingerClient(
  NODE_URL,
  CONTRACTS_MAIN.HARBINGER_NORMALIZER!,
  CONTRACTS_MAIN.MINTER!,
);

export const stableCoinClient = new StableCoinClient(
  NODE_URL,
  Network.Mainnet,
  CONTRACTS_MAIN.OVEN_REGISTRY!,
  CONTRACTS_MAIN.MINTER!,
  CONTRACTS_MAIN.OVEN_FACTORY!,
);

export const tokenClient = new TokenClient(NODE_URL, CONTRACTS_MAIN.TOKEN!);

const ovenClientCache = new Map<string, OvenClient>();

export const getOvenClient = (wallet: BeaconWallet, ovenAddress: string): OvenClient => {
  const cached = ovenClientCache.get(ovenAddress);
  if (cached) return cached;
  const client = new OvenClient(NODE_URL, wallet, ovenAddress, stableCoinClient, harbingerClient);
  ovenClientCache.set(ovenAddress, client);
  return client;
};

// ─── Minter data helper ───────────────────────────────────────────────────────

export interface MinterDataResult {
  stabilityFee: BigNumber | null;
  collateralRate: BigNumber | null;
  collateralOperand: BigNumber | null;
  privateLiquidationThreshold: BigNumber | null;
}

export async function getMinterData(): Promise<MinterDataResult> {
  const stabilityFee = await stableCoinClient.getSimpleStabilityFee().catch((err) => {
    console.error("[getMinterData] stabilityFee failed:", err);
    return null;
  });
  const collateralRate = await stableCoinClient.getRequiredCollateralizationRatio().catch((err) => {
    console.error("[getMinterData] collateralRate failed:", err);
    return null;
  });
  return {
    stabilityFee,
    collateralRate,
    collateralOperand: null,
    privateLiquidationThreshold: null,
  };
}

// ─── Unified sdk object (used by entity/feature models) ──────────────────────

export const sdk = {
  harbingerClient,
  stableCoinClient,
  tokenClient,
  getMinterData,
  getOvenClient,
};

export { NODE_URL, CONTRACTS_MAIN as NETWORK_CONTRACTS };
