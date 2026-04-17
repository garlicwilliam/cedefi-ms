import { useList } from '@refinedev/core';
import { useMemo } from 'react';
import { Operator } from '../service/types.ts';

export const useOperators = () => {
  const { result } = useList({
    resource: 'operators',
    pagination: { pageSize: 100, currentPage: 1 },
  });

  const operators = result.data;

  const map = useMemo(() => {
    return operators.reduce((acc, cur: any) => {
      const newUser: Operator = {
        id: cur.id as number,
        name: cur.name as string,
      };

      acc.set(cur.id, newUser);

      return acc;
    }, new Map<number, Operator>());
  }, [operators]);

  return { arr: operators, map };
};
