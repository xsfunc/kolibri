import { Network } from "./types";
import type { Address, Shard, Oven, InterestData } from "./types";
import { TezosToolkit, UnitValue } from "@taquito/taquito";
import type { WalletProvider } from "@taquito/taquito";
import BigNumber from "bignumber.js";
import axios, { type AxiosResponse } from "axios";
import CONSTANTS from "./constants";
import { compoundingLinearApproximation, interestRateToApy } from "./utils";
import type Decimal from "decimal.js";

export default class StableCoinClient {
  private readonly tezos: TezosToolkit;

  public constructor(
    nodeUrl: string,
    private readonly network: Network,
    private readonly ovenRegistryAddress: Address,
    private readonly minterAddress: Address,
    private readonly ovenFactoryAddress: Address,
    private readonly indexerURL?: string,
  ) {
    this.tezos = new TezosToolkit(nodeUrl);
  }

  public getNetwork(): string {
    const networkString = this.network.toString();
    return networkString.charAt(0).toUpperCase() + networkString.slice(1);
  }

  public async deployOven(wallet: WalletProvider): Promise<unknown> {
    this.tezos.setWalletProvider(wallet);
    const ovenFactoryContract = await this.tezos.wallet.at(this.ovenFactoryAddress);
    return ovenFactoryContract.methodsObject.makeOven(UnitValue).send();
  }

  public async getStabilityFeeApy(): Promise<Decimal> {
    const minterContract = await this.tezos.contract.at(this.minterAddress);
    const minterStorage: Record<string, unknown> = (await minterContract.storage()) as Record<
      string,
      unknown
    >;
    const stabilityFee = (await minterStorage.stabilityFee) as BigNumber;
    return interestRateToApy(stabilityFee);
  }

  public async getSimpleStabilityFee(): Promise<Shard> {
    const minterContract = await this.tezos.contract.at(this.minterAddress);
    const minterStorage: Record<string, unknown> = (await minterContract.storage()) as Record<
      string,
      unknown
    >;
    return (await minterStorage.stabilityFee) as Shard;
  }

  public async getRequiredCollateralizationRatio(): Promise<Shard> {
    const minterContract = await this.tezos.contract.at(this.minterAddress);
    const minterStorage: Record<string, unknown> = (await minterContract.storage()) as Record<
      string,
      unknown
    >;
    return (await minterStorage.collateralizationPercentage) as Shard;
  }

  public async getInterestData(time: Date = new Date()): Promise<InterestData> {
    const minterContract = await this.tezos.contract.at(this.minterAddress);
    const minterStorage: Record<string, unknown> = (await minterContract.storage()) as Record<
      string,
      unknown
    >;

    const globalInterestIndex: BigNumber = (await minterStorage.interestIndex) as BigNumber;

    const raw = (await minterStorage.lastInterestIndexUpdateTime) as string;
    const lastUpdateTime = new Date(`${raw}`);

    const deltaMs = time.getTime() - lastUpdateTime.getTime();
    const deltaSecs = Math.floor(deltaMs / 1000);
    const numPeriods = Math.floor(deltaSecs / CONSTANTS.COMPOUND_PERIOD_SECONDS);

    const simpleStabilityFee = await this.getSimpleStabilityFee();

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
      const response = await axios.get(
        `https://kolibri-data.s3.amazonaws.com/${this.network}/oven-key-data.json`,
      );
      return response.data.ovenData;
    } else {
      const ovenRegistryContract = await this.tezos.contract.at(this.ovenRegistryAddress);
      const ovenRegistryStorage: Record<string, unknown> =
        (await ovenRegistryContract.storage()) as Record<string, unknown>;
      const ovenRegistryBigMapId = (await ovenRegistryStorage.ovenMap) as unknown as number;

      let offset = 0;
      const results: Oven[] = [];

      while (true) {
        const values: AxiosResponse = await axios.get(
          `${this.indexerURL}/v1/bigmap/sandboxnet/${ovenRegistryBigMapId}/keys?size=10&offset=${offset}`,
        );
        (values.data as Array<Record<string, Record<string, Record<string, unknown>>>>).forEach(
          (value) => {
            results.push({
              ovenAddress: value.data.key.value as string,
              ovenOwner: value.data.value.value as string,
            });
          },
        );

        if (values.data.length < 10) {
          break;
        }

        offset += 10;
      }

      return results;
    }
  }
}
