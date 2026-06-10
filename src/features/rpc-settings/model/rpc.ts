import { createEffect, sample } from "effector";
import { $rpcNode, rpcNodeChanged } from "@/entities/rpc";
import { setRpcNode, clearOvenCache } from "@/shared/api/tezos";

const updateRpcProviderFx = createEffect((url: string) => {
  setRpcNode(url);
  clearOvenCache();
});

sample({
  clock: rpcNodeChanged,
  target: [$rpcNode, updateRpcProviderFx],
});
