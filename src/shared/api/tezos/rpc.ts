import { createStore } from "effector";

const DEFAULT_RPC = "https://rpc.tzkt.io/mainnet";

export const $rpcNode = createStore<string>(DEFAULT_RPC);

export { DEFAULT_RPC };
