import { useList } from '@refinedev/core';
import { Price } from '../../service/types.ts';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';

export function usePrices() {
  const { result, query } = useList({
    resource: 'prices',
    filters: [
      {
        field: 'token',
        operator: 'eq',
        value: DEPLOYED_CONTRACTS.ADDR_LP.toLowerCase(),
      },
    ],
    sorters: [
      {
        field: 'idx',
        order: 'desc',
      },
    ],
  });

  const pricesRes: Price[] = result.data as Price[];

  return {
    data: pricesRes,
    refresh: query.refetch,
  };
}
