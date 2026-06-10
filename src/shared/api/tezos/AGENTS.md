# Tezos & Kolibri SDK

This directory contains the SDK layer for interacting with the Tezos blockchain and the Kolibri DeFi protocol (kUSD stablecoin). Built on Taquito.

## Public API

**Import everything from `@/shared/api/tezos`** — the `index.ts` barrel is the only entry point for consumers. Do not import from `sdk`, `kolibri`, or `rpc` directly.

```
import { getOvenClient, kusdPriceClient, type KusdPriceData } from "@/shared/api/tezos";
```

### Exports

| Category           | Exports                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Clients**        | `getOvenClient`, `stableCoinClient`, `tokenClient`, `kusdPriceClient`, `savingsPoolClient`, `liquidityPoolClient` |
| **SDK management** | `setRpcNode`, `clearOvenCache`, `setWalletProvider`, `clearWalletProvider`                                        |
| **Low-level**      | `tezosToolkit`, `NETWORK_CONTRACTS`, `DEFAULT_RPC`                                                                |
| **Types**          | `KolibriOperation`, `InterestData`, `KusdPriceData`                                                               |
| **Errors**         | `KolibriContractError`, `ContractErrors`                                                                          |

## Architecture Overview

```
tezos/
├── index.ts          ← PUBLIC API (the only import path for consumers)
├── sdk.ts            ← Client instances, factories, wallet/RPC management
├── rpc.ts            ← RPC node URL storage
├── AGENTS.md
└── kolibri/          ← INTERNAL (clients, types, utils, errors)
    ├── index.ts      ← internal barrel (used by sdk.ts + tezos/index.ts only)
    ├── types.ts
    ├── errors.ts
    ├── utils.ts
    ├── contracts.ts
    ├── harbinger-client.ts
    ├── kusd-price-client.ts
    ├── oven-client.ts
    ├── stable-coin-client.ts
    ├── token-client.ts
    ├── savings-pool-client.ts
    └── liquidity-pool-client.ts
```

Dependency chain: `OvenClient` requires `StableCoinClient` and `HarbingerClient`. `StableCoinClient` is standalone. All clients receive a `TezosToolkit` instance.

## SDK Entry Point (sdk.ts)

Initializes a shared `TezosToolkit` with the RPC node from `rpc.ts`. Exports:

- `getOvenClient(ovenAddress)` — factory with in-memory cache (`Map<string, OvenClient>`). Always use this instead of constructing `OvenClient` directly.
- `stableCoinClient`, `tokenClient`, `kusdPriceClient`, `savingsPoolClient`, `liquidityPoolClient` — singleton instances.
- `setRpcNode(url)` — update RPC provider on the shared TezosToolkit + clear oven cache.
- `setWalletProvider(wallet)` / `clearWalletProvider()` — connect/disconnect a Beacon wallet.
- `clearOvenCache()` — clear the oven client cache.
- `NETWORK_CONTRACTS` — mainnet contract addresses from `contracts.ts`.

## KolibriOperation

All write methods return `Promise<KolibriOperation>` — a wrapper that hides Taquito internals and gives the caller control over confirmation:

```ts
interface KolibriOperation {
  readonly opHash: string;
  confirmed(count?: number): Promise<void>; // default 1
}
```

Usage:

```ts
const op = await client.borrow(tokens);
await op.confirmed(); // wait 1 confirmation (default)
await op.confirmed(3); // wait 3 confirmations
const { opHash } = op; // just get the hash, don't wait
```

The caller decides when the operation is "done". The SDK does NOT auto-await confirmations.

## Error Handling (errors.ts)

On-chain Michelson errors are caught by `handleContractError()` and rethrown as `KolibriContractError` with a `ContractErrors` code:

```ts
class KolibriContractError extends Error {
  readonly code: ContractErrors;
}
```

This applies to ALL write methods across all clients. If the error doesn't map to a known `ContractErrors` code, the original error is rethrown as-is.

## Client Reference

### StableCoinClient

Constructor: `(tezos, network, ovenRegistryAddress, minterAddress, ovenFactoryAddress, indexerURL?)`

| Method                                | Description                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `deployOven()` → `KolibriOperation`   | Create a new oven via Oven Factory (`makeOven`)                                                                                                                    |
| `getStabilityFeeApy()`                | Current stability fee as annual percentage yield                                                                                                                   |
| `getSimpleStabilityFee()`             | Raw stability fee per compounding period                                                                                                                           |
| `getRequiredCollateralizationRatio()` | Required collateralization % from Minter contract                                                                                                                  |
| `getInterestData(time?)`              | Global interest index + last update time                                                                                                                           |
| `getOvenCount()`                      | Total number of ovens                                                                                                                                              |
| `ovensOwnedByAddress(address)`        | Array of oven addresses owned by an address                                                                                                                        |
| `getAllOvens()`                       | All ovens — loaded from S3 index (`kolibri-data.s3.amazonaws.com/{network}/oven-key-data.json`), not from on-chain registry. Uses indexerURL fallback if provided. |
| `clearCache()`                        | Clear cached minter storage (60s TTL)                                                                                                                              |

Oven list data comes from an S3 JSON file, not from the on-chain Oven Registry big map. This is a performance optimization — the registry big map is slow to iterate.

### OvenClient

Constructor: `(tezos, ovenAddress, stableCoinClient, harbingerClient)`

| Method                                                        | Description                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------- |
| `deposit(mutez)` → `KolibriOperation`                         | Send XTZ to the oven address (wallet transfer, not contract call) |
| `withdraw(mutez)` → `KolibriOperation`                        | Withdraw XTZ collateral from oven                                 |
| `borrow(tokens)` → `KolibriOperation`                         | Mint kUSD against collateral                                      |
| `repay(tokensToRepay)` → `KolibriOperation`                   | Repay kUSD debt                                                   |
| `setBaker(baker)` → `KolibriOperation`                        | Set or clear the oven's delegate (baker)                          |
| `liquidate()` → `KolibriOperation`                            | Liquidate the oven (calls oven's `liquidate` entrypoint)          |
| `getBalance()`                                                | Oven XTZ balance via RPC                                          |
| `getBorrowedTokens(storage?)`                                 | Raw borrowed tokens from oven storage                             |
| `getTotalOutstandingTokens(time?, storage?, interestData?)`   | Borrowed tokens + accrued stability fees                          |
| `getStabilityFees(time?, storage?, interestData?, borrowed?)` | Accrued stability fees (calculated from interest index ratio)     |
| `getCollateralUtilization()`                                  | Utilization ratio (debt / collateral value) in shard units        |
| `isLiquidated(storage?)`                                      | Whether oven has been liquidated                                  |
| `getOwner(storage?)`                                          | Oven owner address                                                |
| `getBaker()`                                                  | Current delegate (baker) or null                                  |
| `getOvenStorage()`                                            | Full oven contract storage                                        |

Write methods validate positive amounts before sending. `getCollateralUtilization` returns `0` (not NaN/Infinity) for ovens with zero balance.

### HarbingerClient

Constructor: `(tezos, oracleAddress, ovenProxyAddress?)`

| Method           | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| `getPriceData()` | Current XTZ/USD price + timestamp from Harbinger Oracle on-chain view |

Uses the `get_price_with_timestamp` on-chain view. `ovenProxyAddress` is used as `viewCaller` — defaults to empty string if not provided.

### TokenClient

Constructor: `(tezos, tokenAddress)`

| Method                                               | Description                          |
| ---------------------------------------------------- | ------------------------------------ |
| `approveToken(spender, amount)` → `KolibriOperation` | Approve spender for kUSD FA1.2 token |
| `getBalance(address, storage?)`                      | kUSD token balance for an address    |

### KusdPriceClient

Constructor: `(tezos, quipuswapPoolAddress, tzktApiUrl?)`

| Method                                  | Description                                            |
| --------------------------------------- | ------------------------------------------------------ |
| `getkUSDPriceFromTzKT(xtzUsdPrice)`     | kUSD price via TzKT API (reads QuipuSwap pool storage) |
| `getkUSDPriceFromContract(xtzUsdPrice)` | kUSD price via on-chain contract call                  |

Both methods compute kUSD/USD price from QuipuSwap pool reserves and return `{ price, pegPercent, timestamp }`. `pegPercent` is deviation from $1 peg.

### SavingsPoolClient

Constructor: `(tezos, savingsPoolAddress)`

| Method                                                  | Description                                           |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `deposit(kUSDAmount, contract?)` → `KolibriOperation`   | Deposit kUSD into savings pool                        |
| `redeem(lpTokenAmount, contract?)` → `KolibriOperation` | Redeem LP tokens for kUSD                             |
| `makeDepositTransaction(...)`                           | Build deposit tx without sending (for batching)       |
| `makeRedeemTransaction(...)`                            | Build redeem tx without sending (for batching)        |
| `getInterestRateAPY(storage?)`                          | Savings pool interest rate as APY                     |
| `getPoolSize(storage?, time?)`                          | Total kUSD in pool (with compounded interest)         |
| `getLPTokenTotal(storage?)`                             | Total LP token supply                                 |
| `getLPTokenConversionRate(storage?, time?)`             | LP token → kUSD conversion rate                       |
| `getLPTokenBalance(address, storage?)`                  | LP token balance for an address                       |
| `getkUSDTokenBalance(address, storage?, tokenStorage?)` | kUSD-equivalent balance (LP tokens × conversion rate) |

### LiquidityPoolClient

Constructor: `(tezos, liquidityPoolAddress)`

| Method                                              | Description                                       |
| --------------------------------------------------- | ------------------------------------------------- |
| `liquidate(targetOvenAddress)` → `KolibriOperation` | Liquidate an oven via the Liquidity Pool contract |

## Internal Utilities (kolibri/utils.ts)

Used across clients internally. Not part of the public API — consumers don't need them.

| Function                                                 | Description                                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| `interestRateToApy(rate)`                                | Convert per-period interest rate to APY (uses Decimal.js for precision) |
| `compoundingLinearApproximation(initial, rate, periods)` | Linear approximation of compound interest                               |
| `getCompoundingPeriods(since, until)`                    | Number of 60-second compounding periods between two dates               |
| `getTokenBalance(holder, tokenAddress, tezos, storage?)` | FA1.2 token balance lookup from contract storage (uses `contract.at`)   |
| `wrapWalletOperation(op)`                                | Wrap Taquito `WalletOperation` into `KolibriOperation`                  |
