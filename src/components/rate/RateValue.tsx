import { useEffect, useState } from 'react';
import { SldDecimal } from '../../util/decimal.ts';
import { oneTokenService } from '../../service/one_token.service.ts';
import { Subscription } from 'rxjs';
import { formatDatetime } from '../../util/time.ts';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './RateValue.module.scss';
import { StyleMerger } from '../../util/css.ts';

export type ExchangeRateValueProps = {
  snapshotAt: number;
};

export const ExchangeRateValue = ({ snapshotAt }: ExchangeRateValueProps) => {
  const [rate, setRate] = useState<SldDecimal | null>(null);
  const styleMr: StyleMerger = useStyleMr(styles);

  useEffect(() => {
    if (snapshotAt) {
      const sub: Subscription = oneTokenService.getExchangeRate(snapshotAt).subscribe({
        next: (theRate) => {
          setRate(theRate);
        },
      });

      return () => {
        sub.unsubscribe();
      };
    }
  }, [snapshotAt]);

  return (
    <div className={styleMr(styles.rateRow)}>
      {formatDatetime(snapshotAt)} : {rate == null ? '--' : rate.format({ fix: 18, removeZero: true })}
    </div>
  );
};
