import { useList } from '@refinedev/core';
import { Price } from '../../service/types.ts';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';

export const useCutOffPrices = () => {
  const { result, query } = useList({
    resource: 'cutOffPrices',
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

  const list = result.data as Price[];

  return {
    data: list,
    refresh: query.refetch,
  };
};
