import type { Address, Mutez, Shard, InterestData } from "./types";
import { TezosToolkit, UnitValue } from "@taquito/taquito";
import type { WalletProvider } from "@taquito/taquito";
import HarbingerClient from "./harbinger-client";
import StableCoinClient from "./stable-coin-client";
import BigNumber from "bignumber.js";

const MUTEZ_DIGITS = 6;
const SHARD_DIGITS = 18;
const MUTEZ_TO_SHARD = new BigNumber(Math.pow(10, SHARD_DIGITS - MUTEZ_DIGITS));
const SHARD_PRECISION = new BigNumber(Math.pow(10, SHARD_DIGITS));

export default class OvenClient {
  private readonly tezos: TezosToolkit;

  public constructor(
    nodeUrl: string,
    wallet: WalletProvider,
    public readonly ovenAddress: Address,
    public readonly stableCoinClient: StableCoinClient,
    public readonly harbingerClient: HarbingerClient,
  ) {
    const tezos = new TezosToolkit(nodeUrl);
    tezos.setWalletProvider(wallet);
    this.tezos = tezos;
  }

  public async getCollateralUtilization(): Promise<Shard> {
    const { price } = await this.harbingerClient.getPriceData();
    const priceShard = price.multipliedBy(MUTEZ_TO_SHARD);
    const currentBalance = await this.getBalance();
    const collateralValue = currentBalance
      .multipliedBy(MUTEZ_TO_SHARD)
      .multipliedBy(priceShard)
      .dividedBy(SHARD_PRECISION);
    const totalBorrowedTokens = await this.getTotalOutstandingTokens();
    return new BigNumber(
      totalBorrowedTokens.times(Math.pow(10, SHARD_DIGITS)).dividedBy(collateralValue).toFixed(0),
    );
  }

  public async getOvenStorage(): Promise<Record<string, unknown>> {
    return (await (await this.tezos.wallet.at(this.ovenAddress)).storage()) as Record<
      string,
      unknown
    >;
  }

  public async getBaker(): Promise<Address | null> {
    try {
      return await this.tezos.rpc.getDelegate(this.ovenAddress);
    } catch (e: unknown) {
      if ((e as Record<string, unknown>).status === 404) {
        return null;
      }
      throw e;
    }
  }

  public async getOwner(ovenStorage?: Record<string, unknown>): Promise<Address> {
    const resolvedOvenStorage =
      ovenStorage ??
      ((await (await this.tezos.wallet.at(this.ovenAddress)).storage()) as Record<string, unknown>);
    return resolvedOvenStorage.owner as Address;
  }

  public async getBorrowedTokens(ovenStorage?: Record<string, unknown>): Promise<Shard> {
    const resolvedOvenStorage =
      ovenStorage ??
      ((await (await this.tezos.wallet.at(this.ovenAddress)).storage()) as Record<string, unknown>);
    return resolvedOvenStorage.borrowedTokens as Shard;
  }

  public async getTotalOutstandingTokens(
    time: Date = new Date(),
    ovenStorage?: Record<string, unknown>,
    interestData?: InterestData,
  ): Promise<Shard> {
    const stabilityFees = await this.getStabilityFees(time, ovenStorage, interestData);
    const borrowedTokens = await this.getBorrowedTokens(ovenStorage);
    return stabilityFees.plus(borrowedTokens);
  }

  public async getStabilityFees(
    time: Date = new Date(),
    ovenStorage?: Record<string, unknown>,
    interestData?: InterestData,
  ): Promise<Shard> {
    const resolvedOvenStorage =
      ovenStorage ??
      ((await (await this.tezos.wallet.at(this.ovenAddress)).storage()) as Record<string, unknown>);
    const stabilityFeeTokens: BigNumber = resolvedOvenStorage.stabilityFeeTokens as BigNumber;

    const resolvedInterestData =
      interestData ?? (await this.stableCoinClient.getInterestData(time));
    const ovenInterestIndex: BigNumber = resolvedOvenStorage.interestIndex as BigNumber;
    const borrowedTokens = await this.getBorrowedTokens(resolvedOvenStorage);
    const minterInterestIndex: BigNumber = resolvedInterestData.globalInterestIndex;

    // Use ROUND_DOWN to match Michelson's EDIV (truncating integer division)
    const ratio = minterInterestIndex
      .times(SHARD_PRECISION)
      .div(ovenInterestIndex)
      .integerValue(BigNumber.ROUND_DOWN);
    const totalPrinciple = borrowedTokens.plus(stabilityFeeTokens);
    const newTotalTokens = ratio
      .times(totalPrinciple)
      .div(SHARD_PRECISION)
      .integerValue(BigNumber.ROUND_DOWN);
    return newTotalTokens.minus(borrowedTokens);
  }

  public async isLiquidated(ovenStorage?: Record<string, unknown>): Promise<boolean> {
    const resolvedOvenStorage =
      ovenStorage ??
      ((await (await this.tezos.wallet.at(this.ovenAddress)).storage()) as Record<string, unknown>);
    return resolvedOvenStorage.isLiquidated as boolean;
  }

  public async getBalance(): Promise<Mutez> {
    return (await this.tezos.tz.getBalance(this.ovenAddress)) as unknown as Mutez;
  }

  public async setBaker(baker: Address | null): Promise<unknown> {
    return this.invokeOvenMethod("setDelegate", baker);
  }

  public async liquidate(): Promise<unknown> {
    return this.invokeOvenMethod("liquidate", UnitValue);
  }

  public async borrow(tokens: Shard): Promise<unknown> {
    return this.invokeOvenMethod("borrow", tokens);
  }

  public async deposit(mutez: Mutez): Promise<unknown> {
    return await this.tezos.wallet
      .transfer({
        to: this.ovenAddress,
        amount: Number(mutez),
        mutez: true,
      })
      .send();
  }

  public async withdraw(mutez: Mutez): Promise<unknown> {
    return this.invokeOvenMethod("withdraw", mutez);
  }

  public async repay(tokensToRepay: Shard): Promise<unknown> {
    return this.invokeOvenMethod("repay", tokensToRepay);
  }

  private async invokeOvenMethod(entrypoint: string, args: unknown, amount = 0): Promise<unknown> {
    const ovenContract = await this.tezos.wallet.at(this.ovenAddress);
    const sendArgs = { amount: amount, mutez: true };
    return await ovenContract.methodsObject[entrypoint](args).send(sendArgs);
  }
}
