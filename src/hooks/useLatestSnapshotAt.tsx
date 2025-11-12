import { useList } from '@refinedev/core';
import { useMemo } from 'react';

export function useLatestSnapshotAt() {
  const {
    result: { data: rates },
    query: { isLoading, isError },
  } = useList({
    resource: 'rate_snapshots',
    sorters: [{ field: 'snapshotAt', order: 'desc' }],
    pagination: { pageSize: 1 },
  });

  const snapshotAt: number | null = useMemo(() => {
    return rates.length > 0 ? (rates[0] as any).snapshotAt : null;
  }, [rates]);

  return { snapshotAt, isLoading, isError };
}
