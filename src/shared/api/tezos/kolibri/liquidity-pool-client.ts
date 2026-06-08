import type { Address } from "./types";
import { TezosToolkit } from "@taquito/taquito";
import type { WalletProvider } from "@taquito/taquito";

export default class LiquidityPoolClient {
  private readonly tezos: TezosToolkit;

  public constructor(
    nodeUrl: string,
    wallet: WalletProvider,
    public readonly liquidityPoolAddress: Address,
  ) {
    const tezos = new TezosToolkit(nodeUrl);
    tezos.setWalletProvider(wallet);
    this.tezos = tezos;
  }

  public async liquidate(targetOvenAddress: Address): Promise<unknown> {
    const liquidityPoolContract = await this.tezos.wallet.at(this.liquidityPoolAddress);
    const sendArgs = { amount: 0, mutez: true };
    return await liquidityPoolContract.methodsObject["liquidate"](targetOvenAddress).send(sendArgs);
  }
}
