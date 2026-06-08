# Quickstart

## Table of Contents

- [Install](#install)
- [TezosToolkit](#tezostoolkit)
- [Signers](#signers)
- [RPC Nodes](#rpc-nodes)
- [Provider Configuration](#provider-configuration)
- [Packer](#packer)

## Install

```bash
npm install @taquito/taquito
# Signer for dev/test:
npm install @taquito/signer
# Wallet:
npm install @taquito/beacon-wallet
# WalletConnect:
npm install @taquito/wallet-connect
```

Boilerplate templates: [Vue](https://github.com/ecadlabs/taquito-vue-template), [React](https://github.com/ecadlabs/taquito-react-template), [Ionic](https://github.com/ecadlabs/taquito-ionic-template).

## TezosToolkit

```ts
import { TezosToolkit } from '@taquito/taquito'

// With RPC URL string
const Tezos = new TezosToolkit('https://rpc.tzkt.io/mainnet')

// With custom RpcClient
import { RpcClient } from '@taquito/rpc'
const Tezos = new TezosToolkit(new RpcClient('https://rpc.tzkt.io/mainnet'))

// With custom HttpBackend
const rpcClient = new RpcClient(url, 'main', customHttpBackend)
const Tezos = new TezosToolkit(rpcClient)
```

Multiple TezosToolkit instances can coexist (different RPCs or signers). Distribute via state management.

No default signer — must set one before injecting operations.

## Signers

### InMemorySigner (dev/test only)

```ts
import { InMemorySigner } from '@taquito/signer'

// From secret key
Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey('edsk...') })

// From mnemonic (default ed25519 → tz1)
const signer = InMemorySigner.fromMnemonic({
  mnemonic: 'word1 word2 ...',
})

// Custom derivation + curve (secp256k1 → tz2)
const signer = InMemorySigner.fromMnemonic({
  mnemonic: 'word1 word2 ...',
  derivationPath: "44'/1729'/1'/0'",
  curve: 'secp256k1'
})

// From encrypted key with passphrase
Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey('edsk...', 'passphrase') })

// From hex secret (must b58 encode first)
import { b58Encode, PrefixV2 } from '@taquito/utils'
const b58key = b58Encode('7c842c15...', PrefixV2.P256SecretKey)
Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(b58key) })
```

Derivation paths MUST start with `"44'/1729'/"`. ed25519 requires hardened segments (use `h` or `'`). Operations signed automatically, no prompt.

### RemoteSigner

```ts
import { RemoteSigner } from '@taquito/remote-signer'
Tezos.setProvider({
  signer: new RemoteSigner(pkh, rootUrl, { headers: requestHeaders }),
})
```

### LedgerSigner

```ts
// Browser (Chromium only, enable experimental web platform features)
import TransportWebHID from '@ledgerhq/hw-transport-webhid'
import { LedgerSigner, DerivationType, HDPathTemplate } from '@taquito/ledger-signer'
const transport = await TransportWebHID.create()
const ledgerSigner = new LedgerSigner(transport, HDPathTemplate(0), true, DerivationType.ED25519)
Tezos.setProvider({ signer: ledgerSigner })

// Node.js
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
const transport = await TransportNodeHid.create()
```

`HDPathTemplate(N)` → `44'/1729'/N'/0'`. `DerivationType`: `ED25519`(tz1), `SECP256K1`(tz2), `P256`(tz3). `prompt: true` confirms on device.

## RPC Nodes

Mainnet community nodes:
- Trilitech: `https://tezos-mainnet.octez.io`
- SmartPy: `https://mainnet.smartpy.io`
- Tezos Foundation: `https://rpc.tzbeta.net`
- TzKT: `https://rpc.tzkt.io/mainnet`

Testnet faucet: https://teztnets.com/

## Provider Configuration

```ts
Tezos.setProvider({
  signer: new InMemorySigner('key'),
  rpc: 'https://rpc.tzkt.io/mainnet',
  forger: new LocalForger(),          // default
  packer: new MichelCodecPacker(),    // optional: local packing
  config: {
    confirmationPollingIntervalSecond: 2,
    confirmationPollingTimeoutSecond: 300,
    defaultConfirmationCount: 5,
  }
})
```

## Packer

Default `RpcPacker` uses RPC for PACK. `MichelCodecPacker` packs locally (offline, fewer RPC calls, ~50% faster for big maps):

```ts
import { MichelCodecPacker } from '@taquito/taquito'
Tezos.setPackerProvider(new MichelCodecPacker())
```
