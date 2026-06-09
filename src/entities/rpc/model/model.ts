import { createStore, createEvent } from "effector";
import { DEFAULT_RPC } from "@/shared/api/tezos/rpc";

export const rpcNodeChanged = createEvent<string>();

export const $rpcNode = createStore<string>(DEFAULT_RPC).on(rpcNodeChanged, (_, url) => url);
