import { Network } from "./types";
import type { Address, Shard, Oven, InterestData } from "./types";
import { UnitValue } from "@taquito/taquito";
import type { TezosToolkit } from "@taquito/taquito";
import BigNumber from "bignumber.js";
import { compoundingLinearApproximation, getCompoundingPeriods, interestRateToApy } from "./utils";
import type Decimal from "decimal.js";

export default class StableCoinClient {
  private minterStorageCache: Record<string, unknown> | null = null;

  public constructor(
    private readonly tezos: TezosToolkit,
    private readonly network: Network,
    private readonly ovenRegistryAddress: Address,
    private readonly minterAddress: Address,
    private readonly ovenFactoryAddress: Address,
    private readonly indexerURL?: string,
  ) {}

  public getNetwork(): string {
    const networkString = this.network.toString();
    return networkString.charAt(0).toUpperCase() + networkString.slice(1);
  }

  public async deployOven(): Promise<unknown> {
    const ovenFactoryContract = await this.tezos.wallet.at(this.ovenFactoryAddress);
    return ovenFactoryContract.methodsObject.makeOven(UnitValue).send();
  }

  private async getMinterStorage(): Promise<Record<string, unknown>> {
    if (this.minterStorageCache) return this.minterStorageCache;
    const minterContract = await this.tezos.contract.at(this.minterAddress);
    this.minterStorageCache = (await minterContract.storage()) as Record<string, unknown>;
    return this.minterStorageCache;
  }

  public clearCache(): void {
    this.minterStorageCache = null;
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
          `${this.indexerURL}/v1/bigmap/sandboxnet/${ovenRegistryBigMapId}/keys?size=10&offset=${offset}`,
        );
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
