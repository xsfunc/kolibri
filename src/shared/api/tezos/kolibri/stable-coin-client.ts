import { Network } from "./types";
import type {
  Address,
  Shard,
  Oven,
  InterestData,
  KolibriOperation,
  GlobalChainData,
} from "./types";
import { UnitValue } from "@taquito/taquito";
import type { TezosToolkit } from "@taquito/taquito";
import { BigNumber } from "@/shared/lib/bignumber";
import { SHARD } from "@/shared/config/constants";
import {
  compoundingLinearApproximation,
  getCompoundingPeriods,
  interestRateToApy,
  wrapWalletOperation,
} from "./utils";
import { handleContractError } from "./errors";
import type Decimal from "decimal.js";

interface TzktHeadResponse {
  quoteUsd: number;
}

interface TzktMinterStorageResponse {
  stabilityFee: string;
  collateralizationPercentage: string;
}

export default class StableCoinClient {
  private minterStorageCache: Record<string, unknown> | null = null;
  private minterStorageCacheTimestamp = 0;
  private readonly CACHE_TTL_MS = 60_000;

  public constructor(
    private readonly tezos: TezosToolkit,
    private readonly network: Network,
    private readonly ovenRegistryAddress: Address,
    private readonly minterAddress: Address,
    private readonly ovenFactoryAddress: Address,
    private readonly indexerURL?: string,
    private readonly tzktApiUrl?: string,
  ) {}

  /**
   * Load global chain data via the TzKT API: current XTZ/USD quote and minter
   * parameters (stability fee + required collateralization ratio).
   *
   * Network access and response parsing live here in the SDK layer; consumers
   * receive ready-to-use BigNumber values (minter params are de-scaled by SHARD,
   * so collateralRate is a percentage such as 155 = 155%).
   */
  public async getGlobalData(): Promise<GlobalChainData> {
    if (!this.tzktApiUrl) {
      throw new Error("StableCoinClient: tzktApiUrl is not configured");
    }

    const [headRes, minterRes] = await Promise.all([
      fetch(`${this.tzktApiUrl}/head`),
      fetch(`${this.tzktApiUrl}/contracts/${this.minterAddress}/storage`),
    ]);

    if (!headRes.ok) {
      throw new Error(`Failed to fetch chain head from TzKT: ${headRes.status}`);
    }
    if (!minterRes.ok) {
      throw new Error(`Failed to fetch minter storage from TzKT: ${minterRes.status}`);
    }

    const headData: TzktHeadResponse = await headRes.json();
    const minterStorage: TzktMinterStorageResponse = await minterRes.json();

    return {
      xtzUsdPrice: new BigNumber(headData.quoteUsd),
      timestamp: Math.floor(Date.now() / 1000),
      minter: {
        stabilityFee: new BigNumber(minterStorage.stabilityFee).dividedBy(SHARD),
        collateralRate: new BigNumber(minterStorage.collateralizationPercentage).dividedBy(SHARD),
      },
    };
  }

  public getNetwork(): string {
    const networkString = this.network.toString();
    return networkString.charAt(0).toUpperCase() + networkString.slice(1);
  }

  public async deployOven(): Promise<KolibriOperation> {
    try {
      const ovenFactoryContract = await this.tezos.wallet.at(this.ovenFactoryAddress);
      const op = await ovenFactoryContract.methodsObject.makeOven(UnitValue).send();
      return wrapWalletOperation(op);
    } catch (e: unknown) {
      handleContractError(e);
    }
  }

  private async getMinterStorage(): Promise<Record<string, unknown>> {
    const now = Date.now();
    if (this.minterStorageCache && now - this.minterStorageCacheTimestamp < this.CACHE_TTL_MS) {
      return this.minterStorageCache;
    }
    const minterContract = await this.tezos.contract.at(this.minterAddress);
    this.minterStorageCache = (await minterContract.storage()) as Record<string, unknown>;
    this.minterStorageCacheTimestamp = now;
    return this.minterStorageCache;
  }

  public clearCache(): void {
    this.minterStorageCache = null;
    this.minterStorageCacheTimestamp = 0;
  }

  public async getStabilityFeeApy(): Promise<Decimal> {
    const minterStorage = await this.getMinterStorage();
    const stabilityFee = minterStorage.stabilityFee as BigNumber;
    return interestRateToApy(stabilityFee);
  }

  public async getSimpleStabilityFee(): Promise<Shard> {
    const minterStorage = await this.getMinterStorage();
    return minterStorage.stabilityFee as Shard;
  }

  public async getRequiredCollateralizationRatio(): Promise<Shard> {
    const minterStorage = await this.getMinterStorage();
    return minterStorage.collateralizationPercentage as Shard;
  }

  public async getInterestData(time: Date = new Date()): Promise<InterestData> {
    const minterStorage = await this.getMinterStorage();

    const globalInterestIndex: BigNumber = minterStorage.interestIndex as BigNumber;

    const raw = (await minterStorage.lastInterestIndexUpdateTime) as string;
    const lastUpdateTime = new Date(`${raw}`);

    const numPeriods = getCompoundingPeriods(lastUpdateTime, time);

    const simpleStabilityFee = minterStorage.stabilityFee as Shard;

    const globalInterestIndexApproximation = compoundingLinearApproximation(
      globalInterestIndex,
      simpleStabilityFee,
      numPeriods,
    );
    return {
      globalInterestIndex: globalInterestIndexApproximation,
      lastUpdateTime: time,
    };
  }

  public async getOvenCount(): Promise<number> {
    const ovens = await this.getAllOvens();
    return ovens.length;
  }

  public async ovensOwnedByAddress(address: Address): Promise<Array<Address>> {
    const allOvens = await this.getAllOvens();
    return allOvens.filter((oven) => oven.ovenOwner === address).map((oven) => oven.ovenAddress);
  }

  async getAllOvens(): Promise<Array<Oven>> {
    if (this.indexerURL === undefined) {
      const response = await fetch(
        `https://kolibri-data.s3.amazonaws.com/${this.network}/oven-key-data.json`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch oven data from S3: ${response.status}`);
      }
      const data = await response.json();
      return data.ovenData;
    } else {
      const ovenRegistryContract = await this.tezos.contract.at(this.ovenRegistryAddress);
      const ovenRegistryStorage: Record<string, unknown> =
        (await ovenRegistryContract.storage()) as Record<string, unknown>;
      const ovenRegistryBigMapId = (await ovenRegistryStorage.ovenMap) as unknown as number;

      let offset = 0;
      const results: Oven[] = [];

      while (true) {
        const valuesRes = await fetch(
          `${this.indexerURL}/v1/bigmap/${this.network}/${ovenRegistryBigMapId}/keys?size=10&offset=${offset}`,
        );
        if (!valuesRes.ok) {
          throw new Error(`Failed to fetch oven data from indexer: ${valuesRes.status}`);
        }
        const valuesData: Array<Record<string, Record<string, Record<string, unknown>>>> =
          await valuesRes.json();
        valuesData.forEach((value) => {
          results.push({
            ovenAddress: value.data.key.value as string,
            ovenOwner: value.data.value.value as string,
          });
        });

        if (valuesData.length < 10) {
          break;
        }

        offset += 10;
      }

      return results;
    }
  }
}
