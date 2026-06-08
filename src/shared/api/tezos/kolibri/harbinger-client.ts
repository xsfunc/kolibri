import type { Address, HarbingerPriceFeedData } from "./types";
import { TezosToolkit } from "@taquito/taquito";

const ASSET_CODE = "XTZUSDT";

export default class HarbingerClient {
  private readonly tezos: TezosToolkit;

  public constructor(
    nodeUrl: string,
    public readonly oracleAddress: Address,
    public readonly ovenProxyAddress: Address = "",
  ) {
    this.tezos = new TezosToolkit(nodeUrl);
  }

  public async getPriceData(): Promise<HarbingerPriceFeedData> {
    const oracleContract = await this.tezos.contract.at(this.oracleAddress);
    const result = await oracleContract.contractViews
      .get_price_with_timestamp(ASSET_CODE)
      .executeView({ viewCaller: this.ovenProxyAddress });

    return {
      time: new Date(Math.floor(new Date(result.last_update_timestamp).getTime() / 1000)),
      price: result.price,
    };
  }
}
