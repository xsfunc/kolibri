const DEFAULT_RPC = "https://rpc.tzkt.io/mainnet";

let currentRpc = DEFAULT_RPC;

export const getRpcNode = () => currentRpc;
export const setRpcNode = (url: string) => {
  currentRpc = url;
};

export { DEFAULT_RPC };
