import { SAFE_SERVICE_URLS, SupportedChainIDsType } from './chain-rpc.ts';
import { DEPLOYED_NETWORK } from './env.ts';

export const SAFE_TX_SERVICE_URL: string = SAFE_SERVICE_URLS[DEPLOYED_NETWORK.id as SupportedChainIDsType];
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
