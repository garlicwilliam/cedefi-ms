import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { mainnet, bsc, sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export const config = getDefaultConfig({
  appName: 'StakeStone',
  projectId: '9155bc0988aa999a5bdf4069c4d050e7',
  chains: [mainnet, bsc, sepolia],
  ssr: false,
  transports: {
    [mainnet.id]: http('https://lb.drpc.org/ethereum/AsQlBGo230qhhptQOBJcQ_BtGYnvm44R8L2Awg8TMB_n'),
    [bsc.id]: http('https://lb.drpc.org/bsc/AsQlBGo230qhhptQOBJcQ_BtGYnvm44R8L2Awg8TMB_n'),
    [sepolia.id]: http('https://lb.drpc.org/sepolia/AsQlBGo230qhhptQOBJcQ_BtGYnvm44R8L2Awg8TMB_n'),
  },
});

export const queryClient = new QueryClient();

export { RainbowKitProvider, WagmiProvider, QueryClientProvider, darkTheme, lightTheme };
