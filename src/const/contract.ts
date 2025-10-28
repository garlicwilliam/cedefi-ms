import { sepolia } from 'viem/chains';
import { Chain } from 'viem';
import { SAFE_SERVICE_URLS, SupportedChainType } from './chain-rpc.ts';

export const ADDR_DEPOSIT: `0x${string}` = '0x3a576DEC9031104B64e904bB7A7E04575eAB6fC0'.toLowerCase() as `0x${string}`;
export const ADDR_WITHDRAW: `0x${string}` = '0xfA04A4Ee3fe2912B5faE4C1a863A3467A64E331b'.toLowerCase() as `0x${string}`;
export const ADDR_ORACLE: `0x${string}` = '0x1Fe15a2B426bd5CC5F6C8903e64d39B1e0b0A4cC'.toLowerCase() as `0x${string}`;
export const ADDR_PARAMS: `0x${string}` = '0xCDfd7E312631D93f7a579bAAC09fAd52043E8aA4'.toLowerCase() as `0x${string}`;
export const ADDR_LP: `0x${string}` = '0x3C9b2d558E17b27A199F7426C50BCcF169261984'.toLowerCase() as `0x${string}`;
export const ADDR_TIMELOCK_0: `0x${string}` = '0x910181831B55E3BC515521C15Df45699695f1451'.toLowerCase() as `0x${string}`;
export const ADDR_TIMELOCK_1: `0x${string}` = '0xED4c5c6334A33FaA19FFa9ce3465d533eFAe970b'.toLowerCase() as `0x${string}`;
export const ADDR_TIMELOCK_3: `0x${string}` = '0x87292fE2E0cC88270F4C7f1e5FD979250d873b29'.toLowerCase() as `0x${string}`;

export const DEPLOYED_NETWORK: Chain = sepolia;
export const SAFE_TX_SERVICE_URL: string = SAFE_SERVICE_URLS[DEPLOYED_NETWORK.id.toString() as SupportedChainType];

export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const GRAPH_API_URL = 'https://api.studio.thegraph.com/query/70107/cedefi-sepolia-2/version/latest';
