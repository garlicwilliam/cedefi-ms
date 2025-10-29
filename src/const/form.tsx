import { ChainLabel } from '../components/chains/ChainLabel.tsx';
import { TokenLabel } from '../components/chains/TokenLabel.tsx';
import { CHAIN_ICON } from './chain-rpc.ts';

export const CHAIN_SELECT_OPTIONS = [
  {
    label: <ChainLabel chainId={'1'} icon={CHAIN_ICON['1']} name={'Ethereum'} />,
    value: '1',
  },
];

export const ASSETS_SELECT_OPTIONS = [
  {
    label: <TokenLabel symbol={'USDT'} icon={'https://static.stakestone.io/assets/imgs/tokens/usdt1.svg'} />,
    value: 'USDT',
  },
  {
    label: <TokenLabel symbol={'USDC'} icon={'https://static.stakestone.io/assets/imgs/tokens/usdc2.svg'} />,
    value: 'USDC',
  },
  {
    label: <TokenLabel symbol={'USD1'} icon={'https://static.stakestone.io/assets/imgs/tokens/usd1.svg'} />,
    value: 'USD1',
  },
];
