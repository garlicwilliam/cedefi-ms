import { SafePending } from './SafePending.tsx';
import { useAtom } from 'jotai';
import { S } from '../../state/global.ts';
import { useCallback } from 'react';

export const SafeModal = () => {
  const [isPending, setIsPending] = useAtom(S.Wallet.Safe.Pending);
  const [safeTx, setSafeTx] = useAtom(S.Wallet.Safe.SafeTx);

  const onClose = useCallback(() => {
    setIsPending(false);
    if (safeTx?.isSuccessful) {
      setSafeTx(null);
    }
  }, [setIsPending, setSafeTx, safeTx]);

  return <SafePending safeTx={safeTx} isOpen={isPending} onClose={onClose} />;
};
