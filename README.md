# KolibriXs

An alternative frontend for [Kolibri Protocol](https://kolibri.finance) — a Tezos DeFi protocol that lets you mint the kUSD stablecoin backed by XTZ collateral.
Live at: [xsfunc.github.io/kolibri](https://xsfunc.github.io/kolibri) — fully matches the source code in this repository.

## Why KolibriXs?

The official [kolibri-frontend](https://github.com/hover-labs/kolibri-frontend) is dead — old RPC nodes doesn't work, last commits are over a year old, critical bugs go unfixed, PRs hang without review. The protocol is alive, TVL is there, but using it through the original UI is impossible. KolibriXs is a working tool for interacting with Kolibri, built from scratch on a modern stack.

## Features

### Wallet & Sessions

- Connect Tezos wallet via Beacon SDK (Temple, Kukai, etc.)
- Auto session restore on repeat visits
- Clean disconnect with state cleanup

### Ovens (CDP Positions)

- View all your ovens with incremental loading (cards appear one by one, top progress bar)
- Oven card: address, status (active/liquidated), baker, collateral utilization, liquidation price, collateral value, XTZ balance, kUSD debt
- Color-coded health indicator: safe (green) → warning (gold) → danger (red)
- Health factor progress bar

### Oven Management

- **Deposit** — add XTZ as collateral (with MAX button, 0.1 XTZ reserve)
- **Withdraw** — remove XTZ from collateral (MAX calculated from current utilization)
- **Borrow** — mint kUSD (MAX = maxDebt − current debt)
- **Repay** — pay off kUSD debt (MAX = min(debt, kUSD wallet balance))
- **Projected utilization preview** before confirming — see how the health factor changes
- Auto-refresh oven data after every operation

### Global Stats

- XTZ/USD price
- kUSD price
- Stability Fee APY
- Collateral Rate %

### Wallet Balances

- kUSD balance + USD equivalent
- XTZ balance + USD equivalent

### RPC Settings

- Switch Tezos RPC node: TzKT, SmartPy, Trilitech
- Custom URL option
- Auto cache clear on node change

### UI/UX

- Responsive layout
- Lazy-loaded

## Kolibri Protocol — Implemented Interactions

| Operation     | Contract             | Method                                            |
| ------------- | -------------------- | ------------------------------------------------- |
| Deposit XTZ   | OVEN_PROXY           | `oven.deposit()` (XTZ transfer)                   |
| Withdraw XTZ  | OVEN_PROXY           | `oven.withdraw(mutez)`                            |
| Borrow kUSD   | OVEN_PROXY           | `oven.borrow(tokens)`                             |
| Repay kUSD    | OVEN_PROXY           | `oven.repay(tokens)`                              |
| Set Baker     | OVEN_PROXY           | `oven.setDelegate(baker)`                         |
| XTZ Price     | HARBINGER_NORMALIZER | `get_price_with_timestamp("XTZUSDT")`             |
| kUSD Price    | QUIPUSWAP.POOL       | Pool storage (TzKT + on-chain fallback)           |
| Minter Data   | MINTER               | TzKT storage API (stability fee, collateral rate) |
| Oven Registry | OVEN_REGISTRY        | `ovensOwnedByAddress(pkh)` via S3 index           |
| Token Balance | TOKEN (kUSD)         | FA1.2 `getBalance()`                              |
| Baker List    | —                    | TzKT delegates API                                |

Key Mainnet contracts: MINTER `KT1UcPwP7Usus8pFFXVQPcW5VZpkhf3LZZ1X`, OVEN_PROXY `KT1JdufSdfg3WyxWJcCRNsBFV9V3x9TQBkJ2`, TOKEN `KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV`, OVEN_FACTORY `KT1Mgy95DVzqVBNYhsW93cyHuB57Q94UFhrh`.

## Tech Stack

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ |
| UI        | React 19 + TypeScript                            |
| State     | EffectorJs                                       |
| Tezos SDK | @taquito/taquito 24 + @taquito/beacon-wallet 24  |
| Styling   | Panda CSS (build-time CSS-in-JS)                 |
| Math      | bignumber.js + decimal.js                        |
| Build     | Vite+ (Vite + Rolldown + Vitest + Oxlint)        |
| Lint      | Oxlint (oxc, typescript, unicorn, react plugins) |

## Architecture

The project follows **Feature-Sliced Design v2.1** — a methodology where code is split into layers with unidirectional dependencies (each layer only imports from layers below):

```
src/
  app/          Initialization, providers, global styles, orchestration
  pages/        Page composition (OvensPage)
  widgets/      Composite UI blocks: Navbar, OvenList, Stats, WalletBalances
  features/     User actions: connect-wallet, manage-oven, set-baker, rpc-settings, donate
  entities/     Business entities: oven, wallet, baker, rpc
  shared/       Infrastructure: api (Tezos SDK clients), config, lib, ui (components)
```

## Quick Start

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Lint and check:

```bash
npm run lint
```

## Support the Project

If KolibriXs is useful to you, consider supporting development with a donation:

**TZ Address:** `tz1UVGqvZd7LxLtA2ZDTMz74fXJWqxRjqJS4` (XTZ, USDt, kUSD, NFT)

**EVM Address:** `0xd50eF0e3b8D6d920a6c898aA139D038e014bA4A9`

**Contact:** Telegram [@xsfunc](https://t.me/xsfunc)
