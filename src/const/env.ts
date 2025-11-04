import { mainnet, sepolia } from 'wagmi/chains';
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
  [ENV.Test]: sepolia,
  [ENV.Prod]: mainnet,
};

const CONTRACTS_CONFIG: { [k in ENV]: ConfigType } = {
  [ENV.Test]: {
    ADDR_DEPOSIT: '0x3a576DEC9031104B64e904bB7A7E04575eAB6fC0'.toLowerCase() as `0x${string}`,
    ADDR_WITHDRAW: '0xfA04A4Ee3fe2912B5faE4C1a863A3467A64E331b'.toLowerCase() as `0x${string}`,
    ADDR_ORACLE: '0x1Fe15a2B426bd5CC5F6C8903e64d39B1e0b0A4cC'.toLowerCase() as `0x${string}`,
    ADDR_PARAMS: '0xCDfd7E312631D93f7a579bAAC09fAd52043E8aA4'.toLowerCase() as `0x${string}`,
    ADDR_LP: '0x3C9b2d558E17b27A199F7426C50BCcF169261984'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_0: '0x910181831B55E3BC515521C15Df45699695f1451'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_1: '0xED4c5c6334A33FaA19FFa9ce3465d533eFAe970b'.toLowerCase() as `0x${string}`,
    ADDR_TIMELOCK_3: '0x87292fE2E0cC88270F4C7f1e5FD979250d873b29'.toLowerCase() as `0x${string}`,
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

export const SUBQUERY_URL_CONFIG: { [k in ENV]: string } = {
  [ENV.Test]: 'https://gateway.thegraph.com/api/subgraphs/id/EXNdatQQSHBwXebGzr7EmCJE7keJ1qsdXwp6gWJ9rGYT',
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
export const REST_API: string = REST_API_CONFIG[CURRENT_ENV];
export const SAFE_TX_SERVICE_URL: string = SAFE_SERVICE_URLS[DEPLOYED_NETWORK.id as SupportedChainIDsType];
