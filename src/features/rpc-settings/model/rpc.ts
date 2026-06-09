import { createEvent, createEffect, sample } from "effector";
import { $rpcNode } from "@/shared/api/tezos/rpc";
import { tezosToolkit, clearOvenCache } from "@/shared/api/tezos/sdk";

export const rpcNodeChanged = createEvent<string>();

const updateRpcProviderFx = createEffect((url: string) => {
  clearOvenCache();
  tezosToolkit.setRpcProvider(url);
});

sample({
  clock: rpcNodeChanged,
  target: [$rpcNode, updateRpcProviderFx],
});
