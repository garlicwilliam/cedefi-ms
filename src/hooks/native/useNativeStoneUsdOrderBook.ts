import { useCallback, useEffect, useState } from 'react';
import { getNativeOrderBookInfo } from '../../service/native.service.ts';
import { tap } from 'rxjs/operators';
import { NativeOrderBookItem } from '../../service/types.ts';

type UseNativeStoneUsdOrderBookParams = {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  chain?: 'ethereum' | 'bsc';
};

export function useNativeStoneUsdOrderBook({
  autoRefresh,
  refreshInterval,
  chain = 'ethereum',
}: UseNativeStoneUsdOrderBookParams) {
  const [trigger, setTrigger] = useState<number>(0);
  const [data, setData] = useState<NativeOrderBookItem[] | null>(null);

  useEffect(() => {
    const sub = getNativeOrderBookInfo(chain)
      .pipe(
        tap((resData: NativeOrderBookItem[]) => {
          const stoneData: NativeOrderBookItem[] = resData.filter(
            (one) => one.base_symbol === 'STONEUSD' || one.quote_symbol === 'STONEUSD',
          );

          setData(stoneData);
        }),
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [trigger, chain]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const intervalId = setInterval(() => {
      setTrigger((trigger) => trigger + 1);
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval]);

  const refetch = useCallback(() => {
    setTrigger((trigger) => trigger + 1);
  }, []);

  return {
    refetch,
    data,
  };
}
