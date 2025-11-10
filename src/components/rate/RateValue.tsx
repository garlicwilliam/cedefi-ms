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
    pagination: { pageSize: 1, currentPage: 1 },
  });

  const shot: RateSnapshot | null = result.data.length > 0 ? (result.data[0] as RateSnapshot) : null;
  const rate: number | null = shot?.exchangeRate || null;

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
    <div className={styleMr(styles.rateRow)}>
      {formatDatetime(shot?.snapshotAt || 0)} : {rate == null ? '--' : rate}{' '}
      <ReloadOutlined spin={query.isPending || query.isLoading || isAction} onClick={onRefresh} />
    </div>
  );
};
