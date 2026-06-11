import type { Address, KolibriOperation } from "./types";
import { ContractAbstraction, ContractMethodObject, TezosToolkit, Wallet } from "@taquito/taquito";
import { BigNumber } from "@/shared/lib/bignumber";
import {
  compoundingLinearApproximation,
  getCompoundingPeriods,
  getTokenBalance,
  interestRateToApy,
  wrapWalletOperation,
} from "./utils";
import { SHARD } from "@/shared/config/constants";
import type Decimal from "decimal.js";
import { handleContractError } from "./errors";

const ZERO_MUTEZ = { amount: 0, mutez: true } as const;

export default class SavingsPoolClient {
  public constructor(
    private readonly tezos: TezosToolkit,
    public readonly savingsPoolAddress: string,
  ) {}

  private async resolveStorage(cache?: Record<string, unknown>): Promise<Record<string, unknown>> {
    return (
      cache ??
      ((await (await this.tezos.contract.at(this.savingsPoolAddress)).storage()) as Record<
        string,
        unknown
      >)
    );
  }

  public async deposit(
    kUSDAmount: BigNumber,
    savingsPoolContract?: ContractAbstraction<Wallet>,
  ): Promise<KolibriOperation> {
    try {
      const depositTransaction = await this.makeDepositTransaction(kUSDAmount, savingsPoolContract);
      const op = await depositTransaction.send(ZERO_MUTEZ);
      return wrapWalletOperation(op);
    } catch (e: unknown) {
      handleContractError(e);
    }
  }

  public async makeDepositTransaction(
    kUSDAmount: BigNumber,
    savingsPoolContract?: ContractAbstraction<Wallet>,
  ): Promise<ContractMethodObject<Wallet>> {
    const resolvedSavingsPoolContract =
      savingsPoolContract ?? (await this.tezos.wallet.at(this.savingsPoolAddress));
    return resolvedSavingsPoolContract.methodsObject["deposit"](kUSDAmount);
  }

  public async redeem(
    lpTokenAmount: BigNumber,
    savingsPoolContract?: ContractAbstraction<Wallet>,
  ): Promise<KolibriOperation> {
    try {
      const makeRedeemTransaction = await this.makeRedeemTransaction(
        lpTokenAmount,
        savingsPoolContract,
      );
      const op = await makeRedeemTransaction.send(ZERO_MUTEZ);
      return wrapWalletOperation(op);
    } catch (e: unknown) {
      handleContractError(e);
    }
  }

  public async makeRedeemTransaction(
    lpTokenAmount: BigNumber,
    savingsPoolContract?: ContractAbstraction<Wallet>,
  ): Promise<ContractMethodObject<Wallet>> {
    const resolvedSavingsPoolContract =
      savingsPoolContract ?? (await this.tezos.wallet.at(this.savingsPoolAddress));
    return resolvedSavingsPoolContract.methodsObject["redeem"](lpTokenAmount);
  }

  public async getInterestRateAPY(savingsPoolStorage?: Record<string, unknown>): Promise<Decimal> {
    const storage = await this.resolveStorage(savingsPoolStorage);
    const interestRate = storage.interestRate as BigNumber;
    return interestRateToApy(interestRate);
  }

  public async getPoolSize(
    savingsPoolStorage?: Record<string, unknown>,
    time = new Date(),
  ): Promise<BigNumber> {
    const storage = await this.resolveStorage(savingsPoolStorage);

    const poolSize = storage.underlyingBalance as BigNumber;
    const lastInterestUpdateTime = storage.lastInterestCompoundTime as string;
    const interestRate = storage.interestRate as BigNumber;

    const lastUpdate = new Date(`${lastInterestUpdateTime}`);
    const numPeriods = getCompoundingPeriods(lastUpdate, time);

    return compoundingLinearApproximation(poolSize, interestRate, numPeriods);
  }

  public async getLPTokenTotal(savingsPoolStorage?: Record<string, unknown>): Promise<BigNumber> {
    const storage = await this.resolveStorage(savingsPoolStorage);
    return storage.totalSupply as BigNumber;
  }

  public async getLPTokenConversionRate(
    savingsPoolStorage?: Record<string, unknown>,
    time = new Date(),
  ): Promise<BigNumber> {
    const poolSize = await this.getPoolSize(savingsPoolStorage, time);
    const totalLPTokens = await this.getLPTokenTotal(savingsPoolStorage);
    return poolSize.times(SHARD).times(SHARD).dividedBy(totalLPTokens);
  }

  public async getLPTokenBalance(
    address: Address,
    tokenContractStorage?: Record<string, unknown>,
  ): Promise<BigNumber> {
    return getTokenBalance(address, this.savingsPoolAddress, this.tezos, tokenContractStorage);
  }

  public async getkUSDTokenBalance(
    address: Address,
    savingsPoolStorage?: Record<string, unknown>,
    tokenContractStorage?: Record<string, unknown>,
  ): Promise<BigNumber> {
    const conversionRate = await this.getLPTokenConversionRate(savingsPoolStorage);
    const lpTokenBalance = await this.getLPTokenBalance(address, tokenContractStorage);
    return conversionRate.times(lpTokenBalance).dividedBy(SHARD);
  }
}
