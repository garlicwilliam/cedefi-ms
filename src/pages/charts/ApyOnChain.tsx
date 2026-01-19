import React, { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import { useCustom } from '@refinedev/core';
import { STONEUSD_API } from '../../const/env.ts';
import { SldDecimal, SldDecPercent } from '../../util/decimal.ts';
import { useAtomValue } from 'jotai';
import { S } from '../../state/global.ts';

type ApyAllItem = {
  dayIndex: number;
  timestamp: string;
  copy: boolean;
  exchangeRate: string;
  apyFull: string;
  apyD7: string;
  apyD14: string;
  apyD30: string;
  apyD60: string;
  apyD90: string;
  apyD180: string;
  apyD365: string;
  apyRealized: string;
};

export const ApyOnChain = () => {
  const domRef = useRef<HTMLDivElement | null>(null);
  const chart = useRef<ECharts | null>(null);
  const isDark = useAtomValue(S.Theme.IsDark);

  const {
    result: { data },
    query: { isLoading },
  } = useCustom({
    url: STONEUSD_API + '/apy_chart_all',
    method: 'get',
    config: {
      query: {
        start: 0,
      },
    },
    queryOptions: {
      enabled: true,
    },
  });

  const options = useMemo(() => {
    if (!data) {
      return null;
    }

    const apyItems: ApyAllItem[] = data.apyHistory as ApyAllItem[];
    if (!apyItems) {
      return null;
    }

    const xDate: string[] = apyItems.map((item) => {
      return new Date(Number(item.timestamp) * 1000).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      });
    });

    const d14Apy: number[] = apyItems.map((item) => {
      const apyStr = SldDecPercent.fromDecimal(SldDecimal.fromNumeric(item.apyD14, 18)).percentFormat();
      return Number(apyStr);
    });

    const periodApy: number[] = apyItems.map((item) => {
      const apyStr = SldDecPercent.fromDecimal(SldDecimal.fromNumeric(item.apyRealized, 18)).percentFormat();
      return Number(apyStr);
    });

    const exchangeRates: number[] = apyItems.map((item) => {
      const rateStr = SldDecimal.fromNumeric(item.exchangeRate, 18).format({ fix: 6 });
      return Number(rateStr);
    });

    const op: EChartsOption = {
      title: {
        text: 'StoneUSD On-Chain APY History',
        left: 'center',
        textStyle: {
          color: isDark ? '#ffffff' : '#000000',
        },
      },
      legend: {
        data: ['14-Day', 'Periods', 'Exchange Rate'],
      },
      xAxis: {
        type: 'category',
        data: xDate,
      },
      yAxis: [
        {
          type: 'value',
          name: 'APY (%)',
          axisLabel: {
            formatter: '{value} %',
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: isDark ? '#444444' : '#cccccc',
            },
          },
        },
        {
          type: 'value',
          name: 'Exchange Rate',
          axisLabel: {
            formatter: '{value}',
          },
          splitLine: {
            show: false,
          },
          min: 0.99,
        },
      ],
      tooltip: {
        show: true,
        trigger: 'axis',
      },
      grid: {
        top: 100,
        left: 0,
        right: 0,
      },
      series: [
        {
          data: d14Apy,
          type: 'line',
          smooth: true,
          name: '14-Day',
          yAxisIndex: 0,
          itemStyle: {
            color: '#5470C6',
          },
          areaStyle: {
            color: 'rgba(84, 112, 198, 0.2)',
          },
          tooltip: {
            valueFormatter: (value) => {
              return value + '%';
            },
          },
        },
        {
          data: periodApy,
          type: 'line',
          smooth: true,
          name: 'Periods',
          yAxisIndex: 0,
          itemStyle: {
            color: '#91CC75',
          },
          areaStyle: {
            color: 'rgba(145, 204, 117, 0.2)',
          },
          tooltip: {
            valueFormatter: (value) => {
              return value + '%';
            },
          },
        },
        {
          data: exchangeRates,
          type: 'line',
          smooth: true,
          name: 'Exchange Rate',
          yAxisIndex: 1,
          itemStyle: {
            color: '#EE6666',
          },
          tooltip: {
            valueFormatter: (value) => {
              return (value as number).toFixed(6);
            },
          },
        },
      ],
    };

    return op;
  }, [data, isDark]);

  useEffect(() => {
    if (chart.current === null && domRef.current !== null) {
      chart.current = echarts.init(domRef.current);
    }

    return () => {
      if (chart.current) {
        chart.current.dispose();
        chart.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chart.current) {
      return;
    }

    if (!options) {
      return;
    }

    chart.current.setOption(options);
  }, [options]);

  return (
    <div>
      <div ref={domRef} style={{ width: '650px', height: '500px' }}></div>
    </div>
  );
};
