import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { CHAIN_RPC } from './const/chain-rpc.ts';
import { DEPLOYED_NETWORK } from './const/env.ts';

export const config = getDefaultConfig({
  appName: 'StakeStone',
  projectId: '9155bc0988aa999a5bdf4069c4d050e7',
  chains: [DEPLOYED_NETWORK],
  ssr: false,
  transports: {
    [DEPLOYED_NETWORK.id]: http(CHAIN_RPC[DEPLOYED_NETWORK.id]),
  },
});

export const queryClient = new QueryClient();

export { RainbowKitProvider, WagmiProvider, QueryClientProvider, darkTheme, lightTheme };
