import BigNumber from "bignumber.js";

export type Address = string;
export type Mutez = BigNumber;
export type Shard = BigNumber;
export type DeployedContractAddressOrNull = string | null;

export type ContractGroup = {
  MINTER: DeployedContractAddressOrNull;
  OVEN_PROXY: DeployedContractAddressOrNull;
  OVEN_FACTORY: DeployedContractAddressOrNull;
  TOKEN: DeployedContractAddressOrNull;
  OVEN_REGISTRY: DeployedContractAddressOrNull;
  DEVELOPER_FUND: DeployedContractAddressOrNull;
  STABILITY_FUND: DeployedContractAddressOrNull;
  ORACLE: DeployedContractAddressOrNull;
  HARBINGER_NORMALIZER: DeployedContractAddressOrNull;
  YOUVES_PROXY: DeployedContractAddressOrNull;
  LIQUIDITY_POOL: DeployedContractAddressOrNull;
  SAVINGS_POOL: DeployedContractAddressOrNull;
  DEXES: {
    QUIPUSWAP: {
      POOL: DeployedContractAddressOrNull;
      FA1_2_FACTORY: DeployedContractAddressOrNull;
      FA2_FACTORY: DeployedContractAddressOrNull;
    };
    PLENTY: {
      POOL: DeployedContractAddressOrNull;
      PLENTY_QUIPUSWAP_POOL: DeployedContractAddressOrNull;
      PLENTY_TOKEN: DeployedContractAddressOrNull;
    };
  };
  KOLIBRI_BAKER: DeployedContractAddressOrNull;
  GOVERNOR: DeployedContractAddressOrNull;
  PAUSE_GUARDIAN: DeployedContractAddressOrNull;
  BREAK_GLASS_MULTISIG: DeployedContractAddressOrNull;
  FUND_ADMIN: DeployedContractAddressOrNull;
  DAO: DeployedContractAddressOrNull;
  DAO_TOKEN: DeployedContractAddressOrNull;
  DAO_COMMUNITY_FUND: DeployedContractAddressOrNull;
  FARMS: {
    KUSD: { farm: DeployedContractAddressOrNull; reserve: DeployedContractAddressOrNull };
    QLKUSD: { farm: DeployedContractAddressOrNull; reserve: DeployedContractAddressOrNull };
    KUSD_LP: { farm: DeployedContractAddressOrNull; reserve: DeployedContractAddressOrNull };
    YOUVES_FLAT: { farm: DeployedContractAddressOrNull; reserve: DeployedContractAddressOrNull };
  };
  PAYMENT_VAULTS: { [key: string]: string[] };
  VOTING_VAULTS: { [key: string]: string };
  BREAK_GLASS_CONTRACTS: {
    MINTER: DeployedContractAddressOrNull;
    OVEN_PROXY: DeployedContractAddressOrNull;
    OVEN_FACTORY: DeployedContractAddressOrNull;
    TOKEN: DeployedContractAddressOrNull;
    OVEN_REGISTRY: DeployedContractAddressOrNull;
    DEVELOPER_FUND: DeployedContractAddressOrNull;
    STABILITY_FUND: DeployedContractAddressOrNull;
    ORACLE: DeployedContractAddressOrNull;
    LIQUIDITY_POOL: DeployedContractAddressOrNull;
    SAVINGS_POOL: DeployedContractAddressOrNull;
    DAO_COMMUNITY_FUND: DeployedContractAddressOrNull;
    PAYMENT_VAULTS: { [key: string]: string[] };
  };
};

export type Contracts = {
  ZERO: ContractGroup;
  TEST: ContractGroup;
  MAIN: ContractGroup;
  SANDBOX: ContractGroup;
};

enum Network {
  Mainnet = "mainnet",
  Delphi = "delphinet",
  Edo2Net = "edo2net",
  Florence = "florencenet",
  Granada = "granadanet",
  Hangzhou = "hangzhounet",
  Sandbox = "sandboxnet",
}
export { Network };

enum ContractErrors {
  Unknown = -1,
  NotOven = 1,
  NotOvenProxy = 2,
  NotOracle = 3,
  NotGovernor = 4,
  NotMinter = 5,
  NotOwner = 6,
  NotOvenFactory = 7,
  NotAdmin = 8,
  NotPauseGuardian = 9,
  NotUnderCollateralized = 10,
  OvenUnderCollateralized = 11,
  BadState = 12,
  BadDestination = 13,
  WrongAsset = 14,
  AmountNotAllowed = 15,
  Liquidated = 16,
  StaleData = 17,
  Paused = 18,
  CannotReceiveFunds = 19,
  DebtCeiling = 20,
  OvenMaximumExceeded = 21,
  TokenNoTransferPermission = 22,
  TokenInsufficientBalance = 23,
  TokenUnsafeAllowanceChange = TokenInsufficientBalance,
  TokenNotAdministrator = 24,
  BadSplits = 25,
  NotAllowedToLiquidate = 26,
  NotSavingsAccount = 27,
  BadSender = 28,
}
export { ContractErrors };

export type Oven = {
  ovenOwner: Address;
  ovenAddress: Address;
};

export type InterestData = {
  globalInterestIndex: Shard;
  lastUpdateTime: Date;
};

export type HarbingerPriceFeedData = {
  time: Date;
  price: Mutez;
};

export type KusdPriceData = {
  price: BigNumber;
  pegPercent: BigNumber;
  timestamp: number;
};
