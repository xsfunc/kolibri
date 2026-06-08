import { TezosToolkit } from "@taquito/taquito";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import { CONTRACTS, HarbingerClient, StableCoinClient, TokenClient, Network } from "./kolibri";
import { OvenClient } from "./kolibri";
import type BigNumber from "bignumber.js";

const NODE_URL = "https://rpc.tzkt.io/mainnet";
const CONTRACTS_MAIN = CONTRACTS.MAIN;

export const tezosToolkit = new TezosToolkit(NODE_URL);

export const harbingerClient = new HarbingerClient(NODE_URL, CONTRACTS_MAIN.HARBINGER_NORMALIZER!);

export const stableCoinClient = new StableCoinClient(
  NODE_URL,
  Network.Mainnet,
  CONTRACTS_MAIN.OVEN_REGISTRY!,
  CONTRACTS_MAIN.MINTER!,
  CONTRACTS_MAIN.OVEN_FACTORY!,
);

export const tokenClient = new TokenClient(NODE_URL, CONTRACTS_MAIN.TOKEN!);

export const getOvenClient = (wallet: BeaconWallet, ovenAddress: string): OvenClient =>
  new OvenClient(NODE_URL, wallet, ovenAddress, stableCoinClient, harbingerClient);

// ─── Minter data helper ───────────────────────────────────────────────────────

export interface MinterDataResult {
  stabilityFee: BigNumber | null;
  collateralRate: BigNumber | null;
  collateralOperand: BigNumber | null;
  privateLiquidationThreshold: BigNumber | null;
}

export async function getMinterData(): Promise<MinterDataResult> {
  const stabilityFee = await stableCoinClient.getSimpleStabilityFee().catch(() => null);
  const collateralRate = await stableCoinClient
    .getRequiredCollateralizationRatio()
    .catch(() => null);
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
