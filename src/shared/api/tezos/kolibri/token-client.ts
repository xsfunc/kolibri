import type { Address, Shard } from "./types";
import BigNumber from "bignumber.js";
import { getTokenBalance } from "./utils";
import type { TezosToolkit } from "@taquito/taquito";

export default class TokenClient {
  public constructor(
    private readonly tezos: TezosToolkit,
    private readonly tokenAddress: Address,
  ) {}

  public async approveToken(spender: string, amount: BigNumber): Promise<unknown> {
    const tokenContract = await this.tezos.wallet.at(this.tokenAddress);
    return tokenContract.methodsObject.approve({ spender, amount }).send();
  }

  public async getBalance(
    address: Address,
    tokenContractStorage?: Record<string, unknown>,
  ): Promise<Shard> {
    return getTokenBalance(address, this.tokenAddress, this.tezos, tokenContractStorage);
  }
}
