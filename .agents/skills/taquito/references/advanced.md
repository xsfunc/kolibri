# Advanced

## Table of Contents

- [Operation Flow (Low-Level)](#operation-flow)
- [Signing Patterns](#signing-patterns)
- [Drain Account](#drain-account)
- [Fallback RPC](#fallback-rpc)
- [RPC Caching](#rpc-caching)
- [Forger Configuration](#forger-configuration)
- [Tezos Domains](#tezos-domains)
- [Liquidity Baking](#liquidity-baking)
- [Sapling](#sapling)
- [Tickets](#tickets)
- [Confirmation Observable](#confirmation-observable)
- [OpHash Before Injecting](#ophash-before-injecting)

## Operation Flow

Low-level flow: **Prepare → toForge → Forge → Sign → Inject**

```ts
import { LocalForger } from '@taquito/local-forging'

const prepared = await Tezos.prepare.transaction({ to: 'tz1...', amount: 5 })
const forgeParams = Tezos.prepare.toForge(prepared)
const forgedBytes = await new LocalForger().forge(forgeParams)
const signed = await Tezos.signer.sign(forgedBytes, new Uint8Array([3]))
const opHash = await Tezos.rpc.injectOperation(signed.sbytes)
```

Each account has monotonically increasing operation counter. Sequential ops from same account fail — use batch or wait for confirmation.

## Signing Patterns

### Wallet Signing (Beacon)

```ts
import { stringToBytes } from '@taquito/utils'

const formattedInput = [
  'Tezos Signed Message:',
  dappUrl,
  new Date().toISOString(),
  input,
].join(' ')

const bytes = stringToBytes(formattedInput)
const bytesLength = (bytes.length / 2).toString(16).padStart(8, '0')
const payloadBytes = '05' + '01' + bytesLength + bytes

const payload = {
  signingType: SigningType.MICHELINE,
  payload: payloadBytes,
  sourceAddress: userAddress,
}
const { signature } = await wallet.client.requestSignPayload(payload)
```

Format: `05` (Micheline) + `01` (string type) + 4-byte length + bytes.

### Sign Michelson Data

```ts
import { Parser, packDataBytes } from '@taquito/michel-codec'

const p = new Parser()
const dataJSON = p.parseMichelineExpression(data)
const typeJSON = p.parseMichelineExpression(type)
const packed = packDataBytes(dataJSON, typeJSON)
const signed = await Tezos.signer.sign(packed.bytes)
```

Always verify packed bytes before signing. `packDataBytes` from `@taquito/michel-codec` packs locally (safer than RPC).

### TZIP-32 Off-Chain Message

```ts
import { stringToBytes, num2PaddedHex } from '@taquito/utils'

const magicByte = '0x80'
const magicString = 'tezos signed offchain message'
const interface_ = 'tzip://32'
const message = 'Hello world!'

let bytes = stringToBytes(magicString)
  + num2PaddedHex(interface_.length, 8)
  + stringToBytes(interface_)
  + num2PaddedHex(0, 8)  // character encoding
  + num2PaddedHex(message.length, 16)
  + stringToBytes(message)

const signed = await Tezos.signer.sign(bytes, new Uint8Array([parseInt(magicByte, 16)]))
```

### Verify Signature

```ts
import { verifySignature } from '@taquito/utils'
const isValid = verifySignature(payloadBytes, publicKey, signature)
```

Signature prefixes: `edsig`(ed25519/tz1), `spsig`(secp256k1/tz2), `p2sig`(p256/tz3), `BLsig`(BLS/tz4).

## Drain Account

### Implicit (tz1/tz2/tz3)

```ts
import { getRevealFee } from '@taquito/taquito/dist/lib/constants'

const address = await Tezos.signer.publicKeyHash()
const balance = await Tezos.tz.getBalance(address)
const revealFee = getRevealFee(address) // only subtract if unrevealed
const est = await Tezos.estimate.transfer({
  to: 'tz1_destination',
  amount: balance.toNumber() - revealFee,
  mutez: true,
})
const maxAmount = balance.minus(est.suggestedFeeMutez + revealFee).toNumber()
const op = await Tezos.contract.transfer({
  to: 'tz1_destination',
  mutez: true,
  amount: maxAmount,
  fee: est.suggestedFeeMutez,
  gasLimit: est.gasLimit,
  storageLimit: 0,
})
```

`getRevealFee(address)` — subtract only if unrevealed. Do NOT subtract if already revealed.

### Originated (KT1)

```ts
const transferImplicit = (key, mutez) => [
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
const op = await contract.methodsObject.do(transferImplicit('tz1...', balance)).send({ amount: 0 })
```

KT1 drain: fees deducted from manager address, not contract.

## Fallback RPC

Not built into Taquito — implement with JS Proxy:

```ts
import { RpcClient } from '@taquito/rpc'

function createFallbackRpcClient(rpcUrls: string[], chain = 'main') {
  const clients = rpcUrls.map(url => new RpcClient(url, chain))
  let currentIndex = 0

  const handler = {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      if (typeof value !== 'function') return value
      return async (...args) => {
        const start = currentIndex
        let lastError
        do {
          try {
            const method = clients[currentIndex][prop]
            if (typeof method === 'function') return await method.apply(clients[currentIndex], args)
          } catch (error) {
            lastError = error
            currentIndex = (currentIndex + 1) % clients.length
          }
        } while (currentIndex !== start)
        throw lastError
      }
    },
  }
  return new Proxy({}, handler)
}

const Tezos = new TezosToolkit(createFallbackRpcClient([
  'https://tezos-mainnet.octez.io',
  'https://mainnet.smartpy.io',
]))
```

## RPC Caching

```ts
import { RpcClient, RpcClientCache } from '@taquito/rpc'

const cached = new RpcClientCache(new RpcClient('https://rpc.tzkt.io/mainnet'), 5000) // 5s TTL
const Tezos = new TezosToolkit(cached)
```

Default TTL: 1000ms. Reduces RPC calls in dApps.

## Forger Configuration

```ts
import { CompositeForger, RpcForger } from '@taquito/taquito'
import { LocalForger } from '@taquito/local-forging'

// Default: TaquitoLocalForger (local forging, no RPC)

// Composite forger (compare LocalForger + RpcForger, throw on mismatch)
const rpcForger = Tezos.getFactory(RpcForger)()
const composite = new CompositeForger([rpcForger, new LocalForger()])
Tezos.setForgerProvider(composite)

// RpcForger only (when node is trusted)
Tezos.setForgerProvider(Tezos.getFactory(RpcForger)())
```

`CompositeForger` throws `ForgingMismatchError` if forgers disagree. Extra security against compromised nodes.

## Tezos Domains

```ts
import { bytesToString, stringToBytes } from '@taquito/utils'

const DOMAIN_CONTRACT = 'KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS'

// Address → Domain name
const contract = await Tezos.wallet.at(DOMAIN_CONTRACT)
const storage = await contract.storage()
const domain = await storage.store.reverse_records.get(address)
if (domain) return bytesToString(domain.name)

// Domain name → Address
const domain = await storage.store.records.get(stringToBytes('hello.tez'))
if (domain) return domain.address  // domain.owner may differ

// Expiry date
const expiry = await storage.store.expiry_map.get(stringToBytes('hello.tez'))
```

Domain names stored as BYTES — must use `bytesToString()` to decode. Key must be `stringToBytes()` encoded. Mainnet uses `.tez` extension.

## Liquidity Baking

```ts
const LB_SUBSIDY = 2500000 // mutez per block
const creditSubsidy = (xtzPool) => BigNumber(xtzPool).plus(LB_SUBSIDY)

// Always credit subsidy to xtzPool before calculations

// Fee: 0.1% + 0.1% burn = 998001/1000000
// tokenToXtz requires: approve(0) → approve(amount) → tokenToXtz
// addLiquidity requires: approve(0) → approve(maxTokens) → addLiquidity → approve(0)

const batch = Tezos.wallet.batch()
  .withContractCall(tzBtcContract.methodsObject.approve({ spender: lbAddr, value: 0 }))
  .withContractCall(tzBtcContract.methodsObject.approve({ spender: lbAddr, value: amount }))
  .withContractCall(lbContract.methodsObject.tokenToXtz({ to, tokensSold, minXtzBought, deadline }))
const op = await batch.send()
```

Deadline pattern: `new Date(Date.now() + 60000).toISOString()`.

## Sapling

```ts
import { SaplingToolkit, InMemorySpendingKey, InMemoryViewingKey } from '@taquito/sapling'
import { initSapling, preloadSaplingParams } from '@taquito/sapling'

// Init proving params (lazy-loaded on first use)
await initSapling({ params: { source: 'taquito' } }) // or 'zcash', custom URLs, local paths
await preloadSaplingParams() // optional: pre-fetch

// Shielded tx (tz → zet)
const spendingKey = await InMemorySpendingKey.fromMnemonic(mnemonic)
const saplingToolkit = new SaplingToolkit(
  { saplingSigner: spendingKey },
  { contractAddress: 'KT1...', memoSize: 8 },
  readProvider,
)
const shieldedTx = await saplingToolkit.prepareShieldedTransaction([{
  to: paymentAddress, amount: 3, memo: 'test', mutez: false
}])
// MUST send amount: contract.methodsObject.default([shieldedTx]).send({ amount: 3 })

// View balance (no spending key needed)
const viewer = saplingToolkit.getSaplingTransactionViewer()
const balance = await viewer.getBalance() // mutez

// Viewing-key only
const viewingKey = new InMemoryViewingKey('0000...')
const txViewer = new SaplingTransactionViewer(viewingKey, { contractAddress }, readProvider)
```

Shielded tx: amount MUST be sent in `.send({ amount: N })`. Balance in mutez.

## Tickets

Tickets are fungible tokens: `ticketer` (contract address), `value` (comparable type), `amount` (nat).

Taquito can ONLY READ tickets — no write/create operations.

```ts
// Ticket representation
{ ticketer: string, value: any, amount: BigNumber }

// Value type mapping:
// int → BigNumber, string → string, bool → boolean
// bytes → hex string (no 0x prefix)
// option Some → unwrapped value, None → null
// pair → nested object with numeric keys
```

## Confirmation Observable

```ts
// Wallet API only
const entries = await new Promise((resolve, reject) => {
  const evts = []
  op.confirmationObservable(3).subscribe(
    event => evts.push({
      level: event.block.header.level,
      currentConfirmation: event.currentConfirmation,
    }),
    () => reject(null),
    () => resolve(evts),
  )
})
```

Array length = N confirmations + 1 (includes injection block at confirmation 0).

## OpHash Before Injecting

```ts
import { encodeOpHash } from '@taquito/utils'
import { LocalForger } from '@taquito/local-forging'

const prepared = await Tezos.prepare.transaction({ to: 'tz1...', amount: 1 })
const forgeParams = Tezos.prepare.toForge(prepared)
const forgedBytes = await new LocalForger().forge(forgeParams)
const signed = await Tezos.signer.sign(forgedBytes)

const opHash = encodeOpHash(signed.sbytes, new Uint8Array([3]))
```

Get operation hash without injecting. Watermark `new Uint8Array([3])` for operations.
