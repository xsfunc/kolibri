import { createStore, createEvent, createEffect, sample } from "effector";
import { tezosToolkit, clearOvenCache } from "./sdk";

const DEFAULT_RPC = "https://rpc.tzkt.io/mainnet";

export const $rpcNode = createStore<string>(DEFAULT_RPC);

export const rpcNodeChanged = createEvent<string>();

const updateRpcProviderFx = createEffect((url: string) => {
  clearOvenCache();
  tezosToolkit.setRpcProvider(url);
});

sample({
  clock: rpcNodeChanged,
  target: [$rpcNode, updateRpcProviderFx],
});
