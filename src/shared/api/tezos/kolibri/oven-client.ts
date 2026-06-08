import type { Address, Mutez, Shard, InterestData } from "./types";
import { UnitValue } from "@taquito/taquito";
import type { TezosToolkit } from "@taquito/taquito";
import type HarbingerClient from "./harbinger-client";
import type StableCoinClient from "./stable-coin-client";
import BigNumber from "bignumber.js";
import { SHARD, MUTEZ_TO_SHARD } from "@/shared/config/constants";

export default class OvenClient {
  public constructor(
    private readonly tezos: TezosToolkit,
    public readonly ovenAddress: Address,
    public readonly stableCoinClient: StableCoinClient,
    public readonly harbingerClient: HarbingerClient,
  ) {}

  private async resolveStorage(cache?: Record<string, unknown>): Promise<Record<string, unknown>> {
    return (
      cache ??
      ((await (await this.tezos.wallet.at(this.ovenAddress)).storage()) as Record<string, unknown>)
    );
  }

  public async getCollateralUtilization(): Promise<Shard> {
    const { price } = await this.harbingerClient.getPriceData();
    const priceShard = price.multipliedBy(MUTEZ_TO_SHARD);
    const currentBalance = await this.getBalance();
    const collateralValue = currentBalance
      .multipliedBy(MUTEZ_TO_SHARD)
      .multipliedBy(priceShard)
      .dividedBy(SHARD);
    const totalBorrowedTokens = await this.getTotalOutstandingTokens();
    return new BigNumber(
      totalBorrowedTokens.times(SHARD).dividedBy(collateralValue).toFixed(0, BigNumber.ROUND_DOWN),
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
    const storage = await this.resolveStorage(ovenStorage);
    return storage.owner as Address;
  }

  public async getBorrowedTokens(ovenStorage?: Record<string, unknown>): Promise<Shard> {
    const storage = await this.resolveStorage(ovenStorage);
    return storage.borrowedTokens as Shard;
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
    const storage = await this.resolveStorage(ovenStorage);
    const stabilityFeeTokens: BigNumber = storage.stabilityFeeTokens as BigNumber;

    const resolvedInterestData =
      interestData ?? (await this.stableCoinClient.getInterestData(time));
    const ovenInterestIndex: BigNumber = storage.interestIndex as BigNumber;
    const borrowedTokens = await this.getBorrowedTokens(storage);
    const minterInterestIndex: BigNumber = resolvedInterestData.globalInterestIndex;

    const ratio = minterInterestIndex
      .times(SHARD)
      .div(ovenInterestIndex)
      .integerValue(BigNumber.ROUND_DOWN);
    const totalPrinciple = borrowedTokens.plus(stabilityFeeTokens);
    const newTotalTokens = ratio
      .times(totalPrinciple)
      .div(SHARD)
      .integerValue(BigNumber.ROUND_DOWN);
    return newTotalTokens.minus(borrowedTokens);
  }

  public async isLiquidated(ovenStorage?: Record<string, unknown>): Promise<boolean> {
    const storage = await this.resolveStorage(ovenStorage);
    return storage.isLiquidated as boolean;
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
