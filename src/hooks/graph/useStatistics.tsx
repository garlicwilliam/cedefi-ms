import { useCallback, useEffect, useState } from 'react';
import { StatisticData, subgraphService } from '../../service/subgraph.service.ts';
import { tap } from 'rxjs/operators';

export const useStatistics = () => {
  const [statistic, setStatistic] = useState<StatisticData | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    const sub = subgraphService
      .getStatistics()
      .pipe(
        tap((statistic) => {
          if (statistic) {
            setStatistic(statistic);
          }
        }),
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [refreshFlag]);

  const refresh = useCallback(() => {
    setRefreshFlag((prev) => prev + 1);
  }, []);

  return { statistic, refresh };
};

export function useStatisticsByTime(snapshotAt: number | null) {
  const [statistic, setStatistic] = useState<StatisticData | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    if (!snapshotAt) {
      return;
    }

    const sub = subgraphService
      .getStatisticsByTime(String(snapshotAt))
      .pipe(
        tap((statistics) => {
          if (statistics) {
            setStatistic(statistics);
          }
        }),
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [snapshotAt, refreshFlag]);

  const refresh = useCallback(() => {
    setRefreshFlag((prev) => prev + 1);
  }, []);

  return { statistic, refresh };
}
