import type { Address, KolibriOperation } from "./types";
import type { TezosToolkit } from "@taquito/taquito";
import { wrapWalletOperation } from "./utils";
import { handleContractError } from "./errors";

const ZERO_MUTEZ = { amount: 0, mutez: true } as const;

export default class LiquidityPoolClient {
  public constructor(
    private readonly tezos: TezosToolkit,
    public readonly liquidityPoolAddress: Address,
  ) {}

  public async liquidate(targetOvenAddress: Address): Promise<KolibriOperation> {
    try {
      const liquidityPoolContract = await this.tezos.wallet.at(this.liquidityPoolAddress);
      const op =
        await liquidityPoolContract.methodsObject["liquidate"](targetOvenAddress).send(ZERO_MUTEZ);
      return wrapWalletOperation(op);
    } catch (e: unknown) {
      handleContractError(e);
    }
  }
}
