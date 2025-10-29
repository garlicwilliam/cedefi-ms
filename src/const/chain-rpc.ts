import { sepolia, mainnet } from 'viem/chains';
import { Chain } from 'viem';

export const SUPPORTED_CHAINS = [mainnet, sepolia] as const;
export type SupportedChainIDsType = (typeof SUPPORTED_CHAINS)[number]['id'];
export type SupportedChainType = (typeof SUPPORTED_CHAINS)[number];

export const CHAIN_OBJECTS: { [c in SupportedChainIDsType]: Chain } = {
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
};

export const CHAIN_RPC: { [c in SupportedChainIDsType]: string } = {
  [mainnet.id]: 'https://lb.drpc.org/ethereum/AsQlBGo230qhhptQOBJcQ_BtGYnvm44R8L2Awg8TMB_n',
  [sepolia.id]: 'https://lb.drpc.org/sepolia/AsQlBGo230qhhptQOBJcQ_BtGYnvm44R8L2Awg8TMB_n',
};

export const CHAIN_ICON: { [c in SupportedChainIDsType]: string } = {
  [mainnet.id]: 'https://static.stakestone.io/stone/chains/ethereum.svg',
  [sepolia.id]: 'https://static.stakestone.io/stone/chains/ethereum.svg',
};

export const CHAIN_EXPLORER_TX: { [c in SupportedChainIDsType]: string } = {
  [mainnet.id]: 'https://etherscan.io/tx/',
  [sepolia.id]: 'https://sepolia.etherscan.io/tx',
};

export const SAFE_SERVICE_URLS: { [c in SupportedChainIDsType]: string } = {
  [mainnet.id]: 'https://safe-transaction-mainnet.safe.global/api',
  [sepolia.id]: 'https://safe-transaction-sepolia.safe.global/api',
};
