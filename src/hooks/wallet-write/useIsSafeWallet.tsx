import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { from, of } from 'rxjs';
import { IUniversalProvider } from '@walletconnect/universal-provider';
import { catchError, map, tap } from 'rxjs/operators';
import { Eip1193Provider } from '@safe-global/protocol-kit';
import { useSafe } from '@safe-global/safe-react-hooks';

export const useIsSafeWallet = () => {
  const { connector } = useAccount();
  const [isSafe, setIsSafe] = useState<boolean>(false);
  const [safeProvider, setSafeProvider] = useState<Eip1193Provider | undefined>(undefined);

  useEffect(() => {
    if (!!connector && connector.id === 'walletConnect' && 'getProvider' in connector) {
      from(connector.getProvider() as Promise<IUniversalProvider>)
        .pipe(
          map((provider: IUniversalProvider) => {
            const session = provider.session;
            const name: string | undefined = session?.peer.metadata.name;
            const useSafe: boolean = name ? name.toLowerCase().indexOf('safe') >= 0 : false;

            return { useSafe, provider };
          }),
          tap(({ useSafe, provider }) => {
            setIsSafe(useSafe);
            setSafeProvider(provider);
          }),
          catchError(() => {
            setIsSafe(false);
            setSafeProvider(undefined);

            return of(useSafe);
          }),
        )
        .subscribe();
    } else if (connector && connector.name.toLowerCase().indexOf('safe') >= 0) {
      from(connector.getProvider() as Promise<Eip1193Provider>)
        .pipe(
          tap((provider: Eip1193Provider) => {
            setIsSafe(true);
            setSafeProvider(provider);
          }),
        )
        .subscribe();
    } else {
      setIsSafe(false);
      setSafeProvider(undefined);
    }
  }, [connector]);

  return { isSafe, safeProvider };
};
