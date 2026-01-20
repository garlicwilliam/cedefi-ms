import styles from './RatePreview.module.scss';
import { useApyPreviewData } from '../../hooks/apy-data/useApyData.ts';
import { now } from '../../util/time.ts';
import { useList } from '@refinedev/core';
import { RateSnapshot } from '../../service/types.ts';
import { Select } from 'antd';
import { useMemo, useState } from 'react';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';

function computeApyPeriod(curRate: number, baseRate: number, period: number) {
  const delta: number = curRate - baseRate;
  const r = delta / baseRate;
  const apyPeriod = Math.pow(1 + r, 365 / period) - 1;

  return apyPeriod * 100;
}

function useShotsOptions() {
  const { result, query } = useList({
    resource: 'rate_snapshots',
    sorters: [{ field: 'snapshotAt', order: 'desc' }],
    pagination: { pageSize: 24, currentPage: 1 },
  });

  const shots: RateSnapshot[] = result.data as RateSnapshot[];

  const options = shots.map((shot) => {
    const timeLabel: string = new Date(shot.snapshotAt * 1000).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    const rateLabel: string = shot.exchangeRate.toFixed(8);

    return {
      value: shot.exchangeRate,
      label: `${timeLabel} - ${rateLabel}`,
      display: rateLabel,
    };
  });

  return { shots, options, isLoading: query.isLoading };
}

export type RatePreviewProps = {
  inputRate?: number;
};

export function RatePreview({ inputRate }: RatePreviewProps) {
  const [shotRate, setShotRate] = useState<number>();
  const { base14DayRate, base14DayPeriod, apyHistory, period, periodBase } = useApyPreviewData(0);
  const nowDate: Date = new Date(Math.floor(now() / 86400) * 86400 * 1000);
  const { shots, options } = useShotsOptions();
  const styleMr = useStyleMr(styles);

  //
  const shotD14Apy = useMemo(() => {
    if (!shotRate || !base14DayRate) {
      return null;
    }

    return computeApyPeriod(shotRate, Number(base14DayRate.toNumeric()), base14DayPeriod);
  }, [shotRate, base14DayRate, base14DayPeriod]);

  //
  const shotPeriodApy = useMemo(() => {
    if (!shotRate || !periodBase) {
      return null;
    }

    return computeApyPeriod(shotRate, Number(periodBase.exchangeRate.toNumeric()), Number(period));
  }, [shotRate, periodBase, period]);

  //
  const viewD14Apy = useMemo(() => {
    if (!inputRate || !base14DayRate) {
      return null;
    }

    return computeApyPeriod(inputRate, Number(base14DayRate.toNumeric()), base14DayPeriod);
  }, [inputRate, base14DayRate, base14DayPeriod]);

  //
  const viewPeriodApy = useMemo(() => {
    if (!inputRate || !periodBase) {
      return null;
    }

    return computeApyPeriod(inputRate, Number(periodBase.exchangeRate.toNumeric()), Number(period));
  }, [inputRate, periodBase, period]);

  return (
    <div className={styleMr(styles.preview)}>
      <div className={styleMr(styles.rows, styles.head)}>
        <div className={styleMr(styles.time)}>Time</div>
        <div className={styleMr(styles.rate)}>Rate</div>
        <div className={styleMr(styles.apy)}>14D APY</div>
        <div className={styleMr(styles.apy)}>Period APY</div>
        <div className={styleMr(styles.period)}>Period</div>
      </div>

      {apyHistory.map((row) => {
        return (
          <div key={row.timestamp} className={styleMr(styles.rows, styles.data)}>
            <div className={styleMr(styles.time)}>
              {new Date(row.timestamp * 1000).toLocaleDateString(undefined, { timeZone: 'UTC' })}
            </div>
            <div className={styleMr(styles.rate)}>{row.exchangeRate.format({ fix: 6 })}</div>
            <div className={styleMr(styles.apy)}>{row.apyD14.percentFormat()}%</div>
            <div className={styleMr(styles.apy)}>{row.apyPeriod.percentFormat()}%</div>
            <div className={styleMr(styles.period)}>{row.periodDays} Days</div>
          </div>
        );
      })}

      <div className={styleMr(styles.rows, styles.shot)}>
        <div className={styleMr(styles.time)}>
          {nowDate.toLocaleDateString(undefined, { timeZone: 'UTC' })}
        </div>
        <div className={styleMr(styles.rate)}>
          <Select
            value={shotRate}
            options={options}
            onSelect={setShotRate}
            className={styleMr(styles.shotSelect)}
            optionLabelProp={'display'}
            popupMatchSelectWidth={false}
            classNames={{
              popup: {
                root: styleMr(styles.shotSelectDropdown),
              },
            }}
          />
        </div>
        <div className={styleMr(styles.apy)}>{shotD14Apy?.toFixed(2)}%</div>
        <div className={styleMr(styles.apy)}>{shotPeriodApy?.toFixed(2)}%</div>
        <div className={styleMr(styles.period)}>{period} Days</div>
      </div>

      <div className={styleMr(styles.rows, styles.view)}>
        <div className={styleMr(styles.time)}>
          {nowDate.toLocaleDateString(undefined, { timeZone: 'UTC' })}
        </div>
        <div className={styleMr(styles.rate)}>
          <span style={{ color: 'red' }}>{inputRate}</span>
        </div>
        <div className={styleMr(styles.apy)}>
          <span style={{ color: 'red' }}>{viewD14Apy?.toFixed(2)}%</span>
        </div>
        <div className={styleMr(styles.apy)}>
          <span style={{ color: 'red' }}>{viewPeriodApy?.toFixed(2)}%</span>
        </div>
        <div className={styleMr(styles.period)}>{period} Days</div>
      </div>
    </div>
  );
}
