import { SafePending } from './SafePending.tsx';
import { useAtom } from 'jotai';
import { S } from '../../state/global.ts';

export const SafeModal = () => {
  const [isPending, setIsPending] = useAtom(S.Wallet.Safe.Pending);
  const [safeTx] = useAtom(S.Wallet.Safe.SafeTx);

  console.log('safeTx', safeTx);
  return <SafePending safeTx={safeTx} isOpen={isPending} onClose={() => setIsPending(false)} />;
};
