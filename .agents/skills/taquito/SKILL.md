---
name: taquito
description: "Build dApps and interact with the Tezos blockchain using Taquito TypeScript SDK. Use when working with Tezos smart contracts, wallet integrations, token operations (FA2/FA1.2), Michelson encoding, RPC queries, batch operations, staking, delegation, contract origination, or any Tezos blockchain interaction. Triggers on taquito, tezos, tezos-toolkit, michelson, big_map, beacon-wallet, wallet-connect, tezos dapp, smart rollup, FA2 token, delegation, staking tezos."
---

# Taquito

TypeScript SDK for building wallets, dApps, and tooling on Tezos blockchain. Current version targets v24.3.0.

## Core Workflow

```
1. Create TezosToolkit  →  new TezosToolkit(rpcUrl)
2. Set provider         →  Tezos.setProvider({ signer, wallet, forger, packer })
3. Read chain           →  Tezos.tz / Tezos.rpc / contract.storage()
4. Write chain          →  Tezos.contract.* / Tezos.wallet.* / batch
5. Confirm              →  operation.confirmation(N)
```

## Contract API vs Wallet API

| | Contract API | Wallet API |
|---|---|---|
| Access | `Tezos.contract` | `Tezos.wallet` |
| Signer | Local (InMemorySigner, Ledger, RemoteSigner) | External wallet (Beacon, WalletConnect) |
| Send | `contract.methodsObject.foo(args).send()` | `contract.methodsObject.foo(args).send()` |
| Op hash | `operation.hash` | `operation.opHash` |
| Confirmation | `const hash = await op.confirmation(1)` | `const conf = await op.confirmation(1); conf.block.hash` |
| Use case | Backend, scripts, server-side | Frontend dApps, user-controlled keys |

## Quick Patterns

```ts
import { TezosToolkit, OpKind, UnitValue, MichelsonMap } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'

const Tezos = new TezosToolkit('https://rpc.tzkt.io/mainnet')
Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey('edsk...') })

// Read balance (mutez → tez: divide by 1_000_000)
const bal = await Tezos.tz.getBalance('tz1...')
console.log(bal.toNumber() / 1_000_000)

// Transfer
const op = await Tezos.contract.transfer({ to: 'tz1...', amount: 2 })
await op.confirmation(1)

// Contract call
const contract = await Tezos.contract.at('KT1...')
const op2 = await contract.methodsObject.increment(7).send()
await op2.confirmation(1)

// Wallet transfer
const op3 = await Tezos.wallet.transfer({ to: 'tz1...', amount: 2 }).send()
await op3.confirmation(1)

// Batch
const batch = Tezos.contract.batch()
  .withTransfer({ to: 'tz1...', amount: 1 })
  .withOrigination({ code: micheline, storage: 0 })
const batchOp = await batch.send()
await batchOp.confirmation()
```

## Key Gotchas

- **mutez vs tez**: All balances and amounts default to tez. Set `mutez: true` for raw mutez. `1 tez = 1_000_000 mutez`.
- **No default signer**: Must call `setProvider({ signer })` before injecting operations.
- **`methodsObject` vs `methods`**: Prefer `methodsObject` — uses named object args matching annotations. `methods` uses positional args.
- **Pair encoding**: Unannotated pairs use numeric keys `{0: val, 1: val}`. Annotated pairs use annotation names `{name: val}`. Mixed: annotated get names, unannotated get incrementing indices.
- **Optional fields**: `null` = None, `{ Some: value }` = Some. In storage origination, annotated optional fields can be omitted.
- **Union types**: `{0: leftVal}` for Left, `{1: rightVal}` for Right.
- **BigMap.get()** returns Promise; Map.get() returns value directly.
- **KT1 transfers**: Must call `do` entrypoint with Michelson lambda (Babylon migration).
- **LocalForger is default** since v16. Use `CompositeForger` for extra verification.
- **Operation counter**: Each account has monotonically increasing counter. Sequential ops from same account fail — use batch.
- **InMemorySigner**: Dev/test only. Never use with real funds in production.

## TezosToolkit Provider Setters

```ts
Tezos.setSignerProvider(signer)           // Signer interface
Tezos.setRpcProvider(url | RpcClient)     // RPC endpoint
Tezos.setForgerProvider(forger)           // Default: TaquitoLocalForger
Tezos.setWalletProvider(wallet)           // WalletProvider interface
Tezos.setPackerProvider(packer)           // Default: RpcPacker. MichelCodecPacker for local packing
Tezos.setStreamProvider(stream)           // SubscribeProvider
Tezos.setGlobalConstantsProvider(provider)// For contracts with global constants
Tezos.addExtension(module)               // Tzip16Module, Tzip12Module, ContractsLibrary
```

## References

Detailed documentation loaded on demand:

- **[quickstart.md](references/quickstart.md)**: Setup, install, TezosToolkit config, signers (InMemory, Remote, Ledger), providers, RPC nodes
- **[operations.md](references/operations.md)**: Transfer, originate, delegate, batch, staking, smart rollups, consensus key, global constants, failing_noop, estimate, prepare
- **[smart-contracts.md](references/smart-contracts.md)**: Contract interaction, methodsObject, FA2, Michelson encoding (pairs/options/unions/lists), maps/bigmaps, MichelsonMap, storage annotations, lambda views, on-chain views, TZIP-12/16 metadata, failwith errors, complex parameters
- **[wallets.md](references/wallets.md)**: Wallet API details, BeaconWallet, WalletConnect, TempleWallet, confirmation patterns, MichelsonMap for origination
- **[packages.md](references/packages.md)**: @taquito/rpc, michelson-encoder, michel-codec, utils (validation, encoding, verifySignature), contracts-library, timelock, signer package
- **[advanced.md](references/advanced.md)**: Operation flow (prepare→forge→sign→inject), events/EMIT, confirmation observable, drain account, fallback RPC, RPC caching, forger config, tezos domains, liquidity baking, sapling, tickets, signing patterns
