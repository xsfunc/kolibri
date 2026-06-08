# Operations

## Table of Contents

- [Transfer](#transfer)
- [Originate (Deploy Contract)](#originate)
- [Delegate](#delegate)
- [Staking](#staking)
- [Batch](#batch)
- [Estimate](#estimate)
- [Prepare](#prepare)
- [Smart Rollups](#smart-rollups)
- [Consensus Key](#consensus-key)
- [Global Constants](#global-constants)
- [Increase Paid Storage](#increase-paid-storage)
- [Failing Noop](#failing-noop)
- [Governance](#governance)
- [KT1 Transfers](#kt1-transfers)
- [Operation Flow](#operation-flow)

## Transfer

```ts
// Contract API
const op = await Tezos.contract.transfer({ to: 'tz1...', amount: 2 })
await op.confirmation(1) // wait for 1 block

// Wallet API
const op = await Tezos.wallet.transfer({ to: 'tz1...', amount: 2 }).send()
await op.confirmation(1)

// With mutez
const op = await Tezos.contract.transfer({ to: 'tz1...', amount: 2000000, mutez: true })
```

`amount` in tez by default. Set `mutez: true` for mutez. Optional: `fee`, `gasLimit`, `storageLimit`, `source`, `parameter`.

## Originate

Three ways to initialize storage:

```ts
// 1. JS object (preferred, auto-encoded by michelson-encoder)
const op = await Tezos.contract.originate({
  code: michelineJson,
  storage: { stored_counter: 0, threshold: 1, keys: ['edpk...'] },
})
const contract = await op.contract()

// 2. Plain Michelson string
const op = await Tezos.contract.originate({
  code: michelineJson,
  init: `(Pair 0 (Pair 1 { "edpk..." }))`,
})

// 3. JSON Michelson object
const op = await Tezos.contract.originate({
  code: michelineJson,
  init: { prim: 'Pair', args: [{ int: '0' }, { prim: 'Pair', args: [...] }] },
})
```

`storage` and `init` are mutually exclusive. Property order in JS object matters — names stripped in Michelson.

Contract address: `op.contractAddress` (Contract API), `contract.address` after `op.contract()` (Wallet API).

Wallet API: `await Tezos.wallet.originate({...}).send()`.

Batch: `op.getOriginatedContractAddresses()` returns array of KT1 addresses.

## Delegate

```ts
// Set delegate (delegate your coins to a baker)
await Tezos.contract.setDelegate({ source: 'tz1_source', delegate: 'tz1_baker' })

// Register as delegate (self)
await Tezos.contract.registerDelegate({})

// Undelegate (omit delegate property)
await Tezos.contract.setDelegate({ source: 'tz1_source' })
```

Baking requires minimum stake (protocol constant `minimalStake`).

## Staking

```ts
// Stake (Contract API)
const op = await Tezos.contract.stake({ amount: 100, mutez: false })
await op.confirmation()

// Stake (Wallet API)
const op = await Tezos.wallet.stake({ amount: 100 }).send()

// Unstake
const op = await Tezos.contract.unstake({ amount: 50 })
// Unstaked+Frozen for 4 cycles (slashable), then Finalizable

// Finalize Unstake
const op = await Tezos.contract.finalizeUnstake()
```

Before staking: must delegate to a baker who opted in. Changing delegate auto-unstakes. Staking is pseudo-entrypoint (transfer to self). `stake`/`unstake` auto-finalize finalizable funds.

Fund lifecycle: Spendable → Staked → Unstaked+Frozen (4 cycles) → Unstaked+Finalizable → Spendable.

## Batch

```ts
// Chained methods
const batch = Tezos.contract.batch()
  .withTransfer({ to: 'tz1...', amount: 2 })
  .withTransfer({ to: 'tz1...', amount: 4000000, mutez: true })
  .withOrigination({ code, storage: 0, balance: '1' })
  .withDelegation({ delegate: 'tz1...' })
  .withContractCall(contract.methodsObject.foo(arg))
const op = await batch.send()
await op.confirmation()

// Array format with OpKind
const op = await Tezos.contract.batch([
  { kind: OpKind.TRANSACTION, to: 'tz1...', amount: 2 },
  { kind: OpKind.ORIGINATION, code, storage: 0 },
  { kind: OpKind.DELEGATION, delegate: 'tz1...' },
]).send()

// Wallet batch
const batch = Tezos.wallet.batch()
  .withTransfer({ to: 'tz1...', amount: 1 })
  .withContractCall(contract.methodsObject.foo(arg))
const op = await batch.send()
```

Limitations: gas limit constrains batch size; single signer only. Batched ops share one counter value and one tx hash.

Available `with*` methods: `withTransfer`, `withOrigination`, `withDelegation`, `withContractCall`, `withActivation`, `withRegisterGlobalConstant`, `withIncreasePaidStorage`, `withUpdateConsensusKey`, `withSmartRollupAddMessages`, `withSmartRollupOriginate`.

## Estimate

```ts
const est = await Tezos.estimate.transfer({ to: 'tz1...', amount: 1 })
// est.burnFeeMutez, est.gasLimit, est.storageLimit
// est.minimalFeeMutez, est.suggestedFeeMutez (minimal + 20% buffer)
// est.totalCost = minimalFeeMutez + burnFeeMutez

// Contract call estimate
const contract = await Tezos.contract.at('KT1...')
const methodObj = contract.methodsObject.increment(7)
const est = await Tezos.estimate.contractCall(methodObj)

// Origination estimate
const est = await Tezos.estimate.originate({ code, storage })
```

Based on `simulate_operation` + buffer. Context may differ from actual injection → possible `fees_too_low`/`gas_exhausted` errors.

## Prepare

Low-level operation preparation (before forging/signing/injecting):

```ts
const prepared = await Tezos.prepare.transaction({ to: 'tz1...', amount: 5 })

// Convert to forge params
const forgeParams = Tezos.prepare.toForge(prepared)
const forgedBytes = await forger.forge(forgeParams)

// Convert to preapply params
const preapplyParams = await Tezos.prepare.toPreapply(prepared)

// Batch preparation
const prepared = await Tezos.prepare.batch([
  { kind: OpKind.TRANSACTION, to: 'tz1...', amount: 2 },
])

// Contract call preparation
const methodObj = contract.methodsObject.increment(1)
const prepared = await Tezos.prepare.contractCall(methodObj)
```

`toForge()` is synchronous. `toPreapply()` is async.

## Smart Rollups

```ts
// Originate rollup
const op = await Tezos.contract.smartRollupOriginate({
  pvmKind: 'wasm_2_0_0',
  kernel: '23212f757372...', // hex string
  parametersType: { prim: 'bytes' },
})

// Add messages to inbox
const op = await Tezos.contract.smartRollupAddMessages({
  message: ['0000000031010000000b...'] // hex strings
})

// Execute outbox message (L2 → L1)
const op = await Tezos.contract.smartRollupExecuteOutboxMessage({
  rollup: 'sr1...',        // sr1 address
  cementedCommitment: 'src1...', // src1 hash
  outputProof: '030002...' // hex proof
})
```

Only `wasm_2_0_0` pvmKind supported. Outbox message requires cemented commitment.

## Consensus Key

```ts
// Update consensus key (takes effect at current_cycle + PRESERVED_CYCLES + 1)
const op = await Tezos.contract.updateConsensusKey({ pk: 'PUBLIC_KEY' })

// Drain delegate (signed by consensus key, not baker key)
const drain = await Tezos.contract.drainDelegate({
  consensus_key: 'CONSENSUS_PKH',
  delegate: 'BAKER_PKH',
  destination: 'DESTINATION_PKH',
})
```

Consensus key unique per baker. Drain transfers all spendable (not frozen) balance.

## Global Constants

```ts
// Register
const op = await Tezos.contract.registerGlobalConstant({
  value: { prim: 'or', args: [...] },
})
await op.confirmation()
const hash = op.globalConstantHash // expr...

// Use in contract code: replace expression with
// { "prim": "constant", "args": [{ "string": "expr..." }] }

// Deploy contract with global constants in storage
const provider = new DefaultGlobalConstantsProvider()
provider.loadGlobalConstant({ [hash]: expression })
Tezos.setGlobalConstantsProvider(provider)
```

Expression can only be registered once. Must set GlobalConstantsProvider before deploying contracts that reference constants in storage.

## Increase Paid Storage

```ts
const op = await Tezos.contract.increasePaidStorage({
  amount: 2,              // bytes, not tez
  destination: 'KT1...'   // must be KT1
})
```

Resolves storage limit overflow for multiple ops on same contract at same level.

## Failing Noop

```ts
// Sign arbitrary data without risk of on-chain injection
const signed = await Tezos.contract.failingNoop({
  arbitrary: '48656C6C6F20576F726C64', // hex
  basedOnBlock: 'head', // 'head', 'head~N', 'B{hash}', or level number
})
// signed.signature, signed.bytes, signed.prefixSig, signed.signedContent
```

Wallet: `Tezos.wallet.signFailingNoop({...})`. Verify: `verifySignature(signed.bytes, pk, signed.prefixSig, new Uint8Array([3]))`.

## Governance

```ts
// Submit proposals (Proposal Period only, max 20)
const op = await Tezos.contract.proposals({ proposals: ['PROTO_HASH1'] })

// Cast ballot (Exploration/Promotion Period)
const op = await Tezos.contract.ballot({ proposal: 'PROTO_HASH', ballot: 'yay' }) // 'yay'|'nay'|'pass'
```

Contract API only (not Wallet API).

## KT1 Transfers

After Babylon/proto005 migration, all KT1 addresses have `manager.tz` contract. Transfer from KT1 requires `do` entrypoint with Michelson lambda:

```ts
// Transfer from KT1 to tz1
const transferImplicit = (key: string, mutez: number) => [
  { prim: 'DROP' },
  { prim: 'NIL', args: [{ prim: 'operation' }] },
  { prim: 'PUSH', args: [{ prim: 'key_hash' }, { string: key }] },
  { prim: 'IMPLICIT_ACCOUNT' },
  { prim: 'PUSH', args: [{ prim: 'mutez' }, { int: `${mutez}` }] },
  { prim: 'UNIT' },
  { prim: 'TRANSFER_TOKENS' },
  { prim: 'CONS' },
]

const contract = await Tezos.contract.at('KT1...')
await contract.methodsObject.do(transferImplicit('tz1...', 50000000)).send({ amount: 0 })

// Transfer from KT1 to KT1: use transferToContract lambda with CONTRACT + IF_NONE
```

## Operation Flow

Low-level: **Prepare → toForge → Forge → Sign → Inject**

```ts
const prepared = await Tezos.prepare.transaction({ to: 'tz1...', amount: 5 })
const forgeParams = Tezos.prepare.toForge(prepared)

import { LocalForger } from '@taquito/local-forging'
const forger = new LocalForger()
const forgedBytes = await forger.forge(forgeParams)

const signed = await Tezos.signer.sign(forgedBytes, new Uint8Array([3]))
const opHash = await Tezos.rpc.injectOperation(signed.sbytes)
```

`new Uint8Array([3])` is the generic watermark for Tezos operations.
