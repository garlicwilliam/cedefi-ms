import { useList } from '@refinedev/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SldDecimal } from '../../util/decimal.ts';
import { E18 } from '../../util/big-number.ts';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import { now } from '../../util/time.ts';
import { useAtomValue } from 'jotai';
import { S } from '../../state/global.ts';
import { Select, Switch } from 'antd';
import { styleMerge } from '../../util/css.ts';
import styles from './index.module.scss';
import * as _ from 'lodash';

type ApyItem = {
  timestamp: number;
  rate: SldDecimal;
  apy2D: number;
  apy3D: number;
  apy7D: number;
  apy14D: number;
  apy30D: number;
};

function genDateLabel(timestamp: number, useAvg: boolean): string | Date {
  if (useAvg) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  } else {
    return new Date(timestamp * 1000);
  }
}

function computeApy(baseRate: SldDecimal, curRate: SldDecimal, days: number): number {
  if (days <= 0) {
    throw new Error('Days must be greater than 0');
  }

  if (baseRate.isZero()) {
    throw new Error('Base rate cannot be zero');
  }

  const delta: SldDecimal = curRate.sub(baseRate);
  const r: string = delta.mul(E18).div(baseRate.toOrigin()).toNumeric();

  return Math.pow(Number(r) + 1, 365 / days) - 1;
}

function computeApyList(
  data: any[],
  pickTime: number,
  useDayAvg: boolean,
  preDays = 30,
): { apy: ApyItem[]; rateMap: Map<number, SldDecimal> } {
  const apyList: ApyItem[] = [];

  if (!data) {
    return { apy: apyList, rateMap: new Map<number, SldDecimal>() };
  }

  const rateItems = data.map((item) => {
    const timestamp: number = item.snapshotAt as number;
    const rate: SldDecimal = SldDecimal.fromNumeric(item.exchangeRate.toString(), 18);
    return { timestamp, rate };
  });

  //
  const rateMap = new Map<number, SldDecimal>();
  rateItems.forEach((item) => {
    rateMap.set(item.timestamp, item.rate);
  });

  // 平均rate计算
  const dayRateMap = new Map<number, SldDecimal[]>();
  const avgRateMap = new Map<number, SldDecimal>();
  rateItems.forEach((item) => {
    const dayIdx: number = Math.floor(item.timestamp / 86400);
    if (!dayRateMap.has(dayIdx)) {
      dayRateMap.set(dayIdx, []);
    }
    dayRateMap.get(dayIdx)!.push(item.rate);
  });
  dayRateMap.forEach((rates, dayIdx) => {
    const sumRate: SldDecimal = rates.reduce((acc, cur) => acc.add(cur), SldDecimal.fromNumeric('0', 18));
    const avgRate: SldDecimal = sumRate.div(BigInt(rates.length));
    avgRateMap.set(dayIdx, avgRate);
  });

  //
  const nowHourIdx: number = Math.floor(now() / 3600);
  const startHourIdx: number = nowHourIdx - 24 * preDays;

  for (let i: number = startHourIdx; i <= nowHourIdx; i++) {
    const hourTimestamp: number = i * 3600;
    const rate: SldDecimal | undefined = rateMap.get(hourTimestamp);
    const rate2D: SldDecimal | undefined = rateMap.get(hourTimestamp - 24 * 3600 * 2);
    const rate3D: SldDecimal | undefined = rateMap.get(hourTimestamp - 24 * 3600 * 3);
    const rate7D: SldDecimal | undefined = rateMap.get(hourTimestamp - 24 * 3600 * 7);
    const rate14D: SldDecimal | undefined = rateMap.get(hourTimestamp - 24 * 3600 * 14);
    const rate30D: SldDecimal | undefined = rateMap.get(hourTimestamp - 24 * 3600 * 30);

    if (rate && rate2D && rate3D && rate7D && rate14D && rate30D) {
      // all rates exist
      const apy2D: number = computeApy(rate2D, rate, 2);
      const apy3D: number = computeApy(rate3D, rate, 3);
      const apy7D: number = computeApy(rate7D, rate, 7);
      const apy14D: number = computeApy(rate14D, rate, 14);
      const apy30D: number = computeApy(rate30D, rate, 30);

      //
      apyList.push({
        timestamp: hourTimestamp,
        rate: rate,
        apy2D,
        apy3D,
        apy7D,
        apy14D,
        apy30D,
      });
    }
  }

  let apy = [];

  if (useDayAvg) {
    const dayItems = _.groupBy(apyList, (item: ApyItem) => {
      return Math.floor(item.timestamp / 86400).toString();
    });

    apy = Object.keys(dayItems).map((dayKey: string) => {
      const dayIdx: number = Number(dayKey);
      const avgRate = avgRateMap.get(dayIdx);
      const avgRate2D = avgRateMap.get(dayIdx - 2);
      const avgRate3D = avgRateMap.get(dayIdx - 3);
      const avgRate7D = avgRateMap.get(dayIdx - 7);
      const avgRate14D = avgRateMap.get(dayIdx - 14);
      const avgRate30D = avgRateMap.get(dayIdx - 30);

      if (!avgRate || !avgRate2D || !avgRate3D || !avgRate7D || !avgRate14D || !avgRate30D) {
        throw new Error('Average rate data missing for day index ' + dayKey);
      }

      const avgApy2D: number = computeApy(avgRate2D, avgRate, 2);
      const avgApy3D: number = computeApy(avgRate3D, avgRate, 3);
      const avgApy7D: number = computeApy(avgRate7D, avgRate, 7);
      const avgApy14D: number = computeApy(avgRate14D, avgRate, 14);
      const avgApy30D: number = computeApy(avgRate30D, avgRate, 30);

      return {
        timestamp: Number(dayKey) * 86400,
        rate: avgRate,
        apy2D: avgApy2D,
        apy3D: avgApy3D,
        apy7D: avgApy7D,
        apy14D: avgApy14D,
        apy30D: avgApy30D,
      };
    });
  } else {
    apy = apyList.filter((item) => {
      const hour = Math.floor(item.timestamp / 3600) % 24;
      return hour == pickTime;
    });
  }

  return {
    apy: apy,
    rateMap,
  };
}

function genOptions(apy: ApyItem[], isDark: boolean, useAvg: boolean): EChartsOption {
  // 数据序列
  const apy2D = apy.map((item) => [genDateLabel(item.timestamp, useAvg), (item.apy2D * 100).toFixed(2)]);
  const apy3D = apy.map((item) => [genDateLabel(item.timestamp, useAvg), (item.apy3D * 100).toFixed(2)]);
  const apy7D = apy.map((item) => [genDateLabel(item.timestamp, useAvg), (item.apy7D * 100).toFixed(2)]);
  const apy14D = apy.map((item) => [genDateLabel(item.timestamp, useAvg), (item.apy14D * 100).toFixed(2)]);
  const apy30D = apy.map((item) => [genDateLabel(item.timestamp, useAvg), (item.apy30D * 100).toFixed(2)]);
  const exchangeRates = apy.map((item) => [genDateLabel(item.timestamp, useAvg), item.rate.toNumeric()]);

  //
  const options: EChartsOption = {
    title: {
      text: 'APY and Exchange Rate Based On Snapshots',
      left: 'center',
      textStyle: {
        color: isDark ? '#ffffff' : '#000000',
      },
    },
    tooltip: {
      show: true,
      trigger: 'axis',
    },
    legend: {
      data: ['2 Day', '3 Day', '7 Day', '14 Day', '30 Day', 'Exchange Rate'],
    },
    xAxis: {
      type: useAvg ? 'category' : 'time',
      data: useAvg
        ? apy.map((item) => {
            const date = new Date(item.timestamp * 1000);
            return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          })
        : undefined,
    },
    yAxis: [
      {
        type: 'value',
        name: 'APY (%)',
        position: 'left',
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
        position: 'right',
        axisLabel: {
          formatter: '{value}',
        },
        splitLine: {
          show: false,
        },
        min: 0.99,
      },
    ],
    grid: {
      top: 100,
      left: 0,
      right: 0,
    },
    series: [
      {
        data: apy2D,
        type: 'line',
        smooth: true,
        name: '2 Day',
        showSymbol: false,
        tooltip: {
          valueFormatter: (value) => {
            return value + '%';
          },
        },
        itemStyle: {
          color: '#ff9900',
        },
      },
      {
        data: apy3D,
        type: 'line',
        smooth: true,
        name: '3 Day',
        showSymbol: false,
        tooltip: {
          valueFormatter: (value) => {
            return value + '%';
          },
        },
      },
      {
        data: apy7D,
        type: 'line',
        smooth: true,
        name: '7 Day',
        showSymbol: false,
        tooltip: {
          valueFormatter: (value) => {
            return value + '%';
          },
        },
        itemStyle: {
          color: '#8a9a00',
        },
      },
      {
        data: apy14D,
        type: 'line',
        smooth: true,
        name: '14 Day',
        showSymbol: false,
        tooltip: {
          valueFormatter: (value) => {
            return value + '%';
          },
        },
        itemStyle: {
          color: '#289f00',
        },
      },
      {
        data: apy30D,
        type: 'line',
        smooth: true,
        name: '30 Day',
        showSymbol: false,
        tooltip: {
          valueFormatter: (value) => {
            return value + '%';
          },
        },
        itemStyle: {
          color: '#00bfaf',
        },
      },
      {
        data: exchangeRates,
        type: 'line',
        smooth: true,
        name: 'Exchange Rate',
        yAxisIndex: 1,
        showSymbol: false,
        itemStyle: {
          color: '#EE6666',
        },
        tooltip: {
          valueFormatter: (value) => {
            return (Number(value) as number).toFixed(6);
          },
        },
      },
    ],
  };

  return options;
}

export const ApyOfRate = () => {
  const domRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);
  const isDark = useAtomValue(S.Theme.IsDark);
  const [samplingTime, setSamplingTime] = useState<number>(0);
  const [useAvg, setUseAvg] = useState<boolean>(false);
  const [preDays, setPreDays] = useState(14);

  const {
    result: { data },
  } = useList({
    resource: 'rate_snapshots',
    pagination: { currentPage: 1, pageSize: 24 * (preDays + 30) },
  });

  const { options } = useMemo(() => {
    const { apy, rateMap } = computeApyList(data, samplingTime, useAvg, preDays);

    const options: EChartsOption = genOptions(apy, isDark, useAvg);

    return { apy, options, rateMap };
  }, [data, isDark, samplingTime, useAvg, preDays]);

  useEffect(() => {
    if (domRef.current !== null && chartRef.current === null) {
      chartRef.current = echarts.init(domRef.current);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !options) {
      return;
    }

    chartRef.current.setOption(options);
  }, [options]);

  return (
    <div>
      <div ref={domRef} style={{ width: '650px', height: '500px' }}></div>
      <div className={styleMerge(styles.chartControl)}>
        <div>
          采样时间：{' '}
          <Select
            style={{ width: 120 }}
            onChange={(value) => setSamplingTime(value)}
            value={samplingTime}
            disabled={useAvg}
            options={[
              { value: 0, label: '00:00 UTC' },
              { value: 1, label: '01:00 UTC' },
              { value: 2, label: '02:00 UTC' },
              { value: 3, label: '03:00 UTC' },
              { value: 4, label: '04:00 UTC' },
              { value: 5, label: '05:00 UTC' },
              { value: 6, label: '06:00 UTC' },
              { value: 7, label: '07:00 UTC' },
              { value: 8, label: '08:00 UTC' },
              { value: 9, label: '09:00 UTC' },
              { value: 10, label: '10:00 UTC' },
              { value: 11, label: '11:00 UTC' },
              { value: 12, label: '12:00 UTC' },
              { value: 13, label: '13:00 UTC' },
              { value: 14, label: '14:00 UTC' },
              { value: 15, label: '15:00 UTC' },
              { value: 16, label: '16:00 UTC' },
              { value: 17, label: '17:00 UTC' },
              { value: 18, label: '18:00 UTC' },
              { value: 19, label: '19:00 UTC' },
              { value: 20, label: '20:00 UTC' },
              { value: 21, label: '21:00 UTC' },
              { value: 22, label: '22:00 UTC' },
              { value: 23, label: '23:00 UTC' },
            ]}
          />
        </div>

        <div>
          使用日平均值: <Switch value={useAvg} onChange={setUseAvg} />
        </div>

        <div>
          追溯计算天数：{' '}
          <Select
            style={{ width: 120 }}
            onChange={setPreDays}
            value={preDays}
            options={[
              { value: 3, label: '3 天' },
              { value: 7, label: '7 天' },
              { value: 14, label: '14 天' },
              { value: 30, label: '30 天' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
