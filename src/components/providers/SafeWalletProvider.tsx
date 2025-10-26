import { createConfig, SafeConfigWithSigner, SafeProvider } from '@safe-global/safe-react-hooks';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useIsSafeWallet } from '../../hooks/wallet-write/useIsSafeWallet.tsx';
import { DEPLOYED_NETWORK } from '../../const/contract.ts';

type Props = { children: React.ReactNode };

export const SafeWalletProvider = ({ children }: Props) => {
  const { address } = useAccount();
  const { isSafe, safeProvider } = useIsSafeWallet();
  const [safeConfig, setSafeConfig] = useState<SafeConfigWithSigner>();

  useEffect(() => {
    if (isSafe && !!safeProvider && !!address) {
      const config = createConfig({
        chain: DEPLOYED_NETWORK,
        provider: safeProvider,
        safeAddress: address,
        signer: address,
      });

      setSafeConfig(config);
    }
  }, [isSafe, safeProvider, address]);

  return safeConfig === undefined ? <>{children}</> : <SafeProvider config={safeConfig}>{children}</SafeProvider>;
};
