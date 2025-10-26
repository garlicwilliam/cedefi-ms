import { useList } from '@refinedev/core';
import { Round } from '../../service/types.ts';
import { useMemo } from 'react';

export const useRounds = () => {
  const { result } = useList({
    resource: 'withdrawRounds',
  });

  const rounds = result.data as Round[];

  const roundsMap = useMemo(() => {
    return rounds.reduce((acc, cur: Round) => {
      acc.set(cur.id, cur);
      return acc;
    }, new Map<string, Round>());
  }, [rounds]);

  return { arr: rounds, map: roundsMap };
};
