import { sepolia, mainnet, bsc } from 'viem/chains';
import { Chain } from 'viem';

export const SUPPORTED_CHAINS = [mainnet, sepolia, bsc] as const;
export type SupportedChainIDsType = (typeof SUPPORTED_CHAINS)[number]['id'];
export type SupportedChainType = (typeof SUPPORTED_CHAINS)[number];

export const CHAIN_OBJECTS: { [c in SupportedChainIDsType]: Chain } = {
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
  [bsc.id]: bsc,
};

export const CHAIN_RPC: { [c in SupportedChainIDsType]: string } = {
  [mainnet.id]: 'https://rpc.stakestone.io/ethereum',
  [sepolia.id]: 'https://rpc.stakestone.io/sepolia',
  [bsc.id]: 'https://rpc.stakestone.io/bsc',
};

export const CHAIN_ICON: { [c in SupportedChainIDsType]: string } = {
  [mainnet.id]: 'https://static.stakestone.io/stone/chains/ethereum.svg',
  [sepolia.id]: 'https://static.stakestone.io/stone/chains/ethereum.svg',
  [bsc.id]: 'https://static.stakestone.io/stone/chains/bnb.svg',
};

export const CHAIN_EXPLORER_TX: { [c in SupportedChainIDsType]: string } = {
  [mainnet.id]: 'https://etherscan.io/tx/',
  [sepolia.id]: 'https://sepolia.etherscan.io/tx',
  [bsc.id]: 'https://bscscan.com/tx',
};
