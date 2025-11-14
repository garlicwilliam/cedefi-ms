import { formatDatetime } from '../../util/time.ts';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './RateValue.module.scss';
import { StyleMerger } from '../../util/css.ts';
import { useList } from '@refinedev/core';
import { RateSnapshot } from '../../service/types.ts';
import { ReloadOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';

export const ExchangeRateValue = () => {
  const { result, query } = useList({
    resource: 'rate_snapshots',
    sorters: [{ field: 'snapshotAt', order: 'desc' }],
    pagination: { pageSize: 5, currentPage: 1 },
  });

  const shots: RateSnapshot[] = result.data as RateSnapshot[];

  const styleMr: StyleMerger = useStyleMr(styles);
  const [isAction, setIsAction] = useState(false);

  const onRefresh = useCallback(() => {
    query.refetch();
    setIsAction(true);
    setTimeout(() => {
      setIsAction(false);
    }, 1000);
  }, [query]);

  return (
    <>
      <div className={styleMr(styles.titleBox)}>
        <div className={styleMr(styles.title)}>当前计算所得 Exchange Rate</div>
        <ReloadOutlined spin={query.isPending || query.isLoading || isAction} onClick={onRefresh} />
      </div>
      <div className={styleMr(styles.rateRow)}>
        {shots.map((shot: RateSnapshot) => {
          return (
            <div className={styleMr(styles.rateBox)}>
              <div>{formatDatetime(shot?.snapshotAt || 0)}</div>
              <div>{shot.exchangeRate.toString().trim()}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};
