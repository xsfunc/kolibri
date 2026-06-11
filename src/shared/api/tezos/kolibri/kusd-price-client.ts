import type { Address, KusdPriceData } from "./types";
import type { TezosToolkit } from "@taquito/taquito";

import { BigNumber } from "@/shared/lib/bignumber";
import { MUTEZ_TO_SHARD } from "@/shared/config/constants";
import { TZKT_API_URL } from "@/shared/config/links";

export default class KusdPriceClient {
  public constructor(
    private readonly tezos: TezosToolkit,
    private readonly quipuswapPoolAddress: Address,
    private readonly tzktApiUrl: string = TZKT_API_URL,
  ) {}

  public async getkUSDPriceFromTzKT(xtzUsdPrice: BigNumber): Promise<KusdPriceData> {
    const response = await fetch(
      `${this.tzktApiUrl}/contracts/${this.quipuswapPoolAddress}/storage`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch kUSD price from TzKT: ${response.status}`);
    }
    const data: { storage: { tez_pool: string; token_pool: string; last_update_time: string } } =
      await response.json();

    return this.calculateKusdPrice(
      xtzUsdPrice,
      data.storage.tez_pool,
      data.storage.token_pool,
      new Date(data.storage.last_update_time).getTime(),
    );
  }

  public async getkUSDPriceFromContract(xtzUsdPrice: BigNumber): Promise<KusdPriceData> {
    const contract = await this.tezos.contract.at(this.quipuswapPoolAddress);
    const storage = (await contract.storage()) as {
      storage: { tez_pool: BigNumber; token_pool: BigNumber; last_update_time: string };
    };

    return this.calculateKusdPrice(
      xtzUsdPrice,
      storage.storage.tez_pool.toString(),
      storage.storage.token_pool.toString(),
      new Date(storage.storage.last_update_time).getTime(),
    );
  }

  private calculateKusdPrice(
    xtzUsdPrice: BigNumber,
    rawTezPool: string,
    rawTokenPool: string,
    timestamp: number,
  ): KusdPriceData {
    const tezPool = new BigNumber(rawTezPool);
    const tokenPool = new BigNumber(rawTokenPool);

    const quipuPrice = tokenPool.dividedBy(tezPool).dividedBy(MUTEZ_TO_SHARD);
    const price = xtzUsdPrice.dividedBy(quipuPrice);
    const pegPercent = price.minus(1).multipliedBy(100);

    return { price, pegPercent, timestamp };
  }
}
