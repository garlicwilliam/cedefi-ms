import { atom } from 'jotai';
import { AdminUser, PermissionCache } from '../service/types.ts';
import { SafeMultisigTransactionResponse } from '@safe-global/types-kit';

export const S = {
  Auth: {
    User: atom<AdminUser | null>(null),
  },
  Cache: {
    Permissions: atom<PermissionCache | null>(null),
  },
  Theme: {
    IsDark: atom<boolean>(true),
  },
  Wallet: {
    Safe: {
      IsSafe: atom<boolean>(false),
      Pending: atom<boolean>(false),
      SafeTx: atom<SafeMultisigTransactionResponse | null>(null),
    },
  },
} as const;
