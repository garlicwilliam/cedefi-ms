import { useCustom } from '@refinedev/core';
import { STONEUSD_API } from '../../const/env.ts';
import { now } from '../../util/time.ts';
import { useMemo } from 'react';
import { ApyAllDataItem } from '../../service/types.ts';
import { SldDecimal, SldDecPercent } from '../../util/decimal.ts';

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

export function useApyPreviewData(startDayIndex: number) {
  const { data, isLoading } = useApyData(startDayIndex);

  const { apyHistory, base14DayRate, base14DayPeriod, periodBase, period } = useMemo(() => {
    const nowDayIdx: number = Math.floor(now() / 86400);
    const preD14Idx: number = nowDayIdx - 14;
    const base14Item: ApyAllDataItem | undefined = data?.find((one) => one.dayIndex === preD14Idx);
    const base14DayRate: SldDecimal | null = base14Item
      ? SldDecimal.fromNumeric(base14Item.exchangeRate, 18)
      : SldDecimal.fromNumeric('1', 18);

    const base14DayPeriod: number = base14Item ? 14 : data ? nowDayIdx - data[0].dayIndex : 0;

    let items: ApyAllDataItem[] = [];
    if (data && data.length > 0) {
      items = data.filter((one) => !one.copy);
    }

    const apyHistory = items.map((one, index) => {
      const prevTime: number = Number(items[index - 1]?.timestamp) || Number(one.timestamp);

      return {
        timestamp: Number(one.timestamp),
        dayIndex: one.dayIndex,
        exchangeRate: SldDecimal.fromNumeric(one.exchangeRate, 18),
        apyD14: SldDecPercent.fromDecimal(SldDecimal.fromNumeric(one.apyD14, 18)),
        apyPeriod: SldDecPercent.fromDecimal(SldDecimal.fromNumeric(one.apyRealized, 18)),
        periodHours: Math.floor((Number(one.timestamp) - Number(items[index].timestamp)) / 3600),
        periodDays: ((Number(one.timestamp) - prevTime) / 86400).toFixed(0),
      };
    });

    const last = apyHistory.length > 0 ? apyHistory[apyHistory.length - 1] : null;
    const periodBase = last?.dayIndex === nowDayIdx ? apyHistory[apyHistory.length - 2] : last;
    const period = last ? (last.dayIndex === nowDayIdx ? last.periodDays : nowDayIdx - last.dayIndex) : 0;

    return {
      apyHistory,
      base14DayRate,
      base14DayPeriod,
      periodBase,
      period,
    };
  }, [data]);

  return {
    apyHistory,
    base14DayRate,
    base14DayPeriod,
    isLoading,
    periodBase,
    period,
  };
}
