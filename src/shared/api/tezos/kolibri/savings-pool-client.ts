import type { Address } from "./types";
import { ContractAbstraction, ContractMethodObject, TezosToolkit, Wallet } from "@taquito/taquito";
import type { WalletProvider } from "@taquito/taquito";
import BigNumber from "bignumber.js";
import { compoundingLinearApproximation, getTokenBalance, interestRateToApy } from "./utils";
import CONSTANTS from "./constants";
import type Decimal from "decimal.js";

export default class SavingsPoolClient {
  private readonly tezos: TezosToolkit;

  public constructor(
    nodeUrl: string,
    wallet: WalletProvider,
    public readonly savingsPoolAddress: string,
  ) {
    const tezos = new TezosToolkit(nodeUrl);
    tezos.setWalletProvider(wallet);
    this.tezos = tezos;
  }

  public async deposit(
    kUSDAmount: BigNumber,
    savingsPoolContract?: ContractAbstraction<Wallet>,
  ): Promise<unknown> {
    const depositTransaction = await this.makeDepositTransaction(kUSDAmount, savingsPoolContract);
    const sendArgs = { amount: 0, mutez: true };
    return await depositTransaction.send(sendArgs);
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
  ): Promise<unknown> {
    const makeRedeemTransaction = await this.makeRedeemTransaction(
      lpTokenAmount,
      savingsPoolContract,
    );
    const sendArgs = { amount: 0, mutez: true };
    return await makeRedeemTransaction.send(sendArgs);
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
    const resolvedSavingsPoolStorage =
      savingsPoolStorage ??
      ((await (await this.tezos.wallet.at(this.savingsPoolAddress)).storage()) as Record<
        string,
        unknown
      >);
    const interestRate = resolvedSavingsPoolStorage.interestRate as BigNumber;
    return interestRateToApy(interestRate);
  }

  public async getPoolSize(
    savingsPoolStorage?: Record<string, unknown>,
    time = new Date(),
  ): Promise<BigNumber> {
    const resolvedSavingsPoolStorage =
      savingsPoolStorage ??
      ((await (await this.tezos.wallet.at(this.savingsPoolAddress)).storage()) as Record<
        string,
        unknown
      >);

    const poolSize = resolvedSavingsPoolStorage.underlyingBalance as BigNumber;
    const lastInterestUpdateTime = resolvedSavingsPoolStorage.lastInterestCompoundTime as string;
    const interestRate = resolvedSavingsPoolStorage.interestRate as BigNumber;

    const lastUpdate = new Date(`${lastInterestUpdateTime}`);
    const deltaMs = time.getTime() - lastUpdate.getTime();
    const deltaSecs = Math.floor(deltaMs / 1000);
    const numPeriods = Math.floor(deltaSecs / CONSTANTS.COMPOUND_PERIOD_SECONDS);

    return compoundingLinearApproximation(poolSize, interestRate, numPeriods);
  }

  public async getLPTokenTotal(savingsPoolStorage?: Record<string, unknown>): Promise<BigNumber> {
    const resolvedSavingsPoolStorage =
      savingsPoolStorage ??
      ((await (await this.tezos.wallet.at(this.savingsPoolAddress)).storage()) as Record<
        string,
        unknown
      >);
    return resolvedSavingsPoolStorage.totalSupply as BigNumber;
  }

  public async getLPTokenConversionRate(
    savingsPoolStorage?: Record<string, unknown>,
    time = new Date(),
  ): Promise<BigNumber> {
    const poolSize = await this.getPoolSize(savingsPoolStorage, time);
    const totalLPTokens = await this.getLPTokenTotal(savingsPoolStorage);
    return poolSize.times(CONSTANTS.PRECISION).times(CONSTANTS.PRECISION).dividedBy(totalLPTokens);
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
    return conversionRate.times(lpTokenBalance).dividedBy(CONSTANTS.PRECISION);
  }
}
