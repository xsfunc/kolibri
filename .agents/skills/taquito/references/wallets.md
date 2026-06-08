# Wallets

## Table of Contents

- [Wallet API Overview](#wallet-api-overview)
- [BeaconWallet](#beaconwallet)
- [WalletConnect](#walletconnect)
- [TempleWallet](#templewallet)
- [Confirmation Patterns](#confirmation-patterns)
- [Origination via Wallet](#origination-via-wallet)
- [Wallet Provider Interface](#wallet-provider-interface)

## Wallet API Overview

```ts
const Tezos = new TezosToolkit('https://rpc.tzkt.io/mainnet')
Tezos.setWalletProvider(walletInstance)

// Transfer
const op = await Tezos.wallet.transfer({ to: 'tz1...', amount: 0.2 }).send()
console.log(op.opHash)  // NOT op.hash
const result = await op.confirmation()
if (result.completed) { /* success */ }

// Contract call
const contract = await Tezos.wallet.at('KT1...')
const op = await contract.methodsObject.increment(7).send()
await op.confirmation()

// Originate
const op = await Tezos.wallet.originate({ code, storage }).send()
const contract = await op.contract()
console.log(contract.address)
```

Key differences from Contract API:
- Use `Tezos.wallet` (not `Tezos.contract`)
- Must call `.send()` on operations
- Op hash at `operation.opHash` (not `operation.hash`)
- Confirmed hash at `confirmation.block.hash` (not root object)
- `operation._included` is `false` until in a block, then `true`

## BeaconWallet

```ts
import { BeaconWallet } from '@taquito/beacon-wallet'

const wallet = new BeaconWallet({
  name: 'MyDapp',
  iconUrl: 'https://example.com/icon.svg',
  network: { type: 'mainnet' },  // set at instantiation, NOT requestPermissions
})

await wallet.requestPermissions()
const userAddress = await wallet.getPKH()
Tezos.setWalletProvider(wallet)

// Subscribe to events
await wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, (data) => {
  console.log(data.address)
})
```

### Logout vs Account Switch

```ts
// Full logout — removes ALL Beacon localStorage data, instance becomes unusable
await wallet.disconnect()
// Must create new BeaconWallet to reconnect

// Account switch only — removes active account reference, keeps relay/peer data
await wallet.clearActiveAccount()
// Can call requestPermissions again on same instance
```

Using `clearActiveAccount` as logout leaves `beacon:matrix-selected-node` in localStorage, which can cause connection failures if that relay goes offline.

Works with any TZIP-10 compatible wallet (Temple, Kukai, etc.).

## WalletConnect

```ts
import { WalletConnect, NetworkType, PermissionScopeMethods } from '@taquito/wallet-connect'

const walletConnect = await WalletConnect.init({
  projectId: 'YOUR_PROJECT_ID',  // from https://cloud.reown.com
  metadata: {
    name: 'MyDapp',
    description: 'Description',
    icons: ['https://example.com/icon.png'],
    url: 'https://example.com',
  },
})

await walletConnect.requestPermissions({
  permissionScope: {
    networks: [NetworkType.MAINNET],
    methods: [
      PermissionScopeMethods.TEZOS_SEND,
      PermissionScopeMethods.TEZOS_SIGN,
      PermissionScopeMethods.TEZOS_GET_ACCOUNTS,
    ],
  },
  pairingTopic: 'existing_pairing_topic', // optional: skip QR modal
})

Tezos.setWalletProvider(walletConnect)
```

### Session Management

```ts
// Restore existing session
const keys = walletConnect.getAllExistingSessionKeys()
if (keys.length) {
  walletConnect.configureWithExistingSessionKey(keys[0]) // synchronous
}

// Handle session events
walletConnect.signClient.on('session_delete', ({ topic }) => { /* reset state */ })
walletConnect.signClient.on('session_update', ({ topic }) => { /* update UI */ })

// Multi-account
walletConnect.setActiveAccount(address) // set active account
const accounts = walletConnect.getAccounts() // list all
const pkh = walletConnect.getPKH() // active account PKH

// Multi-network
walletConnect.setActiveNetwork(network) // set active network
```

Missing required scope throws `MissingRequiredScope`. Invalid session key throws `InvalidSessionKey`.

## TempleWallet

```ts
import { TempleWallet } from '@temple-wallet/dapp'

const available = await TempleWallet.isAvailable()
if (!available) throw new Error('Temple Wallet not installed')

const wallet = new TempleWallet('MyDapp')
await wallet.connect('mainnet') // 'mainnet' | 'testnet' | 'sandbox'
const Tezos = wallet.toTezos() // synchronous — returns TezosToolkit with wallet set
const userAddress = wallet.pkh || (await wallet.getPKH())
Tezos.setWalletProvider(wallet)
```

## Confirmation Patterns

```ts
// Basic confirmation
const confirmation = await op.confirmation(1)
// { completed, currentConfirmation, block: { hash, header: { level }, chain_id } }

// Observable (Wallet API only)
const entries = await new Promise((resolve, reject) => {
  const evts = []
  op.confirmationObservable(3).subscribe(
    event => evts.push({ level: event.block.header.level, currentConfirmation: event.currentConfirmation }),
    () => reject(null),
    () => resolve(evts),
  )
})
```

Observable emits event per block. Array length = N confirmations + 1 (includes injection block).

## Origination via Wallet

```ts
import { MichelsonMap } from '@taquito/taquito'
import { Parser } from '@taquito/michel-codec'

const parser = new Parser()
const parsedMichelson = parser.parseScript(michelsonCode)

const op = await Tezos.wallet.originate({
  code: parsedMichelson,
  storage: {
    ledger: MichelsonMap.fromLiteral({ alice: 25, bob: 16 }),
    owner: 'tz1...',
  },
}).send()

const contract = await op.contract()
console.log(contract.address)
```

MichelsonMap required for map/big_map storage init (not plain JS Map/Object).

## Wallet Provider Interface

```ts
interface WalletProvider {
  getPKH(): Promise<string>
  getPK(): Promise<string>
  mapTransferParamsToWalletParams(params: () => Promise<WalletTransferParams>): Promise<any>
  mapOriginateParamsToWalletParams(params: () => Promise<WalletOriginateParams>): Promise<any>
  mapDelegateParamsToWalletParams(params: () => Promise<WalletDelegateParams>): Promise<any>
  sendOperations(params: any[]): Promise<string>
  sign(bytes: string, watermark?: Uint8Array): Promise<string>
}
```

Supported wallets: Temple (browser extension, TZIP-10), Kukai (web, TZIP-10), Umami (desktop, TZIP-10). Ledger doesn't implement TZIP-10. Exodus and Trust Wallet do NOT support TZIP-10.
