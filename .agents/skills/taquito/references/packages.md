# Packages

## Table of Contents

- [Package Catalog](#package-catalog)
- [@taquito/rpc](#taquitorpc)
- [@taquito/michelson-encoder](#taquitomichelson-encoder)
- [@taquito/michel-codec](#taquitomichel-codec)
- [@taquito/utils](#taquitoutils)
- [@taquito/contracts-library](#taquitocontracts-library)
- [@taquito/timelock](#taquitotimelock)
- [@taquito/signer](#taquitosigner)

## Package Catalog

| Package | Purpose |
|---------|---------|
| `@taquito/taquito` | Main SDK — TezosToolkit, Contract/Wallet/Batch/Estimate API |
| `@taquito/rpc` | Typed RPC client — maps 1:1 to Tezos RPC endpoints |
| `@taquito/signer` | InMemorySigner, importKey |
| `@taquito/beacon-wallet` | TZIP-10 Beacon wallet integration |
| `@taquito/wallet-connect` | WalletConnect (Reown) integration |
| `@taquito/remote-signer` | Remote signer client (e.g., Signatory) |
| `@taquito/ledger-signer` | Ledger hardware wallet signer |
| `@taquito/local-forging` | Local operation forging (default forger) |
| `@taquito/michel-codec` | Michelson parser, packer, formatter |
| `@taquito/michelson-encoder` | Michelson ↔ JS object encoding/decoding |
| `@taquito/tzip16` | TZIP-16 contract metadata and views |
| `@taquito/tzip12` | TZIP-12 token metadata |
| `@taquito/contracts-library` | Static contract scripts cache |
| `@taquito/sapling` | Sapling shielded transactions |
| `@taquito/timelock` | Timelock cryptography (BETA) |
| `@taquito/utils` | Encoding, validation, crypto utilities |
| `@taquito/core` | Shared types, interfaces, primitives |
| `@taquito/http-utils` | HTTP transport with retry/timeout (HttpBackend) |

## @taquito/rpc

```ts
import { RpcClient, RpcClientCache } from '@taquito/rpc'

const client = new RpcClient('https://rpc.tzkt.io/mainnet')

// Cached client (TTL: 1000ms default)
const cached = new RpcClientCache(client, 5000) // 5s TTL

// Balance (mutez BigNumber)
const balance = await client.getBalance('tz1...')

// Block data
const block = await client.getBlock()
const hash = await client.getBlockHash()
const constants = await client.getConstants()

// Contract data
const contract = await client.getContract('KT1...')
const entrypoints = await client.getEntrypoints('KT1...')
const script = await client.getScript('KT1...')
const storage = await client.getStorage('KT1...')

// Pack data (simulate PACK instruction)
const packed = await client.packData({ data: { string: 'test' }, type: { prim: 'string' } })

// Run view (TZIP-4 Lambda Views)
const view = await client.runView({
  contract: 'KT1...',
  entrypoint: 'viewName',
  chain_id: await client.getChainId(),
  input: { string: 'testInput' },
})
```

Generally not needed directly — `@taquito/taquito` wraps it. All responses are TypeScript typed.

## @taquito/michelson-encoder

```ts
import { Schema, ParameterSchema } from '@taquito/michelson-encoder'

// Create schema
const schema = new Schema(storageType)
// or from RPC response
const schema = Schema.fromRPCResponse({ script })

// Generate JS type view
schema.generateSchema()  // { stored_counter: "nat", threshold: "nat", keys: { list: "key" } }

// Validate storage object
schema.Typecheck({ stored_counter: 10, threshold: 5, keys: [...] }) // boolean

// Encode: JS → Michelson
const michelsonData = schema.Encode({ stored_counter: 10, threshold: 5 })

// Execute: Michelson → JS (with optional semantic overrides)
const data = schema.Execute(dataMichelson)
const dataCustom = schema.Execute(dataMichelson, {
  big_map: (val) => ({ id: val.int }),
  ticket: (val) => val.args[1].string,
})

// ParameterSchema
const paramSchema = new ParameterSchema(pairType)
paramSchema.Encode('tz1...', '12')       // flattened positional
paramSchema.EncodeObject({ spender: 'tz1...', value: '12' }) // object
```

Nested pairs are **flattened** into a single object. Unannotated fields get numeric indexes. `Schema.Execute` accepts optional `Semantic` for overriding type representations.

## @taquito/michel-codec

```ts
import { Parser, emitMicheline, packDataBytes, unpackDataBytes } from '@taquito/michel-codec'

// Parse Michelson code
const parser = new Parser()  // options: { expandMacros: true, expandGlobalConstant: { 'expr...': json } }
const script = parser.parseScript(michelsonCode)
const expr = parser.parseMichelineExpression(michelsonExpr)
const json = parser.parseJSON(michelineJson)

// Format as readable Michelson
console.log(emitMicheline(code, { indent: ' ', newline: '\n' }))

// Pack data locally (safer than RPC pack)
const packed = packDataBytes(dataJSON, typeJSON)
// { bytes: '050a0000...' }

// Unpack data
const unpacked = unpackDataBytes({ bytes: '050a0000...' }, typeJSON)
// ALWAYS pass type definition for correct decoding (timestamps, addresses)

// Without type: timestamps return raw int instead of ISO string
```

`packDataBytes` from `@taquito/michel-codec` packs locally — safer than RPC (compromised node could return malicious data).

## @taquito/utils

### Validation Functions

```ts
import {
  validateAddress, validateKeyHash, validateContractAddress,
  validateChain, validatePublicKey, validateSignature,
  validateBlock, validateOperation, validateProtocol,
  verifySignature
} from '@taquito/utils'

// ValidationResult: 3=VALID, 0=NO_PREFIX_MATCHED, 1=INVALID_CHECKSUM, 2=INVALID_LENGTH
validateAddress('tz1...')          // tz1/tz2/tz3/KT1
validateKeyHash('tz1...')          // tz1/tz2/tz3 only
validateContractAddress('KT1...')  // KT1 only
```

Checksum-based only — verifies format, NOT existence on chain.

### Encoding Functions

```ts
import { getPkhfromPk, b58Encode, b58DecodeAndCheckPrefix, stringToBytes, bytesToString, num2PaddedHex, encodeOpHash } from '@taquito/utils'

const pkh = getPkhfromPk('edpk...')
const encoded = b58Encode('03...', PrefixV2.Ed25519Signature)
const [buffer, prefix] = b58DecodeAndCheckPrefix('edsig...', [PrefixV2.Ed25519Signature])

// Tezos Domain helpers
const bytes = stringToBytes('hello.tez')
const str = bytesToString(hexBytes)

// Encode operation hash without injection
const opHash = encodeOpHash(signedBytes, new Uint8Array([3]))
```

### Signature Verification

```ts
const isValid = verifySignature(message, publicKey, signature)
// message: hex string, publicKey: base58, signature: base58
```

## @taquito/contracts-library

```ts
import { ContractsLibrary } from '@taquito/contracts-library'

const lib = new ContractsLibrary()
lib.addContract({
  'KT1address1': {
    script: await Tezos.rpc.getNormalizedScript('KT1address1'),
    entrypoints: await Tezos.rpc.getEntrypoints('KT1address1'),
  },
})
Tezos.addExtension(lib)

// Script/entrypoints loaded from library instead of RPC
const contract = await Tezos.contract.at('KT1address1')
```

Reduces RPC calls for known, static contracts.

## @taquito/timelock

```ts
import { Chest, ChestKey, Timelock } from '@taquito/timelock'

// Create chest + key
const { chest, key } = Chest.newChestAndKey(payload, 10000) // time = complexity param, not wall-clock

// Precompute timelock for reuse
const tl = Timelock.precompute(10000) // cache this
const { chest, key } = Chest.fromTimelock(payload, 10000, tl)

// Open chest
const data = chest.open(chestKey, 10000)

// Encode/decode
const chestBytes = chest.encode()
const [decoded] = Chest.fromArray(chestBytes)
```

`time` is complexity parameter (modular exponentiations), recommended starting: `10000`. BETA feature.

## @taquito/http-utils

```ts
import { HttpBackend, HttpRequestFailed, HttpResponseError, HttpTimeoutError } from '@taquito/http-utils'

// Custom HTTP backend with timeout
const httpBackend = new HttpBackend(60000) // 60s timeout

// Pass to RpcClient
const rpcClient = new RpcClient('https://rpc.tzkt.io/mainnet', 'main', httpBackend)
const Tezos = new TezosToolkit(rpcClient)
```

Built-in exponential backoff retry on transient failures. `HttpBackend` is default transport — replace for custom fetch/timeout logic.

## @taquito/signer

```ts
import { InMemorySigner, importKey } from '@taquito/signer'

// From secret key
const signer = await InMemorySigner.fromSecretKey('edsk...')
// From mnemonic
const signer = InMemorySigner.fromMnemonic({ mnemonic: 'word1 word2 ...' })
// From encrypted key
const signer = await InMemorySigner.fromSecretKey('edsk...', 'passphrase')

// Convenience: importKey sets signer on toolkit
import { importKey } from '@taquito/signer'
await importKey(Tezos, 'email', 'password', 'mnemonic')

// Signer interface
await signer.publicKey()
await signer.publicKeyHash()
await signer.secretKey()
await signer.sign(bytes, watermark?)
```
