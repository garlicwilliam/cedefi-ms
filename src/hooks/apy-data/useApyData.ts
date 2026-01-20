import { useCustom } from '@refinedev/core';
import { STONEUSD_API } from '../../const/env.ts';
import { now } from '../../util/time.ts';
import { useMemo } from 'react';
import { ApyAllDataItem } from '../../service/types.ts';

export function useApyData(startDayIdx: number) {
  const {
    result: { data },
    query: { isLoading },
  } = useCustom({
    url: STONEUSD_API + '/apy_chart_all',
    method: 'get',
    config: {
      query: {
        start: startDayIdx,
      },
    },
    queryOptions: {
      enabled: true,
    },
  });

  const apy = useMemo(() => {
    if (!data) {
      return null;
    }

    const apyItems: ApyAllDataItem[] = data.apyHistory as ApyAllDataItem[];
    if (!apyItems) {
      return null;
    }

    return apyItems;
  }, [data]);

  return {
    data: apy,
    isLoading,
  };
}

export function useLatestApyData(): { data: ApyAllDataItem | null; isLoading: boolean } {
  const nowTime: number = now();
  const nowDayIdx: number = Math.floor(nowTime / 86400);
  const { data, isLoading } = useApyData(nowDayIdx - 1);

  return {
    data: data && data.length > 0 ? data[data.length - 1] : null,
    isLoading,
  };
}
