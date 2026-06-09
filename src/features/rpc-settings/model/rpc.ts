import { createEffect, sample } from "effector";
import { $rpcNode, rpcNodeChanged } from "@/entities/rpc";
import { setRpcNode } from "@/shared/api/tezos/rpc";
import { tezosToolkit, clearOvenCache } from "@/shared/api/tezos/sdk";

const updateRpcProviderFx = createEffect((url: string) => {
  setRpcNode(url);
  clearOvenCache();
  tezosToolkit.setRpcProvider(url);
});

sample({
  clock: rpcNodeChanged,
  target: [$rpcNode, updateRpcProviderFx],
});
