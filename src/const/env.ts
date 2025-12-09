import { mainnet } from 'wagmi/chains';
import { SAFE_SERVICE_URLS, SupportedChainIDsType, SupportedChainType } from './chain-rpc.ts';

type ConfigType = {
  ADDR_DEPOSIT: `0x${string}`;
  ADDR_WITHDRAW: `0x${string}`;
  ADDR_ORACLE: `0x${string}`;
  ADDR_PARAMS: `0x${string}`;
  ADDR_LP: `0x${string}`;
  ADDR_TIMELOCK_0: `0x${string}`;
  ADDR_TIMELOCK_10?: `0x${string}`;
  ADDR_TIMELOCK_1: `0x${string}`;
  ADDR_TIMELOCK_3: `0x${string}`;
};

export enum ENV {
  Test,
  Prod,
}

const NETWORKS_CONFIG: { [k in ENV]: SupportedChainType } = {
  [ENV.Test]: mainnet,
  [ENV.Prod]: mainnet,
};

const CONTRACTS_CONFIG: { [k in ENV]: ConfigType } = {
  [ENV.Test]: {
    ADDR_DEPOSIT: '0x749342526451Eb0a8c5dc3b02cB60Cb1088ED2cC'.toLowerCase() as `0x${string}`,
    ADDR_WITHDRAW: '0x081D9019b016D7879B3aA4B278728771BFdb0B29'.toLowerCase() as `0x${string}`,
    ADDR_ORACLE: '0xa77Cf3A4C2e97830C9E025a43d2EB1E8a9fD9196'.toLowerCase() as `0x${string}`,
    ADDR_PARAMS: '0x1Fa8E2673ee9de09C31cAd191d8974aC1F125E23'.toLowerCase() as `0x${string}`,
    ADDR_LP: '0x6A6E3a4396993A4eC98a6f4A654Cc0819538721e'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_0: '0x00E72315F630b11034Fd081793fCa1279B6A3d82'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_10: '0xa6B4BFA0Da2a857e074eB9F108e14012c2c71C7c'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_1: '0x5EdDCfE6b829621487a00E3b3d211eF80986dE9A'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_3: '0xbC29f7781a26DD3958D0cAF26885C4820d031AE6'.toLowerCase() as `0x${string}`,
  },
  [ENV.Prod]: {
    ADDR_DEPOSIT: '0x749342526451Eb0a8c5dc3b02cB60Cb1088ED2cC'.toLowerCase() as `0x${string}`,
    ADDR_WITHDRAW: '0x081D9019b016D7879B3aA4B278728771BFdb0B29'.toLowerCase() as `0x${string}`,
    ADDR_ORACLE: '0xa77Cf3A4C2e97830C9E025a43d2EB1E8a9fD9196'.toLowerCase() as `0x${string}`,
    ADDR_PARAMS: '0x1Fa8E2673ee9de09C31cAd191d8974aC1F125E23'.toLowerCase() as `0x${string}`,
    ADDR_LP: '0x6A6E3a4396993A4eC98a6f4A654Cc0819538721e'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_0: '0x00E72315F630b11034Fd081793fCa1279B6A3d82'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_10: '0xa6B4BFA0Da2a857e074eB9F108e14012c2c71C7c'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_1: '0x5EdDCfE6b829621487a00E3b3d211eF80986dE9A'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_3: '0xbC29f7781a26DD3958D0cAF26885C4820d031AE6'.toLowerCase() as `0x${string}`,
  },
};

// 统一版本，SubQuery会根据多个部署版本的indexing状态选择最快的那个
export const SUBQUERY_URL_CONFIG: { [k in ENV]: string } = {
  [ENV.Test]: 'https://gateway.thegraph.com/api/subgraphs/id/2mmjQrxDdLJa3AeWJHm5dZtyg6PzXvJJaPPnjB6vzbPX',
  [ENV.Prod]: 'https://gateway.thegraph.com/api/subgraphs/id/2mmjQrxDdLJa3AeWJHm5dZtyg6PzXvJJaPPnjB6vzbPX',
};
// 最新版本，有最新的数据结构，已经修正了旧版本的错误，但是可能会延迟
export const SUBQUERY_ST_URL_CONFIG: { [k in ENV]: string } = {
  [ENV.Test]: 'https://gateway.thegraph.com/api/subgraphs/id/2mmjQrxDdLJa3AeWJHm5dZtyg6PzXvJJaPPnjB6vzbPX',
  [ENV.Prod]: 'https://gateway.thegraph.com/api/subgraphs/id/2mmjQrxDdLJa3AeWJHm5dZtyg6PzXvJJaPPnjB6vzbPX',
};

const REST_API_CONFIG: { [k in ENV]: string } = {
  [ENV.Test]: 'http://localhost:3000/api',
  [ENV.Prod]: 'https://cedefiapi.stakestone.io/api',
};

// ------------------------------------------------------------------------------------

export const CURRENT_ENV: ENV = ENV.Prod;

export const DEPLOYED_NETWORK: SupportedChainType = NETWORKS_CONFIG[CURRENT_ENV];
export const DEPLOYED_CONTRACTS: ConfigType = CONTRACTS_CONFIG[CURRENT_ENV];
export const SUBQUERY_URL: string = SUBQUERY_URL_CONFIG[CURRENT_ENV];
export const SUBQUERY_ST_URL: string = SUBQUERY_ST_URL_CONFIG[CURRENT_ENV];
export const REST_API: string = REST_API_CONFIG[CURRENT_ENV];
export const SAFE_TX_SERVICE_URL: string = SAFE_SERVICE_URLS[DEPLOYED_NETWORK.id as SupportedChainIDsType];
