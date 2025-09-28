export const SUPPORTED_CHAINS = ["1", "56"] as const;
export type SupportedChainType = (typeof SUPPORTED_CHAINS)[number];

export const CHAIN_RPC: { [c in SupportedChainType]: string } = {
  "1": "https://lb.drpc.org/ethereum/AsQlBGo230qhhptQOBJcQ_BtGYnvm44R8L2Awg8TMB_n",
  "56": "https://lb.drpc.org/bsc/AsQlBGo230qhhptQOBJcQ_BtGYnvm44R8L2Awg8TMB_n",
};

export const CHAIN_ICON: { [c in SupportedChainType]: string } = {
  "1": "https://static.stakestone.io/stone/chains/ethereum.svg",
  "56": "https://static.stakestone.io/stone/chains/bnb.svg",
};


export const CHAIN_EXPLORER_TX = {
  "1": "https://etherscan.io/tx/",
  "56": "https://bscscan.com/tx/",
}