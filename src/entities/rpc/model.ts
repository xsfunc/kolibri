import { createStore, createEvent, sample } from "effector";
import { DEFAULT_RPC } from "@/shared/config/links";

export const rpcNodeChanged = createEvent<string>();

export const $rpcNode = createStore<string>(DEFAULT_RPC);

sample({ clock: rpcNodeChanged, target: $rpcNode });
