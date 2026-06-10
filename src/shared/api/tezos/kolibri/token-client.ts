import type { Address, Shard, KolibriOperation } from "./types";
import BigNumber from "bignumber.js";
import { getTokenBalance, wrapWalletOperation } from "./utils";
import type { TezosToolkit } from "@taquito/taquito";
import { handleContractError } from "./errors";

export default class TokenClient {
  public constructor(
    private readonly tezos: TezosToolkit,
    private readonly tokenAddress: Address,
  ) {}

  public async approveToken(spender: string, amount: BigNumber): Promise<KolibriOperation> {
    try {
      const tokenContract = await this.tezos.wallet.at(this.tokenAddress);
      const op = await tokenContract.methodsObject.approve({ spender, amount }).send();
      return wrapWalletOperation(op);
    } catch (e: unknown) {
      handleContractError(e);
    }
  }

  public async getBalance(
    address: Address,
    tokenContractStorage?: Record<string, unknown>,
  ): Promise<Shard> {
    return getTokenBalance(address, this.tokenAddress, this.tezos, tokenContractStorage);
  }
}
