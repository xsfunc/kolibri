# Smart Contracts

## Table of Contents

- [Contract Interaction](#contract-interaction)
- [Michelson Encoding](#michelson-encoding)
- [Maps and BigMaps](#maps-and-bigmaps)
- [MichelsonMap Class](#michelsonmap-class)
- [Storage Annotations](#storage-annotations)
- [Lambda Views](#lambda-views)
- [On-Chain Views](#on-chain-views)
- [FA2 Token Parameters](#fa2-token-parameters)
- [TZIP-16 Metadata](#tzip-16-metadata)
- [TZIP-12 Token Metadata](#tzip-12-token-metadata)
- [Complex Parameters](#complex-parameters)
- [Failwith Errors](#failwith-errors)
- [Contract Events](#contract-events)

## Contract Interaction

```ts
const contract = await Tezos.contract.at('KT1...')

// Inspect method signatures
const sigs = contract.parameterSchema.ExtractSignatures()

// Inspect transfer params before sending
const params = contract.methodsObject.increment(2).toTransferParams()

// Call entrypoint (Contract API)
const op = await contract.methodsObject.increment(7).send()
await op.confirmation(1)

// Call entrypoint (Wallet API)
const walletContract = await Tezos.wallet.at('KT1...')
const op = await walletContract.methodsObject.increment(7).send()
await op.confirmation(1)

// Read storage
const storage = await contract.storage()

// Get contract code for re-deployment
const code = contract.script.code // JSON Michelson
```

`methodsObject` uses named object args. `methods` uses positional args. Prefer `methodsObject`.

Multi-arg entrypoints use numeric keys: `{0: val1, 1: val2}`. Unit-value entrypoints need `UnitValue`:
```ts
contract.methodsObject.noArgEntrypoint(UnitValue).send()
```

## Michelson Encoding

| Michelson | Taquito JS |
|-----------|-----------|
| `unit` | `UnitValue` (import from `@taquito/taquito`) |
| `bool True/False` | `true`/`false` |
| `int 6` | `6` |
| `nat 7` | `7` or `'7'` |
| `string "Tezos"` | `"Tezos"` |
| `mutez 500000` | `500000` or `50_000` |
| `timestamp` | `"2022-12-19T15:53:26.055Z"` (use `new Date().toISOString()`) |
| `bytes 0xCAFE` | `"CAFE"` (no 0x prefix) |
| `address` | `"tz1..."` or `"KT1..."` |
| `key_hash` | `"tz1..."` |
| `key` | `"edpk..."` |
| `signature` | `"edsig..."` |

### Option Types

```ts
// None → null
// Some 6 → 6 or [6] or {Some: 6}
// Some (option nat) None → {Some: null}
```

### Union (or) Types

```ts
// Left 5 → {0: 5}
// Right "Tezos" → {1: "Tezos"}
```

### Pair Types

```ts
// pair int nat → {0: 6, 1: 7}
// pair (int %one) (nat %two) → {one: 6, two: 7}
// Nested: pair (pair int nat) (pair string mutez) → {0: 6, 1: 7, 2: "Tezos", 3: 50000}
```

### List Types

```ts
// list nat → [5, 6, 7]
// list (pair int string) → [{0: 5, 1: "Tezos"}, {0: 6, 1: "Taquito"}]
```

### Bypass Michelson Encoder

For complex nested optionals that the encoder may mishandle, pass raw JSON Michelson:

```ts
await Tezos.contract.transfer({
  to: 'KT1...',
  amount: 0,
  parameter: {
    entrypoint: 'default',
    value: { prim: 'Pair', args: [{ int: '6' }, { string: 'tez' }] }
  }
})
```

## Maps and BigMaps

- **Map**: More storage, less gas. Values deserialized entirely. `get()` returns value directly.
- **BigMap**: Less storage, more gas per access. Values fetched lazily. `get()` returns **Promise**.

```ts
// Read Map value (synchronous)
const value = storage['themap'].get('key')

// Read BigMap value (async)
const value = await storage['thebigmap'].get('key')

// Pair as key (unannotated) — use numeric indexes
const value = storage['themap'].get({ 0: '1', 1: 'tz1...' })

// Fetch multiple big map values at once (consistent block)
const values = await storage['0'].getMultipleValues(['tz1...', 'tz1...'])

// Local packing for big maps (faster, no RPC roundtrip for PACK)
import { MichelCodecPacker } from '@taquito/taquito'
Tezos.setPackerProvider(new MichelCodecPacker())
```

## MichelsonMap Class

```ts
import { MichelsonMap } from '@taquito/taquito'

// Create empty
const m = new MichelsonMap()

// With type schema
const m = new MichelsonMap({ prim: 'map', args: [{ prim: 'string' }, { prim: 'mutez' }] })

// With initial values
const m = MichelsonMap.fromLiteral({ alice: 25, bob: 16 })

// Methods
m.set('key', value)
m.get('key')        // value or undefined
m.has('key')        // boolean
m.delete('key')     // no error if missing
m.clear()
m.size              // number
m.forEach((val, key) => {})
m.entries()         // generator
m.keys()            // generator
m.values()          // generator
MichelsonMap.isMichelsonMap(obj)  // boolean
```

Required (not plain JS Map/Object) for initializing map/big_map storage during origination.

## Storage Annotations

```ts
// All annotated: use annotation names
{ theAddress: 'tz1...', theBool: true, theNat: '3', theNumber: '5', theTez: '10' }

// No annotations: use numeric indexes
{ 0: 'tz1...', 1: true, 2: '3', 3: '5', 4: '10' }

// Mixed: annotated use names, unannotated use incrementing numeric index
{ 0: 'tz1...', 1: true, theNat: '3', theNumber: '5', 2: '10' }
```

Cannot access annotated fields by index. Numeric index continues incrementing regardless of annotations. `mutez` values as strings.

## Lambda Views

```ts
// Execute TZIP-4 callback view (no fees, no on-chain injection)
const contract = await Tezos.contract.at('KT1...')
const totalSupply = await contract.views.getTotalSupply(UnitValue).read()
const balance = await contract.views.balance_of([{ owner: 'tz1...', token_id: '0' }]).read()
```

Must call `.read()` to execute. Do NOT include callback parameter. `UnitValue` from `@taquito/taquito`.

## On-Chain Views

```ts
// Simulate on-chain view (Hangzhou+)
const contract = await Tezos.contract.at('KT1...')
const result = await contract.contractViews.fib(10).executeView({
  viewCaller: 'KT1...'  // required
})
```

Different from lambda views: `contract.contractViews` (on-chain) vs `contract.views` (lambda/TZIP-4). Types `ticket`, `operation`, `big_map`, `sapling_state` NOT allowed in view args/returns.

## FA2 Token Parameters

```ts
// Transfer
const transferParams = [{
  from_: "tz1...",  // trailing underscore (JS reserved word)
  txs: [
    { to_: "tz1...", token_id: 0, amount: 100 },
    { to_: "tz1...", token_id: 1, amount: 200 },
  ]
}]
const op = await contract.methodsObject.transfer(transferParams).send()

// Balance of
const balanceParams = {
  request: [{ owner: 'tz1...', token_id: '0' }],
  callback: 'KT1...'  // callback contract
}

// Update operators
const opParams = [{
  add_operator: { owner: "tz1...", operator: "tz1...", token_id: 0 }
}, {
  remove_operator: { owner: "tz1...", operator: "tz1...", token_id: 2 }
}]
const op = await contract.methodsObject.update_operators(opParams).send()

// Batch: approve + transfer
const batchOp = await Tezos.wallet.batch()
  .withContractCall(tokenContract.methodsObject.update_operators([{
    add_operator: { owner: USER, operator: DAPP, token_id: 0 }
  }]))
  .withContractCall(dappContract.methodsObject.mint())
  .send()
```

FA2 requires: `transfer`, `balance_of`, `update_operators` entrypoints.

## TZIP-16 Metadata

```ts
import { Tzip16Module, tzip16 } from '@taquito/tzip16'

Tezos.addExtension(new Tzip16Module())
const contract = await Tezos.contract.at('KT1...', tzip16)

// Get metadata
const { uri, metadata, integrityCheckResult } = await contract.tzip16().getMetadata()

// Execute off-chain views
const views = await contract.tzip16().metadataViews()
const result = await views.someView().executeView()
const result2 = await views['multiply-nat']().executeView(10)

// Custom IPFS gateway
const customHandler = new Map([
  ['ipfs', new IpfsHttpHandler('dweb.link')],
  ['tezos-storage', new TezosStorageHandler()],
])
Tezos.addExtension(new Tzip16Module(new MetadataProvider(customHandler)))
```

Default handlers: HttpHandler, IpfsHandler (gateway: `ipfs.io`), TezosStorageHandler.

## TZIP-12 Token Metadata

```ts
import { Tzip12Module, tzip12 } from '@taquito/tzip12'
import { Tzip16Module, tzip16 } from '@taquito/tzip16'

Tezos.addExtension(new Tzip16Module())
Tezos.addExtension(new Tzip12Module())
const contract = await Tezos.contract.at('KT1...', tzip12)

const tokenMeta = await contract.tzip12().getTokenMetadata(1)
// { token_id, decimals, name?, symbol?, ... }
```

Tzip12Module reuses Tzip16Module's MetadataProvider if already added. Two metadata sources: off-chain view named `token_metadata`, or big map `%token_metadata` in storage. Off-chain view takes precedence.

## Complex Parameters

```ts
// Union values in maps: wrap chosen type in curly braces
dataMap.set('Hello', { bool: true })
dataMap.set('World', { nat: '3' })

// Optional fields in storage: can omit when annotated
recordsBigMap.set('FFFF', {
  data: dataMap,
  owner: 'tz1...',
  // optional 'address' and 'ttl' fields omitted
})

// Optional fields in contract calls: use { Some: val } / null
const op = await contract.methodsObject.set_record({
  address: { Some: 'tz1...' },
  ttl: null,
}).send()

// Inspect before sending
const params = contract.methodsObject.foo(arg).toTransferParams()
```

## Failwith Errors

```ts
import { TezosOperationError } from '@taquito/taquito'

try {
  const op = await contract.methodsObject.fail_with_string("error").send()
  await op.confirmation()
} catch (err) {
  if (err instanceof TezosOperationError) {
    // String FAILWITH: err.message
    // Other type: err.errors[err.errors.length - 1].with (Michelson expression)
  }
}
```

## Contract Events

```ts
// Get event schema
const schema = contract.eventSchema
// [{ tag: "%tag1", type: { prim: "int" } }, ...]

// Subscribe
Tezos.setStreamProvider(Tezos.getFactory(PollingSubscribeProvider)({
  shouldObservableSubscriptionRetry: true,
  pollingIntervalMilliseconds: 1500,
}))

const sub = Tezos.stream.subscribeEvent({
  tag: 'tagName',
  address: 'KT1...',
  excludeFailedOperations: true,
})
sub.on('data', console.log)

// Subscribe to ALL events
const sub = Tezos.stream.subscribeEvent()
```

Events use `EMIT` Michelson instruction. Output includes: `opHash`, `blockHash`, `level`, `source`, `tag`, `payload`.
