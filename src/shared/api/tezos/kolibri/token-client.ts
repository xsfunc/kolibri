import type { Address, Shard } from "./types";
import BigNumber from "bignumber.js";
import { getTokenBalance } from "./utils";
import { TezosToolkit } from "@taquito/taquito";
import type { WalletProvider } from "@taquito/taquito";

export default class TokenClient {
  private readonly tezos: TezosToolkit;

  public constructor(
    nodeUrl: string,
    private readonly tokenAddress: Address,
  ) {
    this.tezos = new TezosToolkit(nodeUrl);
  }

  public async approveToken(
    spender: string,
    amount: BigNumber,
    wallet: WalletProvider,
  ): Promise<unknown> {
    this.tezos.setWalletProvider(wallet);
    const tokenContract = await this.tezos.contract.at(this.tokenAddress);
    return tokenContract.methodsObject.approve({ spender, amount }).send();
  }

  public async getBalance(
    address: Address,
    tokenContractStorage?: Record<string, unknown>,
  ): Promise<Shard> {
    return getTokenBalance(address, this.tokenAddress, this.tezos, tokenContractStorage);
  }
}
