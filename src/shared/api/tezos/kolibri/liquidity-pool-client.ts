import type { Address } from "./types";
import type { TezosToolkit } from "@taquito/taquito";

const ZERO_MUTEZ = { amount: 0, mutez: true } as const;

export default class LiquidityPoolClient {
  public constructor(
    private readonly tezos: TezosToolkit,
    public readonly liquidityPoolAddress: Address,
  ) {}

  public async liquidate(targetOvenAddress: Address): Promise<unknown> {
    const liquidityPoolContract = await this.tezos.wallet.at(this.liquidityPoolAddress);
    return await liquidityPoolContract.methodsObject["liquidate"](targetOvenAddress).send(
      ZERO_MUTEZ,
    );
  }
}
