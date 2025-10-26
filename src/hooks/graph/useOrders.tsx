import { useList, LogicalFilter, CrudOperators } from '@refinedev/core';
import { RequestOrder, RequestOrderStatus } from '../../service/types.ts';

export const useOrders = (status?: RequestOrderStatus[]) => {
  const statusFilter: LogicalFilter | null =
    status && status.length > 0
      ? {
          field: 'status',
          operator: 'in' as Exclude<CrudOperators, 'or' | 'and'>,
          value: status,
        }
      : null;

  const filters: LogicalFilter[] = [statusFilter].filter((i) => i !== null);

  const { result } = useList({
    resource: 'requestOrders',
    filters: filters,
    pagination: {
      pageSize: 1000,
      currentPage: 1,
    },
    sorters: [{ field: 'id', order: 'desc' }],
  });

  return result.data as RequestOrder[];
};
