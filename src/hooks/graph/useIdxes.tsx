import { useOne } from '@refinedev/core';
import { useMemo } from 'react';

export function useIdx(id: string) {
  const { result, query } = useOne({ resource: 'idxes', id });

  const counter = useMemo(() => {
    if (result) {
      return result.counter;
    }
  }, [result]);

  return { counter, isSuccess: query.isSuccess, isLoading: query.isLoading, isError: query.isError };
}
