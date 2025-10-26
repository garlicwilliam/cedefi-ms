import { useList } from '@refinedev/core';
import { ADDR_LP } from '../../const/contract.ts';
import { Price } from '../../service/types.ts';

export const useCutOffPrices = () => {
  const { result, query } = useList({
    resource: 'cutOffPrices',
    filters: [
      {
        field: 'token',
        operator: 'eq',
        value: ADDR_LP.toLowerCase(),
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
