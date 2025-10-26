import { useList, LogicalFilter, CrudOperators } from '@refinedev/core';
import { RequestOrder, RequestOrderStatus } from '../../service/types.ts';

export const useRoundOrders = (round?: string, status?: RequestOrderStatus[]) => {
  const statusFilter: LogicalFilter | null =
    status && status.length > 0
      ? {
          field: 'status',
          operator: 'in' as Exclude<CrudOperators, 'or' | 'and'>,
          value: status,
        }
      : null;

  const roundFilter: LogicalFilter | null = round
    ? {
        field: 'round',
        operator: 'eq' as Exclude<CrudOperators, 'or' | 'and'>,
        value: round,
      }
    : null;

  const filters: LogicalFilter[] = [roundFilter, statusFilter].filter((i) => i !== null);

  const { result, query } = useList({
    resource: 'requestOrders',
    filters: filters,
    pagination: {
      pageSize: 1000,
      currentPage: 1,
    },
    sorters: [{ field: 'id', order: 'desc' }],
    queryOptions: {
      enabled: !!round,
    },
  });

  const data: RequestOrder[] = result.data as RequestOrder[];

  return { data, refresh: query.refetch };
};
