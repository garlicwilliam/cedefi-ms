import { AccessControlProvider } from '@refinedev/core';
import { S } from './state/global.ts';
import { getDefaultStore } from 'jotai';
import { AdminUser } from './service/types.ts';

const PERMIT_KEY = {
  USER: 'user',
  TEAM: 'team',
  PROFIT: 'profit',
  PORTFOLIO: 'portfolio',
  BLACKLIST: 'blacklist',
};

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource }) => {
    const atomStore = getDefaultStore();
    const user: AdminUser | null = atomStore.get(S.Auth.User);

    if (!user || !user.permissions) {
      return { can: false };
    }

    const permissions: string[] = user.permissions;

    if (resource === 'users' && !permissions.includes(PERMIT_KEY.USER)) {
      return { can: false };
    }

    if (resource === 'teams' && !permissions.includes(PERMIT_KEY.TEAM)) {
      return { can: false };
    }

    if (resource === 'blacklist' && !permissions.includes(PERMIT_KEY.BLACKLIST)) {
      return { can: false };
    }

    if (resource === 'portfolios' && !permissions.includes(PERMIT_KEY.PORTFOLIO)) {
      return { can: false };
    }

    if (resource === 'funds') {
      return {
        can: permissions.includes(PERMIT_KEY.TEAM) || permissions.includes(PERMIT_KEY.PORTFOLIO) || permissions.includes(PERMIT_KEY.PROFIT),
      };
    }

    if (
      [
        'profit_allocation_ratios',
        'accounts',
        'accounts_view',
        'acc_profit',
        'acc_profit_user',
        'acc_profit_platform',
        'acc_profit_team',
        'hourly_profit',
        'hourly_profit_user',
        'hourly_profit_platform',
        'hourly_profit_team',
        'profit_reallocations',
        'profit_withdrawals',
      ].includes(resource || '') &&
      !permissions.includes(PERMIT_KEY.PROFIT)
    ) {
      return { can: false };
    }

    return { can: true };
  },
};
