import { useList } from '@refinedev/core';
import { Portfolio } from '../service/types.ts';
import { useMemo } from 'react';

type HookReturnType = {
  arr: Portfolio[];
  map: Map<number, Portfolio>;
  isLoading: boolean;
};

// 全部portfolios的hook
export const usePortfolios: (enabled?: boolean) => HookReturnType = (
  enabled: boolean | undefined,
): HookReturnType => {
  //
  const { result, query } = useList({
    resource: 'portfolios',
    pagination: { pageSize: 1000, currentPage: 1 },
    queryOptions: {
      enabled: enabled == undefined ? true : enabled,
    },
  });

  if (!(result as any)['id']) {
    (result as any)['id'] = Math.random().toString();
  }

  const isLoading = query.isLoading;
  const data = result?.data;

  const map = useMemo(() => {
    const map = (data as any[]).reduce(
      (map: Map<number, Portfolio>, portfolio: Portfolio) => {
        map.set(portfolio.id, portfolio);
        return map;
      },
      new Map<number, Portfolio>(),
    );

    return map;
  }, [data]);

  return { arr: data as Portfolio[], isLoading, map };
};
