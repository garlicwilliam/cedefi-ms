import { ReactNode } from 'react';
import { formatDateHour } from '../../util/time.ts';
import styles from './IndexCardValue.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';

type IndexCardValueProps = {
  value: ReactNode;
  time?: number;
};

export function IndexCardValue({ value, time }: IndexCardValueProps) {
  const styleMr = useStyleMr(styles);
  return (
    <div className={styleMr(styles.valBox)}>
      <div className={styleMr(styles.valStr)}>{value}</div>
      {time && <div className={styleMr(styles.timeStr)}>{formatDateHour(time)}</div>}
    </div>
  );
}
